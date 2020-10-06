import {
  BuidlerRuntimeEnvironment,
  DeployFunction,
} from "@nomiclabs/buidler/types";
import {ethers} from "@nomiclabs/buidler";
import {ethers as ethers2} from "ethers";
import {logStep} from "../utils/slutils";
const {
  utils: {parseEther},
} = ethers2;

import {NULL_ADDRESS} from "../utils/envutils";

const func: DeployFunction = async function (bre: BuidlerRuntimeEnvironment) {
  const {deployer, user} = await bre.getNamedAccounts();
  const deployerSigner = await ethers.getSigner(deployer);
  const {deploy, save} = bre.deployments;
  const useProxy = !bre.network.live;
  const FWETH = await ethers.getContract("FWETH");
  const FDAI = await ethers.getContract("FDAI");
  const uniFactory = await ethers.getContract(
    "UniswapV2Factory",
    deployerSigner
  );
  const uniRouter = await ethers.getContract(
    "UniswapV2Router02",
    deployerSigner
  );

  console.log(`
----------
03 DEPLOY STOPLOSS
----------
  `);
  // Contract needed
  logStep("DEPLOY STOP LOSS FACTORY");
  await deploy("SLFactory", {
    from: deployer,
    proxy: false,
    args: [uniFactory.address, FWETH.address, uniRouter.address],
    log: true,
  });
  return !useProxy; // when live network, record the script as executed to prevent rexecution
};
export default func;
