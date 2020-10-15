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
  const FUSDC = await ethers.getContract("FUSDC", deployerSigner);
  const FUSDT = await ethers.getContract("FUSDT", deployerSigner);
  const FWBTC = await ethers.getContract("FWBTC", deployerSigner);
  const FETH = await ethers.getContract("FETH", deployerSigner);
  console.log(`
----------
08 SETUP USER WITH FDAI
----------
  `);
  // Contract needed
  logStep("SENDING DAI TO USER ");
  await (await FDAI.transfer(user, INIT_DAI_USERBALANCE)).wait();
  await (await FUSDC.transfer(user, INIT_DAI_USERBALANCE)).wait();
  await (await FUSDT.transfer(user, INIT_DAI_USERBALANCE)).wait();
  await (await FWBTC.transfer(user, INIT_DAI_USERBALANCE)).wait();
  await (await FETH.transfer(user, INIT_DAI_USERBALANCE)).wait();
  const userFDAIBalance = await FDAI.balanceOf(user);
  const userFUSDCBalance = await FUSDC.balanceOf(user);
  const userFUSDTBalance = await FUSDT.balanceOf(user);
  const userFWBTCBalance = await FWBTC.balanceOf(user);
  const userFETHCBalance = await FETH.balanceOf(user);
  const userEthBalance = await userSigner.getBalance();
  console.log("User ETH Balance: ", weiAmountToString(userEthBalance));
  console.log("User FDAI Balance: ", weiAmountToString(userFDAIBalance));
  console.log("User FUSDC Balance: ", weiAmountToString(userFUSDCBalance));
  console.log("User FUSDT Balance: ", weiAmountToString(userFUSDTBalance));
  console.log("User FWBTC Balance: ", weiAmountToString(userFWBTCBalance));
  console.log("User FETH Balance: ", weiAmountToString(userFETHCBalance));
  return !useProxy; // when live network, record the script as executed to prevent rexecution
};
export default func;
