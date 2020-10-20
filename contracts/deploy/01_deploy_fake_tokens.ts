import {
  BuidlerRuntimeEnvironment,
  DeployFunction,
} from "@nomiclabs/buidler/types";
import {ethers as ethers2} from "ethers";
import {ethers} from "@nomiclabs/buidler";
import {logStep} from "../utils/slutils";
const {
  utils: {parseEther},
} = ethers2;

import {INIT_TOKEN_SUPPLY, INIT_WETH_SUPPLY} from "../utils/envutils";
import {weiAmountToString} from "../utils/ethutils";

console.log("$------------------", process.env);

const func: DeployFunction = async function (bre: BuidlerRuntimeEnvironment) {
  const {deployer, user} = await bre.getNamedAccounts();
  const chain = await bre.getChainId();
  console.log("kovaaaaaan", chain);
  const deployerSigner = await bre.ethers.getSigner(deployer);
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
    const FWETH = await bre.ethers.getContract("WETH", deployerSigner);
    const FDAI = await bre.ethers.getContract("FDAI", deployerSigner);
    await FWETH.deposit({
      value: INIT_WETH_SUPPLY,
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

  logStep("DEPLOYING VAULT"); // to mimiq eth liquidity
  const FETH = await ethers.getContract("FETH", deployerSigner);
  const FDAI = await ethers.getContract("FDAI", deployerSigner);
  const FUSDC = await ethers.getContract("FUSDC", deployerSigner);
  const FUSDT = await ethers.getContract("FUSDT", deployerSigner);
  const FWBTC = await ethers.getContract("FWBTC", deployerSigner);
  await deploy("Vault", {
    contract: "DumbVault",
    from: deployer,
    proxy: false,
    args: [
      FETH.address,
      FDAI.address,
      FUSDC.address,
      FUSDT.address,
      FWBTC.address,
    ],
    log: true,
  });
  const Vault = await ethers.getContract("Vault", deployerSigner);
  // throw new Error("");
  logStep("SENDING TOKENS TO VAULT"); // to mimiq eth liquidity
  // await FETH.transfer(Vault.address, INIT_TOKEN_SUPPLY.div(3));
  // await FDAI.transfer(Vault.address, INIT_TOKEN_SUPPLY.div(3));
  // await FUSDC.transfer(Vault.address, INIT_TOKEN_SUPPLY.div(3));
  // await FUSDT.transfer(Vault.address, INIT_TOKEN_SUPPLY.div(3));
  await FWBTC.transfer(Vault.address, INIT_TOKEN_SUPPLY.div(3));
  return !useProxy; // when live network, record the script as executed to prevent rexecution
};
export default func;
