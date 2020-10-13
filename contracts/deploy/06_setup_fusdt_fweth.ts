import {
  BuidlerRuntimeEnvironment,
  DeployFunction,
} from "@nomiclabs/buidler/types";
import {ethers} from "@nomiclabs/buidler";
import {ethers as ethers2} from "ethers";

const {
  utils: {parseEther},
} = ethers2;

import {logStep} from "../utils/slutils";
import {weiAmountToString} from "../utils/ethutils";
import {
  NULL_ADDRESS,
  INIT_ETH_LIQUIDITY,
  INIT_DAI_LIQUIDITY,
  INIT_TOKEN_SUPPLY,
  INFINITE_DEADLINE,
} from "../utils/envutils";

const func: DeployFunction = async function (bre: BuidlerRuntimeEnvironment) {
  const {deployer, user} = await bre.getNamedAccounts();
  const deployerSigner = await ethers.getSigner(deployer);
  const {deploy, save, getArtifact} = bre.deployments;
  const useProxy = !bre.network.live;
  const FWETH = await ethers.getContract("FWETH");
  const FUSDT = await ethers.getContract("FUSDT");
  const uniRouter = await ethers.getContract(
    "UniswapV2Router02",
    deployerSigner
  );
  const uniFactory = await ethers.getContract(
    "UniswapV2Factory",
    deployerSigner
  );
  const SLfactory = await ethers.getContract("SLFactory", deployerSigner);

  console.log(`
----------
06 SETUP FUSDT/FWETH
----------
  `);
  // Contract needed
  logStep("DEPLOYING UNISWAP V2 PAIR FUSDT/FWET");
  let pairAddress = await uniFactory.getPair(FUSDT.address, FWETH.address);
  if (pairAddress === NULL_ADDRESS) {
    await (await uniFactory.createPair(FUSDT.address, FWETH.address)).wait();
    pairAddress = await uniFactory.getPair(FUSDT.address, FWETH.address);
    console.log("Pair Created: ", pairAddress);
  } else
    console.log("Pair already created in previous deployment: ", pairAddress);
  const uniPairArtifact = await getArtifact("UniswapV2Pair");
  save("UniPairFUSDTFWETH", {abi: uniPairArtifact.abi, address: pairAddress});
  const uniPair = await ethers.getContractAt("UniswapV2Pair", pairAddress);
  logStep("ADDING INITIAL LIQUIDITY");
  const {_reserve0: res0, _reserve1: res1} = await uniPair.getReserves();
  const [reserveBefore1, reserveBefore2] = [res0, res1].map(weiAmountToString);
  if (reserveBefore1 === reserveBefore2 && reserveBefore2 === "0") {
    await (await FWETH.approve(uniRouter.address, INIT_TOKEN_SUPPLY)).wait();
    await (await FUSDT.approve(uniRouter.address, INIT_TOKEN_SUPPLY)).wait();
    await (
      await uniRouter.addLiquidity(
        FWETH.address,
        FUSDT.address,
        INIT_ETH_LIQUIDITY,
        INIT_DAI_LIQUIDITY,
        parseEther("1"),
        parseEther("1"),
        deployer,
        INFINITE_DEADLINE,
        {
          gasLimit: 900000,
        }
      )
    ).wait();
  } else console.log("Liquidity already exist, no need to add more");
  const FUSDTReserve = await FUSDT.balanceOf(pairAddress);
  const FWETHREserve = await FWETH.balanceOf(pairAddress);
  console.log("Reserve for FUSDT: ", weiAmountToString(FUSDTReserve));
  console.log("Reserve for FWETH: ", weiAmountToString(FWETHREserve));

  logStep("DEPLOYING STOPLOSS ORACLE FOR FUSDT/FWETH");
  await deploy("SLOracle", {
    from: deployer,
    proxy: false,
    args: [uniFactory.address, FUSDT.address, FWETH.address],
    log: true,
  });
  const SLOracle = await ethers.getContract("SLOracle");

  logStep("DEPLOYER STOPLOSS POOL FOR FDA/WETH PAIR");
  let poolAddress = await SLfactory.getPoolFromTokens(
    FUSDT.address,
    FWETH.address
  );
  if (poolAddress === NULL_ADDRESS) {
    await (
      await SLfactory.createPool(FWETH.address, FUSDT.address, SLOracle.address)
    ).wait();
    poolAddress = await SLfactory.getPoolFromTokens(
      FUSDT.address,
      FWETH.address
    );
    console.log("Pool Created: ", poolAddress);
  } else
    console.log("Pool already created in previous deployment: ", poolAddress);
  const SLPool = await getArtifact("SLPool");
  save("SLPoolFUSDTFWETH", {abi: SLPool.abi, address: poolAddress});
  return !useProxy; // when live network, record the script as executed to prevent rexecution
};
export default func;