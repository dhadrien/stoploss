import {
  BuidlerRuntimeEnvironment,
  DeployFunction,
} from "@nomiclabs/buidler/types";
import {ethers} from "@nomiclabs/buidler";
import {logStep} from "../utils/slutils";

const func: DeployFunction = async function (bre: BuidlerRuntimeEnvironment) {
  const {deployer, user} = await bre.getNamedAccounts();
  const {deploy} = bre.deployments;
  const useProxy = !bre.network.live;
  const FWETH = await ethers.getContract("FWETH");

  console.log(`
----------
02 DEPLOY UNISWAP
----------
  `);
  // Contract needed
  logStep("DEPLOYING UNISWAP V2 FACTORY");
  const factory = await deploy("UniswapV2Factory", {
    from: deployer,
    proxy: false,
    args: [FWETH.address],
    log: true,
  });
  logStep("DEPLOYING UNISWAP V2 ROUTER 02");
  await deploy("UniswapV2Router02", {
    from: deployer,
    proxy: false,
    args: [factory.address, FWETH.address],
    log: true,
  });
  return !useProxy; // when live network, record the script as executed to prevent rexecution
};
export default func;
