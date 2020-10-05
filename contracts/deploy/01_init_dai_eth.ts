import {
  BuidlerRuntimeEnvironment,
  DeployFunction,
} from "@nomiclabs/buidler/types";
import {ethers} from "@nomiclabs/buidler";
import {ethers as ethers2} from "ethers";
import {getEnv, DEFAULT_ENV_ADDRESS} from "../utils/envutils";
import {weiAmountToString} from "../utils/ethutils";
import path from "path";

const {
  utils: {parseEther},
} = ethers2;

const env = getEnv(path.join(__dirname, "../.env"));
const {
  UNISWAPV2FACTORY_ADDRESS,
  DAI_ADDRESS,
  WETH_ADDRESS,
  UNISWAPV2ROUTERV2_ADDRESS,
} = env;
console.log(UNISWAPV2FACTORY_ADDRESS);
const func: DeployFunction = async function (bre: BuidlerRuntimeEnvironment) {
  const {deployer, user} = await bre.getNamedAccounts();
  const userSigner = await ethers.getSigner(user);
  const deployerSigner = await ethers.getSigner(deployer);
  const {deploy} = bre.deployments;
  const useProxy = !bre.network.live;
  // Uniswap factory, DAI, WETH from mainnet fork
  const uniFactory = await ethers.getContractAt(
    "UniswapV2Factory",
    UNISWAPV2FACTORY_ADDRESS || DEFAULT_ENV_ADDRESS
  );
  const ERC20DAI = await ethers.getContractAt(
    "ERC20",
    DAI_ADDRESS || DEFAULT_ENV_ADDRESS,
    deployerSigner
  );
  const ERC20WETH = await ethers.getContractAt(
    "ERC20",
    WETH_ADDRESS || DEFAULT_ENV_ADDRESS,
    deployerSigner
  );
  // DAI/WETH Pool
  const daiwethAddress = await uniFactory.getPair(
    DAI_ADDRESS || DEFAULT_ENV_ADDRESS,
    WETH_ADDRESS || DEFAULT_ENV_ADDRESS
  );
  const UniPairWethDai = await ethers.getContractAt(
    "UniswapV2Pair",
    daiwethAddress,
    deployerSigner
  );
  const {_reserve0, _reserve1} = await UniPairWethDai.getReserves();
  const block = await ethers.provider.getBlockNumber();
  console.log("DEPLOYING FROM MAINNET FORK #Block: ", block);
  console.log("------------ ETH/DAI UNISWAP POOL");
  console.log("ETH Reserve: ", weiAmountToString(_reserve1));
  console.log("DAI Reserve: ", weiAmountToString(_reserve0));

  // Uni Router
  const uniRouter = await ethers.getContractAt(
    "UniswapV2Router02",
    UNISWAPV2ROUTERV2_ADDRESS || DEFAULT_ENV_ADDRESS,
    deployerSigner
  );

  // INIT
  console.log(`------------ USER: ${deployer}`);
  // Get Dai to user
  console.log("------------ SWAPING 2000 ETH => DAI");
  await uniRouter.swapExactETHForTokens(
    "0",
    [WETH_ADDRESS, DAI_ADDRESS],
    deployer,
    162156100447,
    {
      gasLimit: 300000,
      value: parseEther("2000"),
    }
  );
  // User add liquidity to WETH/DAI
  console.log("------------ ADDING WETH/DAI LIQUIDITY");
  await (
    await ERC20DAI.approve(uniRouter.address, parseEther("20000000000"))
  ).wait();
  await uniRouter.addLiquidityETH(
    DAI_ADDRESS,
    parseEther("300000"),
    parseEther("200000"),
    parseEther("500"),
    deployer,
    162156100447,
    {
      value: parseEther("1000"),
    }
  );
  const [DaiBalance, EthBalance, UniLPBalance] = [
    await ERC20DAI.balanceOf(deployer),
    await deployerSigner.getBalance(),
    await UniPairWethDai.balanceOf(deployer),
  ].map(weiAmountToString);
  console.log(
    `User has now: ${DaiBalance} DAI and ${EthBalance} ETH and some LP tokens: ${UniLPBalance}`
  );
  console.log("------------ DEPLOYING STOPLOSS FACTORY");
  await deploy("SLFactory", {
    from: deployer,
    proxy: false,
    args: [UNISWAPV2FACTORY_ADDRESS, WETH_ADDRESS],
    log: true,
  });
  const SLfactory = await ethers.getContract("SLFactory");
  await SLfactory.on(
    "PoolCreated",
    (token0, token1, pair, pool, oracle, uint) => {
      console.log(`
    STOP LOSS Pool #${uint} created: ${pool}
    Token 1 ${token0} 
    Token 2 ${token1}
    Uniswap Pair: ${pair}
    StopLoss Oracle: ${oracle}
    `);
    }
  );

  console.log("------------ DEPLOYING STOPLOSS ORACLE FOR WETH/DAI");
  await deploy("SLOracle", {
    from: deployer,
    proxy: false,
    args: [UNISWAPV2FACTORY_ADDRESS, DAI_ADDRESS, WETH_ADDRESS],
    log: true,
  });
  const SLOracle = await ethers.getContract("SLOracle");
  await new Promise((res) => {
    setTimeout(() => {
      return res();
    }, 11000);
  });
  console.log("------------CREATING NEW SWAP EVENT FOR ORACLE TO UPDATE");
  await (
    await uniRouter.swapExactETHForTokens(
      "0",
      [WETH_ADDRESS, DAI_ADDRESS],
      deployer,
      162156100447,
      {
        gasLimit: 300000,
        value: parseEther("2000"),
      }
    )
  ).wait();

  console.log("------------ CREATING STOP LOSS POOL WETH/DAI");
  const txCreatePool = await SLfactory.createPool(
    WETH_ADDRESS,
    DAI_ADDRESS,
    SLOracle.address
  );
  await txCreatePool.wait();
  const poolAddress = await SLfactory.getPoolFromPair(UniPairWethDai.address);
  const SLPool = await ethers.getContractAt(
    "SLPool",
    poolAddress,
    deployerSigner
  );
  await SLPool.on("StopLoss", (uniPair, orderer, lpamount, token, ratio) => {
    console.log(`
    StopLoss Ordered UniPair: ${uniPair}
    0rderer: ${orderer}
    LP Amount sent: ${lpamount / 10 ** 18}
    Token to guarantee: ${token}
    Amount to guarantee: ${lpamount / 10 ** 18}
    Strike ratio: ${ratio / 10 ** 6}
    `);
  });
  console.log(`------------ USER ${deployer} ORDERING STOPLOSS`);
  await UniPairWethDai.approve(poolAddress, parseEther("3000000000"));
  const txAddOrder = await SLPool.stopLoss(
    parseEther("1000"),
    DAI_ADDRESS,
    parseEther("300")
  );
  await txAddOrder.wait();
  await new Promise((res) => {
    setTimeout(() => {
      return res();
    }, 2200);
  });

  let priceA = await SLPool.priceA();
  let reserveA = await SLPool.reserveA();
  let reserveB = await SLPool.reserveB();
  let lastRatioA = await SLPool.lastRatioA();
  let lastRatioB = await SLPool.lastRatioB();
  console.log("current price A from SL Pool: ", weiAmountToString(priceA));
  console.log("current reserve A from SL Pool: ", weiAmountToString(reserveA));
  console.log("current reserve B from SL Pool: ", weiAmountToString(reserveB));
  console.log("Last Ratio A from SL Pool: ", lastRatioA.toString());
  console.log("Last Ratio B from SL Pool: ", lastRatioB.toString());
  console.log("------------CREATING NEW SWAP EVENT FOR ORACLE TO UPDATE");
  await (
    await uniRouter.swapExactETHForTokens(
      "0",
      [WETH_ADDRESS, DAI_ADDRESS],
      deployer,
      162156100447,
      {
        gasLimit: 300000,
        value: parseEther("2000"),
      }
    )
  ).wait();
  await new Promise((res) => {
    setTimeout(() => {
      return res();
    }, 11000);
  });
  console.log(`------------ USER ${deployer} ORDERING BEW STOPLOSS`);
  await UniPairWethDai.approve(poolAddress, parseEther("3000000000"));
  const txAddOrder2 = await SLPool.stopLoss(
    parseEther("100"),
    DAI_ADDRESS,
    parseEther("30")
  );
  await txAddOrder2.wait();
  priceA = await SLPool.priceA();
  reserveA = await SLPool.reserveA();
  reserveB = await SLPool.reserveB();
  lastRatioA = await SLPool.lastRatioA();
  lastRatioB = await SLPool.lastRatioB();
  console.log("new reserve A from SL Pool: ", weiAmountToString(reserveA));
  console.log("new reserve B from SL Pool: ", weiAmountToString(reserveB));
  console.log("new price A from SL Pool: ", weiAmountToString(priceA));
  console.log("Last Ratio A from SL Pool: ", lastRatioA.toString());
  console.log("Last Ratio B from SL Pool: ", lastRatioB.toString());
  await new Promise((res) => {
    setTimeout(() => {
      return res();
    }, 2200);
  });

  return !useProxy; // when live network, record the script as executed to prevent rexecution
};
export default func;
