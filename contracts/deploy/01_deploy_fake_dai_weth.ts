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
import {weiAmountToString} from "../utils/ethutils";

console.log("$------------------", process.env);

const func: DeployFunction = async function (bre: BuidlerRuntimeEnvironment) {
  const {deployer, user} = await bre.getNamedAccounts();
  const chain = await bre.getChainId();
  console.log("kovaaaaaan", chain);
  const deployerUser = await bre.ethers.getSigner(deployer);
  const {deploy, save, getArtifact} = bre.deployments;
  const useProxy = !bre.network.live;
  console.log(`
  😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈
  😈STOP LOSS DEPLOYMENTS 
  😈Deployer: ${deployer}
  😈User: ${user}       
  😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈

----------
01: DEPLOY TOKENS: DAI, USDC, USDT, WBTC, WETH
----------
  `);
  // Contract needed
  logStep("DEPLOYING FAKE DAI");
  await deploy("FDAI", {
    contract: "ERC20Log",
    from: deployer,
    proxy: false,
    args: [INIT_TOKEN_SUPPLY, "Fake Dai", "DAI"],
    log: true,
  });
  logStep("DEPLOYING FAKE USDT");
  await deploy("FUSDT", {
    contract: "ERC20Log",
    from: deployer,
    proxy: false,
    args: [INIT_TOKEN_SUPPLY, "Fake USDT", "USDT"],
    log: true,
  });
  logStep("DEPLOYING FAKE USDC");
  await deploy("FUSDC", {
    contract: "ERC20Log",
    from: deployer,
    proxy: false,
    args: [INIT_TOKEN_SUPPLY, "Fake USDC", "USDC"],
    log: true,
  });
  logStep("DEPLOYING FAKE WBTC");
  await deploy("FWBTC", {
    contract: "ERC20Log",
    from: deployer,
    proxy: false,
    args: [INIT_TOKEN_SUPPLY, "Fake WBTC", "WBTC"],
    log: true,
  });
  logStep("DEPLOYING FAKE ETH as ERC20"); // to mimiq eth liquidity
  await deploy("FETH", {
    contract: "ERC20Log",
    from: deployer,
    proxy: false,
    args: [INIT_TOKEN_SUPPLY, "Fake ETH", "FETH"],
    log: true,
  });
  if (chain == "1337" || chain == "31337") {
    logStep("DEPLOYING FAKE WETH");
    await deploy("WETH", {
      contract: "WETH",
      from: deployer,
      proxy: false,
      args: [],
      log: true,
    });
    logStep("TRANSFORMING ETH IN FWETH FOR DEPLOYER");
    const FWETH = await bre.ethers.getContract("WETH", deployerUser);
    const FDAI = await bre.ethers.getContract("FDAI", deployerUser);
    await FWETH.deposit({
      value: INIT_TOKEN_SUPPLY,
    });
    const FWETHDeployerBalance = await FWETH.balanceOf(deployer);
    const FDAIDeployerBalance = await FDAI.balanceOf(deployer);
    console.log(
      "Deployer FWETH BALANCE: ",
      weiAmountToString(FWETHDeployerBalance)
    );
    console.log(
      "Deployer FDAI BALANCE: ",
      weiAmountToString(FDAIDeployerBalance)
    );
  } else {
    const WETH = await getArtifact("WETH9");
    save("WETH", {abi: WETH.abi, address: process.env["WETH_" + chain] || ""});
  }
  // throw new Error("");
  return !useProxy; // when live network, record the script as executed to prevent rexecution
};
export default func;
