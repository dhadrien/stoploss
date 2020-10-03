import {
  BuidlerRuntimeEnvironment,
  DeployFunction,
} from "@nomiclabs/buidler/types";
import {ethers} from "@nomiclabs/buidler";
import {ethers as ethers2} from "ethers";
import path from "path";

const {
  utils: {parseEther},
} = ethers2;

const func: DeployFunction = async function (bre: BuidlerRuntimeEnvironment) {
  const {deployer, user} = await bre.getNamedAccounts();
  const {deploy} = bre.deployments;
  const useProxy = !bre.network.live;

  await deploy("ERC20Log", {
    from: deployer,
    proxy: false,
    args: [parseEther("30000"), "Example Token", "ETK"],
    log: true,
  });
  return !useProxy; // when live network, record the script as executed to prevent rexecution
};
export default func;
