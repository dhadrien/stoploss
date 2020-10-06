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
import {INIT_DAI_USERBALANCE} from "../utils/envutils";

const func: DeployFunction = async function (bre: BuidlerRuntimeEnvironment) {
  const {deployer, user} = await bre.getNamedAccounts();
  const userSigner = await ethers.getSigner(user);
  const deployerSigner = await ethers.getSigner(deployer);
  const useProxy = !bre.network.live;
  const FDAI = await ethers.getContract("FDAI", deployerSigner);
  console.log(`
----------
05 SETUP USER WITH FDAI
----------
  `);
  // Contract needed
  logStep("SENDING DAI TO USER ");
  await (await FDAI.transfer(user, INIT_DAI_USERBALANCE)).wait();
  const userDaiBalance = await FDAI.balanceOf(user);
  const userEthBalance = await userSigner.getBalance();
  console.log("User ETH Balance: ", weiAmountToString(userEthBalance));
  console.log("User FDAI Balance: ", weiAmountToString(userDaiBalance));
  return !useProxy; // when live network, record the script as executed to prevent rexecution
};
export default func;
