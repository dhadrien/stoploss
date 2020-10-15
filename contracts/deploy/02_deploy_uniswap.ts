import {
  BuidlerRuntimeEnvironment,
  DeployFunction,
} from "@nomiclabs/buidler/types";
import {ethers} from "@nomiclabs/buidler";
import {logStep} from "../utils/slutils";

const func: DeployFunction = async function (bre: BuidlerRuntimeEnvironment) {
  const {deployer, user} = await bre.getNamedAccounts();
  const {deploy, getArtifact, save} = bre.deployments;
  const deployerSigner = await bre.ethers.getSigner(deployer);
  const useProxy = !bre.network.live;
  const FWETH = await ethers.getContract("WETH");
  const chain = await bre.getChainId();

  console.log(`
----------
02 DEPLOY UNISWAP
----------
  `);
  // Contract needed
  if (chain == "1337" || chain == "31337") {
    logStep("DEPLOYING UNISWAP V2 FACTORY");
    const factory = await deploy("UniswapV2Factory", {
      from: deployer,
      proxy: false,
      args: [deployer],
      log: true,
    });
    logStep("DEPLOYING UNISWAP V2 ROUTER 02");
    await deploy("UniswapV2Router02", {
      from: deployer,
      proxy: false,
      args: [factory.address, FWETH.address],
      log: true,
    });
  } else {
    logStep("SAVING UNISWAP V2 FACTORY. Chain: " + chain);
    logStep("DEPLOYING UNISWAP V2 FACTORY");
    const factory = await getArtifact("UniswapV2Factory");
    save("UniswapV2Factory", {
      abi: factory.abi,
      address: process.env["UniswapV2Factory_" + chain] || "",
    });
    logStep("SAVING UNISWAP V2 Router. Chain: " + chain);
    const router = await getArtifact("UniswapV2Router02");
    save("UniswapV2Router02", {
      abi: router.abi,
      address: process.env["UniswapV2Router02_" + chain] || "",
    });
  }

  return !useProxy; // when live network, record the script as executed to prevent rexecution
};
export default func;
