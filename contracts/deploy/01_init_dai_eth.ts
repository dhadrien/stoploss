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
  console.log(`
  😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈
  😈STOP LOSS DEPLOYMENT
  😈Deployer: ${deployer}
  😈User: ${user}       
  😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈
  `);
  // Uniswap factory, DAI, WETH from mainnet fork
  const uniFactory = await ethers.getContractAt(
    "UniswapV2Factory",
    UNISWAPV2FACTORY_ADDRESS || DEFAULT_ENV_ADDRESS
  );
  let ERC20DAI = await ethers.getContractAt(
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
  let UniPairWethDai = await ethers.getContractAt(
    "UniswapV2Pair",
    daiwethAddress
  );
  await UniPairWethDai.on(
    "Swap",
    (sender, amount0In, amount1In, amount0Out, amount1out, to) => {
      console.log(`
    SWAP EVENT from ${sender} to ${to}
    Token 1 in: ${weiAmountToString(amount0In)} out ${weiAmountToString(amount0Out)}
    Token 2 in: ${weiAmountToString(amount1In)} out ${weiAmountToString(amount1out)}
    `);
    }
  );

  const {_reserve0, _reserve1} = await UniPairWethDai.getReserves();
  const block = await ethers.provider.getBlockNumber();
  console.log("DEPLOYING FROM MAINNET FORK #Block: ", block);
  console.log("------------ ETH/DAI UNISWAP POOL");
  console.log("ETH Reserve: ", weiAmountToString(_reserve1));
  console.log("DAI Reserve: ", weiAmountToString(_reserve0));

  // Uni Router
  let uniRouter = await ethers.getContractAt(
    "UniswapV2Router02",
    UNISWAPV2ROUTERV2_ADDRESS || DEFAULT_ENV_ADDRESS,
    deployerSigner
  );

  // INIT
  console.log(`------------ DEPLOYER: ${deployer}`);
  // Get Dai to user
  console.log("------------ [DEPLOYER] SWAPING 2000 ETH => DAI");
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
  console.log("------------ [DEPLOYER] ADDING WETH/DAI LIQUIDITY");
  await (
    await ERC20DAI.approve(uniRouter.address, parseEther("20000000000"))
  ).wait();
  await (
    await uniRouter.addLiquidityETH(
      DAI_ADDRESS,
      parseEther("300000"), /// 300 000 DAI
      parseEther("200000"),
      parseEther("500"),
      deployer,
      162156100447,
      {
        value: parseEther("1000"),
      }
    )
  ).wait();
  console.log("------------ [DEPLOYER] SENDING 60 000 DAI TO USER");
  await (await ERC20DAI.transfer(user, parseEther("60000"))).wait();

  const [DaiBalance, EthBalance, UniLPBalance] = [
    await ERC20DAI.balanceOf(user),
    await userSigner.getBalance(),
    await UniPairWethDai.balanceOf(user),
  ].map(weiAmountToString);
  console.log(
    `User has now: ${DaiBalance} DAI and ${EthBalance} ETH and some LP tokens: ${UniLPBalance}`
  );
  console.log("------------ DEPLOYING STOPLOSS FACTORY");
  await deploy("SLFactory", {
    from: deployer,
    proxy: false,
    args: [UNISWAPV2FACTORY_ADDRESS, WETH_ADDRESS, uniRouter.address],
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
  let SLPool = await ethers.getContractAt(
    "SLPool",
    poolAddress,
    deployerSigner
  );
  await SLPool.on(
    "StopLoss",
    (uniPair, length, orderer, lpamount, token, ratio) => {
      if (orderer === user)
    console.log(`
    StopLoss Ordered #${length}, UniPair: ${uniPair}
    0rderer: ${orderer}
    LP Amount sent: ${lpamount / 10 ** 18}
    Token to guarantee: ${token}
    Amount to guarantee: ${lpamount / 10 ** 18}
    LP/Amount to guarantee ratio: ${ratio}
    `);
    }
  );
  // User add liquidity to WETH/DAI
  console.log("------------[USER] ADDING WETH/DAI LIQUIDITY");
  uniRouter = await uniRouter.connect(userSigner);
  ERC20DAI = ERC20DAI.connect(userSigner);
  SLPool = await SLPool.connect(userSigner);
  await (
    await ERC20DAI.approve(uniRouter.address, parseEther("20000000000"))
  ).wait();
  await (
    await uniRouter.addLiquidityETH(
      DAI_ADDRESS,
      parseEther("60000"), /// 300 000 DAI
      parseEther("100"),
      parseEther("100"),
      user,
      162156100447,
      {
        value: parseEther("300"),
      }
    )
  ).wait();
  const [DaiBalanceUser, EthBalanceUser, UniLPBalanceUser] = [
    await ERC20DAI.balanceOf(user),
    await userSigner.getBalance(),
    await UniPairWethDai.balanceOf(user),
  ];
  console.log(
    `User has now: ${DaiBalanceUser} DAI and ${EthBalanceUser} ETH and some LP tokens: ${UniLPBalanceUser}`
  );
  console.log(`------------[USER] ${user} ORDERING STOPLOSS`);
  UniPairWethDai = await UniPairWethDai.connect(userSigner);
  await UniPairWethDai.approve(poolAddress, parseEther("3000000000"));
  const txAddOrder = await SLPool.stopLoss(
    UniLPBalanceUser,
    DAI_ADDRESS,
    parseEther("50000")
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
  console.log("------------DUMPING ETH PRICE VIA SWAP ");
  uniRouter = uniRouter.connect(deployerSigner);
  await (
    await uniRouter.swapExactETHForTokens(
      "0",
      [WETH_ADDRESS, DAI_ADDRESS],
      deployer,
      162156100447,
      {
        gasLimit: 300000,
        value: parseEther("100000"),
      }
    )
  ).wait();
  await new Promise((res) => {
    setTimeout(() => {
      return res();
    }, 11000);
  });
  console.log(`------------ [DEPLOYER] ${deployer} UPDATING PRICE`);
  UniPairWethDai = await UniPairWethDai.connect(deployerSigner);
  SLPool = await SLPool.connect(deployerSigner);
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
  console.log(`------------ [DEPLOYER] TRYING TO LIQUIDATE USER STOPLOSS`);
  // await (await SLPool.executeStopLoss(0, DAI_ADDRESS)).wait();
  // const [DaiBalanceUserF, EthBalanceUserF, UniLPBalanceUserF] = [
  //   await ERC20DAI.balanceOf(user),
  //   await userSigner.getBalance(),
  //   await UniPairWethDai.balanceOf(user),
  // ];
  // console.log(
  //   `User has now: ${DaiBalanceUserF} DAI and ${EthBalanceUserF} ETH and some LP tokens: ${UniLPBalanceUserF}`
  // );

  return !useProxy; // when live network, record the script as executed to prevent rexecution
};
export default func;
