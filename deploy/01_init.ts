import {BuidlerRuntimeEnvironment, DeployFunction} from '@nomiclabs/buidler/types';
import {ethers} from '@nomiclabs/buidler';
import {ethers as ethers2} from 'ethers';
import {getEnv, DEFAULT_ENV_ADDRESS} from '../utils/envutils';
import {weiAmountToString} from '../utils/ethutils';
import path from 'path';
import {parse} from 'querystring';

const {
  utils: {parseEther},
} = ethers2;

const env = getEnv(path.join(__dirname, '../.env'));
const {UNISWAPV2FACTORY_ADDRESS, DAI_ADDRESS, WETH_ADDRESS, UNISWAPV2ROUTERV2_ADDRESS} = env;
console.log(UNISWAPV2FACTORY_ADDRESS);
const func: DeployFunction = async function (bre: BuidlerRuntimeEnvironment) {
  const {deployer, user} = await bre.getNamedAccounts();
  const userSigner = await ethers.getSigner(user);
  // const {deploy} = bre.deployments;
  const useProxy = !bre.network.live;
  // Uniswap factory
  const uniFactory = await ethers.getContractAt('UniswapV2Factory', UNISWAPV2FACTORY_ADDRESS || DEFAULT_ENV_ADDRESS);
  // Dai ERC20
  const ERC20DAI = await ethers.getContractAt('ERC20', DAI_ADDRESS || DEFAULT_ENV_ADDRESS, userSigner);
  ERC20DAI.on('Transfer', (from, to, amount) =>
    console.log(`${weiAmountToString(amount)} Dai transfered from ${from} ${to}`)
  );
  // WETH ERC20
  const ERC20WETH = await ethers.getContractAt('ERC20', WETH_ADDRESS || DEFAULT_ENV_ADDRESS, userSigner);
  ERC20WETH.on('Transfer', (from, to, amount) =>
    console.log(`${weiAmountToString(amount)} WETH transfered from ${from} ${to}`)
  );
  // DAI/WETH Pool
  const daiwethAddress = await uniFactory.getPair(
    DAI_ADDRESS || DEFAULT_ENV_ADDRESS,
    WETH_ADDRESS || DEFAULT_ENV_ADDRESS
  );
  const UniPairWethDai = await ethers.getContractAt('UniswapV2Pair', daiwethAddress);
  const {_reserve0, _reserve1} = await UniPairWethDai.getReserves();
  const block = await ethers.provider.getBlockNumber();
  console.log('DEPLOYING FROM MAINNET FORK #Block: ', block);
  console.log('--------- ETH/DAI UNISWAP POOL');
  console.log('ETH Reserve: ', weiAmountToString(_reserve1));
  console.log('DAI Reserve: ', weiAmountToString(_reserve0));
  // Uni Router
  const uniRouter = await ethers.getContractAt(
    'UniswapV2Router02',
    UNISWAPV2ROUTERV2_ADDRESS || DEFAULT_ENV_ADDRESS,
    userSigner
  );

  // INIT
  console.log('--------------- INIT');
  let DaiBalance = weiAmountToString(await ERC20DAI.balanceOf(user));
  // const WethBalance = weiAmountToString(await ERC20WETH.balanceOf(user));
  let EthBalance = weiAmountToString(await userSigner.getBalance());
  console.log(`User has: ${DaiBalance} DAI and ${EthBalance} ETH`);

  // Get Dai to user
  console.log('------------ UNISWAP ETH => DAI');
  await uniRouter.swapExactETHForTokens('0', [WETH_ADDRESS, DAI_ADDRESS], user, 162156100447, {
    gasLimit: 300000,
    value: parseEther('2000'),
  });
  DaiBalance = weiAmountToString(await ERC20DAI.balanceOf(user));
  // const WethBalance = weiAmountToString(await ERC20WETH.balanceOf(user));
  EthBalance = weiAmountToString(await userSigner.getBalance());
  console.log(`User has now: ${DaiBalance} DAI and ${EthBalance} ETH`);

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
  DaiBalance = weiAmountToString(await ERC20DAI.balanceOf(user));
  // const WethBalance = weiAmountToString(await ERC20WETH.balanceOf(user));
  EthBalance = weiAmountToString(await userSigner.getBalance());
  const UniLPBalance = weiAmountToString(await UniPairWethDai.balanceOf(user));
  console.log(`User has now: ${DaiBalance} DAI and ${EthBalance} ETH and some LP tokens: ${UniLPBalance}`);
  return !useProxy; // when live network, record the script as executed to prevent rexecution
};
export default func;
