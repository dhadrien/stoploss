import {
  BuidlerRuntimeEnvironment,
  DeployFunction,
} from "@nomiclabs/buidler/types";
import {ethers as ethers2, ethers} from "ethers";

import {logStep} from "../utils/slutils";
const {
  utils: {parseEther},
} = ethers2;

import {INIT_TOKEN_SUPPLY} from "../utils/envutils";

const func: DeployFunction = async function (bre: BuidlerRuntimeEnvironment) {
  const {deployer, user} = await bre.getNamedAccounts();
  const deployerUser = await bre.ethers.getSigner(deployer);
  const {deploy} = bre.deployments;
  const useProxy = !bre.network.live;
  console.log(`
  😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈
  😈STOP LOSS DEPLOYMENTS 
  😈Deployer: ${deployer}
  😈User: ${user}       
  😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈

----------
01: DEPLOY FAKE DAI AND FAKE WETH
----------
  `);
  // Contract needed
  logStep("DEPLOYING FAKE DAI");
  await deploy("FDAI", {
    contract: "ERC20Log",
    from: deployer,
    proxy: false,
    args: [INIT_TOKEN_SUPPLY, "Fake Dai", "STP"],
    log: true,
  });
  logStep("DEPLOYING FAKE WETH");
  await deploy("FWETH", {
    contract: "WETH",
    from: deployer,
    proxy: false,
    args: [],
    log: true,
  });
  logStep("TRANSFORMING ETH IN FWETH FOR DEPLOYER");
  const FWETH = await bre.ethers.getContract("FWETH", deployerUser);
  const FDAI = await bre.ethers.getContract("FDAI", deployerUser);
  await FWETH.deposit({
    value: INIT_TOKEN_SUPPLY,
  });
  const FWETHDeployerBalance = await FWETH.balanceOf(deployer);
  const FDAIDeployerBalance = await FDAI.balanceOf(deployer);
  console.log("Deployer FWETH BALANCE: ", FWETHDeployerBalance);
  console.log("Deployer FWETH BALANCE: ", FDAIDeployerBalance);

  return !useProxy; // when live network, record the script as executed to prevent rexecution
};
export default func;
