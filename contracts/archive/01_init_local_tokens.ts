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

// 1 Billion Tokens
const INIT_TOKEN_SUPPLY = parseEther("1000000000");
const INIT_LIQUIDITY = parseEther("100000");
const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
const INFINITE_DEADLINE = 262156100447;

const env = getEnv(path.join(__dirname, "../.env"));
const {UNISWAPV2FACTORY_ADDRESS, UNISWAPV2ROUTERV2_ADDRESS} = env;
const func: DeployFunction = async function (bre: BuidlerRuntimeEnvironment) {
  const {deployer, user} = await bre.getNamedAccounts();
  const deployerSigner = await ethers.getSigner(deployer);
  const {deploy} = bre.deployments;
  // Uniswap factory, DAI, WETH from mainnet fork
  const uniFactory = await ethers.getContractAt(
    "UniswapV2Factory",
    UNISWAPV2FACTORY_ADDRESS || DEFAULT_ENV_ADDRESS,
    deployerSigner
  );
  console.log("------------ DEPLOYING ERC20 TOKEN: STP");
  await deploy("STP", {
    contract: "ERC20Log",
    from: deployer,
    proxy: false,
    args: [INIT_TOKEN_SUPPLY, "Stop Loss Token", "STP"],
    log: true,
  });
  const STPToken = await ethers.getContract("STP", deployerSigner);
  console.log("------------ DEPLOYING ERC20 TOKEN: Fake WETH (FWETH)");
  await deploy("FWETH", {
    contract: "ERC20Log",
    from: deployer,
    proxy: false,
    args: [INIT_TOKEN_SUPPLY, "Stop Loss Token", "FWETH"],
    log: true,
  });
  const FWETH = await ethers.getContract("FWETH", deployerSigner);
  console.log("------------ CREATING UNISWAP PAIR: FWETH/STP");
  let pairAddress = await uniFactory.getPair(STPToken.address, FWETH.address);
  if (pairAddress === NULL_ADDRESS) {
    await (await uniFactory.createPair(STPToken.address, FWETH.address)).wait();
    pairAddress = await uniFactory.getPair(STPToken.address, FWETH.address);
    console.log("Pair Created: ", pairAddress);
  } else
    console.log("Pair already created in previous deployment: ", pairAddress);
  console.log("------------ ADDING INITIAL LIQUIDITY");
  const pair = await ethers.getContractAt(
    "UniswapV2Pair",
    pairAddress,
    deployerSigner
  );
  const uniRouter = await ethers.getContractAt(
    "UniswapV2Router02",
    UNISWAPV2ROUTERV2_ADDRESS || DEFAULT_ENV_ADDRESS,
    deployerSigner
  );
  const {_reserve0: res0, _reserve1: res1} = await pair.getReserves();
  const [reserveBefore1, reserveBefore2] = [res0, res1].map(weiAmountToString);
  console.log("FWETH/STP UNISWAP POOL");
  console.log("FWETH Reserve before: ", reserveBefore1);
  console.log("STP Reserve before: ", reserveBefore2);
  if (reserveBefore1 === reserveBefore2 && reserveBefore2 === "0") {
    await (await FWETH.approve(uniRouter.address, INIT_TOKEN_SUPPLY)).wait();
    console.log("deployer approved FWET");
    await (await STPToken.approve(uniRouter.address, INIT_TOKEN_SUPPLY)).wait();
    console.log("deployer approved FSTP");
    await (
      await uniRouter.addLiquidity(
        FWETH.address,
        STPToken.address,
        INIT_LIQUIDITY,
        INIT_LIQUIDITY,
        parseEther("1"),
        parseEther("1"),
        deployer,
        INFINITE_DEADLINE,
        {
          gasLimit: 900000,
        }
      )
    ).wait();
    const {_reserve0: res0A, _reserve1: res1A} = await pair.getReserves();
    console.log("FWETH/STP UNISWAP POOL");
    console.log("FWETH Reserve after: ", weiAmountToString(res0A));
    console.log("STP Reserve after: ", weiAmountToString(res1A));
  } else console.log("Liquidity already exist, no need to add more");
  const deployerLpBalance = await pair.balanceOf(deployer);
  console.log(
    "deployer has LP balance of: ",
    weiAmountToString(deployerLpBalance)
  );

  console.log("------------ DEPLOYING STOPLOSS FACTORY");
  await deploy("SLFactory", {
    from: deployer,
    proxy: false,
    args: [UNISWAPV2FACTORY_ADDRESS],
    log: true,
  });
  const SLfactory = await ethers.getContract("SLFactory");
  await SLfactory.on("PoolCreated", (token0, token1, pair, pool, uint) => {
    console.log(`
    STOP LOSS Pool #${uint} created: ${pool}
    Token 1 ${token0}
    Token 2 ${token1}
    Uniswap Pair: ${pair}
    `);
  });

  console.log("------------ CREATING STOP LOSS POOL FOR THE STP/FWETH PAIR");
  const txCreatePool = await SLfactory.createPool(
    FWETH.address,
    STPToken.address
  );
  await txCreatePool.wait();
  const poolAddress = await SLfactory.getPoolFromPair(pair.address);
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
  await new Promise((res) => {
    setTimeout(() => {
      return res();
    }, 2200);
  });
  console.log(`------------ USER ${user} ORDERING STOPLOSS`);
  await pair.approve(poolAddress, INIT_TOKEN_SUPPLY);
  const txAddOrder = await SLPool.stopLoss(
    parseEther("1000"),
    STPToken.address,
    parseEther("900"),
    {
      gasLimit: 1200000,
    }
  );
  await txAddOrder.wait();
  // await SLfactory.getPoolFromPair(pair.address);
  await new Promise((res) => {
    setTimeout(() => {
      return res();
    }, 2200);
  });
  return false; // when live network, record the script as executed to prevent rexecution
};
export default func;
