import {BuidlerRuntimeEnvironment, DeployFunction} from '@nomiclabs/buidler/types';
import {ethers} from '@nomiclabs/buidler';
import {ethers as ethers2} from 'ethers';
import {getEnv, DEFAULT_ENV_ADDRESS} from '../utils/envutils';
import {weiAmountToString} from '../utils/ethutils';
import path from 'path';

const {
  utils: {parseEther},
} = ethers2;

const env = getEnv(path.join(__dirname, '../.env'));
const {UNISWAPV2FACTORY_ADDRESS, DAI_ADDRESS, WETH_ADDRESS, UNISWAPV2ROUTERV2_ADDRESS} = env;
console.log(UNISWAPV2FACTORY_ADDRESS);
const func: DeployFunction = async function (bre: BuidlerRuntimeEnvironment) {
  const {deployer, user} = await bre.getNamedAccounts();
  const userSigner = await ethers.getSigner(user);
  const {deploy} = bre.deployments;
  const useProxy = !bre.network.live;
  // Uniswap factory, DAI, WETH from mainnet fork
  const uniFactory = await ethers.getContractAt('UniswapV2Factory', UNISWAPV2FACTORY_ADDRESS || DEFAULT_ENV_ADDRESS);
  const ERC20DAI = await ethers.getContractAt('ERC20', DAI_ADDRESS || DEFAULT_ENV_ADDRESS, userSigner);
  const ERC20WETH = await ethers.getContractAt('ERC20', WETH_ADDRESS || DEFAULT_ENV_ADDRESS, userSigner);
  // DAI/WETH Pool
  const daiwethAddress = await uniFactory.getPair(
    DAI_ADDRESS || DEFAULT_ENV_ADDRESS,
    WETH_ADDRESS || DEFAULT_ENV_ADDRESS
  );
  const UniPairWethDai = await ethers.getContractAt('UniswapV2Pair', daiwethAddress, userSigner);
  const {_reserve0, _reserve1} = await UniPairWethDai.getReserves();
  const block = await ethers.provider.getBlockNumber();
  console.log('DEPLOYING FROM MAINNET FORK #Block: ', block);
  console.log('------------ ETH/DAI UNISWAP POOL');
  console.log('ETH Reserve: ', weiAmountToString(_reserve1));
  console.log('DAI Reserve: ', weiAmountToString(_reserve0));
  
  // Uni Router
  const uniRouter = await ethers.getContractAt(
    'UniswapV2Router02',
    UNISWAPV2ROUTERV2_ADDRESS || DEFAULT_ENV_ADDRESS,
    userSigner
  );

  // INIT
  console.log(`------------ USER: ${user}`);
  // Get Dai to user
  console.log('------------ SWAPING 2000 ETH => DAI');
  await uniRouter.swapExactETHForTokens('0', [WETH_ADDRESS, DAI_ADDRESS], user, 162156100447, {
    gasLimit: 300000,
    value: parseEther('2000'),
  });
  // User add liquidity to WETH/DAI
  console.log('------------ ADDING WETH/DAI LIQUIDITY');
  await (await ERC20DAI.approve(uniRouter.address, parseEther('20000000000'))).wait();
  await uniRouter.addLiquidityETH(
    DAI_ADDRESS,
    parseEther('300000'),
    parseEther('200000'),
    parseEther('500'),
    user,
    162156100447,
    {
      value: parseEther('1000'),
    }
  );
  const [DaiBalance, EthBalance, UniLPBalance] = [
    await ERC20DAI.balanceOf(user),
    await userSigner.getBalance(),
    await UniPairWethDai.balanceOf(user)
  ].map(weiAmountToString);
  console.log(`User has now: ${DaiBalance} DAI and ${EthBalance} ETH and some LP tokens: ${UniLPBalance}`);
  console.log('------------ DEPLOYING STOPLOSS FACTORY');
  await deploy('SLFactory', {from: deployer, proxy: false, args: [UNISWAPV2FACTORY_ADDRESS], log: true});
  const SLfactory = await ethers.getContract('SLFactory');
  await SLfactory.on('PoolCreated', (token0, token1, pair, pool, uint) =>{
    console.log(`
    STOP LOSS Pool #${uint} created: ${pool}
    Token 1 ${token0} 
    Token 2 ${token1}
    Uniswap Pair: ${pair}
    `)
  })
  
  console.log('------------ CREATING STOP LOSS POOL WETH/DAI');
  const txCreatePool = await SLfactory.createPool(WETH_ADDRESS, DAI_ADDRESS);
  await txCreatePool.wait();
  const poolAddress = await SLfactory.getPoolFromPair(UniPairWethDai.address);
  const SLPool = await ethers.getContractAt('SLPool', poolAddress, userSigner);
  await SLPool.on('StopLoss', (uniPair, orderer, lpamount, token, amount) =>{
    console.log(`
    StopLoss Ordered UniPair: ${uniPair}
    0rderer: ${orderer} 
    LP Amount sent: ${lpamount}
    Token to guarantee: ${token}
    Amount to guarantee: ${amount}
    `)
  })
  console.log(`------------ USER ${user} ORDERING STOPLOSS`)
  await UniPairWethDai.approve(poolAddress, parseEther('3000000000'));
  const txAddOrder = await SLPool.stopLoss(parseEther('1000'), DAI_ADDRESS, parseEther('300'));
  await txAddOrder.wait();
  

  return !useProxy; // when live network, record the script as executed to prevent rexecution
};
export default func;
