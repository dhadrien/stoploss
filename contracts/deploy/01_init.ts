import {BuidlerRuntimeEnvironment, DeployFunction} from '@nomiclabs/buidler/types';
import {ethers} from '@nomiclabs/buidler';
import {ethers as ethers2} from 'ethers';
import {getEnv, DEFAULT_ENV_ADDRESS} from '../utils/envutils';
import {weiAmountToString} from '../utils/ethutils';
import path from 'path';

const {
  utils: {parseEther},
} = ethers2;

// 1 Billion Tokens
const INIT_TOKEN_SUPPLY = parseEther('1000000000');
const INIT_LIQUIDITY = parseEther('10000');
const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
const INFINITE_DEADLINE= 1000000000000000000

const env = getEnv(path.join(__dirname, '../.env'));
const {UNISWAPV2FACTORY_ADDRESS, DAI_ADDRESS, WETH_ADDRESS, UNISWAPV2ROUTERV2_ADDRESS} = env;
const func: DeployFunction = async function (bre: BuidlerRuntimeEnvironment) {
  const {deployer} = await bre.getNamedAccounts();
  const deployerSigner = await ethers.getSigner(deployer);
  const {deploy} = bre.deployments;
  // Uniswap factory, DAI, WETH from mainnet fork
  const uniFactory = await ethers.getContractAt('UniswapV2Factory', UNISWAPV2FACTORY_ADDRESS || DEFAULT_ENV_ADDRESS, deployerSigner);
  console.log('------------ DEPLOYING ERC20 TOKEN: STP');
  await deploy('STP', {contract: 'ERC20Log', from: deployer, proxy: false, args: [INIT_TOKEN_SUPPLY, 'Stop Loss Token', 'STP'], log: true});
  const STPToken = await ethers.getContract('STP', deployerSigner);
  console.log('------------ DEPLOYING ERC20 TOKEN: Fake WETH (FWETH)');
  await deploy('FWETH', {contract: 'ERC20Log', from: deployer, proxy: false, args: [INIT_TOKEN_SUPPLY, 'Stop Loss Token', 'FWETH'], log: true});
  const FWETH = await ethers.getContract('FWETH', deployerSigner);
  console.log('------------ CREATING UNISWAP PAIR: FWETH/STP');
  let pairAddress = await uniFactory.getPair(STPToken.address, FWETH.address);
  if(pairAddress === NULL_ADDRESS) {
    await (await uniFactory.createPair(STPToken.address, FWETH.address)).wait()
    pairAddress = await uniFactory.getPair(STPToken.address, FWETH.address);
    console.log('Pair Created: ', pairAddress);
  } else console.log('Pair already created in previous deployment: ', pairAddress);
  console.log('------------ ADDING INITIAL LIQUIDITY');
  const pair = await ethers.getContractAt('UniswapV2Pair', pairAddress, deployerSigner);
  const uniRouter = await ethers.getContractAt(
    'UniswapV2Router02',
    UNISWAPV2ROUTERV2_ADDRESS || DEFAULT_ENV_ADDRESS,
    deployerSigner
  );
  // await uniRouter.addLiquidity(FWETH.address, STPToken.address, INIT_LIQUIDITY, INIT_LIQUIDITY, INIT_LIQUIDITY, INIT_LIQUIDITY, deployer, INFINITE_DEADLINE, {dkzalzamk: "haha" })


  // // INIT
  // console.log(`------------ USER: ${user}`);
  // // Get Dai to user
  // console.log('------------ SWAPING 2000 ETH => DAI');
  // await uniRouter.swapExactETHForTokens('0', [WETH_ADDRESS, DAI_ADDRESS], user, 162156100447, {
  //   gasLimit: 300000,
  //   value: parseEther('2000'),
  // });
  // // User add liquidity to WETH/DAI
  // console.log('------------ ADDING WETH/DAI LIQUIDITY');
  // await (await ERC20DAI.approve(uniRouter.address, parseEther('20000000000'))).wait();
  // await uniRouter.addLiquidityETH(
  //   DAI_ADDRESS,
  //   parseEther('300000'),
  //   parseEther('200000'),
  //   parseEther('500'),
  //   user,
  //   162156100447,
  //   {
  //     value: parseEther('1000'),
  //   }
  // );
  // const [DaiBalance, EthBalance, UniLPBalance] = [
  //   await ERC20DAI.balanceOf(user),
  //   await userSigner.getBalance(),
  //   await UniPairWethDai.balanceOf(user)
  // ].map(weiAmountToString);
  // console.log(`User has now: ${DaiBalance} DAI and ${EthBalance} ETH and some LP tokens: ${UniLPBalance}`);
  // console.log('------------ DEPLOYING STOPLOSS FACTORY');
  // await deploy('SLFactory', {from: deployer, proxy: false, args: [UNISWAPV2FACTORY_ADDRESS], log: true});
  // const SLfactory = await ethers.getContract('SLFactory');
  // await SLfactory.on('PoolCreated', (token0, token1, pair, pool, uint) =>{
  //   console.log(`
  //   STOP LOSS Pool #${uint} created: ${pool}
  //   Token 1 ${token0} 
  //   Token 2 ${token1}
  //   Uniswap Pair: ${pair}
  //   `)
  // })
  
  // console.log('------------ CREATING STOP LOSS POOL WETH/DAI');
  // const txCreatePool = await SLfactory.createPool(WETH_ADDRESS, DAI_ADDRESS);
  // await txCreatePool.wait();
  // const poolAddress = await SLfactory.getPoolFromPair(UniPairWethDai.address);
  // const SLPool = await ethers.getContractAt('SLPool', poolAddress, userSigner);
  // await SLPool.on('StopLoss', (uniPair, orderer, lpamount, token, amount) =>{
  //   console.log(`
  //   StopLoss Ordered UniPair: ${uniPair}
  //   0rderer: ${orderer} 
  //   LP Amount sent: ${lpamount}
  //   Token to guarantee: ${token}
  //   Amount to guarantee: ${amount}
  //   `)
  // })
  // console.log(`------------ USER ${user} ORDERING STOPLOSS`)
  // await UniPairWethDai.approve(poolAddress, parseEther('3000000000'));
  // const txAddOrder = await SLPool.stopLoss(parseEther('1000'), DAI_ADDRESS, parseEther('300'));
  // await txAddOrder.wait();
  
  

  return false; // when live network, record the script as executed to prevent rexecution
};
export default func;
