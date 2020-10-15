import {
  BuidlerRuntimeEnvironment,
  DeployFunction,
} from "@nomiclabs/buidler/types";
import {deployTokenWeth, deployTokenFeth} from "../scripts/deploymentutils";

import {logStep} from "../utils/slutils";

const func: DeployFunction = async function (bre: BuidlerRuntimeEnvironment) {
  const useProxy = !bre.network.live;
  console.log(`
----------
05 SETUP FUSDC/FETH (+ FUSDC/WETH local only)
----------
  `);
  // Contract needed
  const chain = await bre.getChainId();
  if (chain == "1337" || chain == "31337") {
    logStep("DEPLOYING UNISWAP V2 PAIR FUSDC/WETH");
    await deployTokenWeth("FUSDC", bre);
    const newbre = await deployTokenWeth("FUSDC", bre);
    bre = newbre;
  }
  await deployTokenFeth("FUSDC", bre);

  return !useProxy; // when live network, record the script as executed to prevent rexecution
};
export default func;
