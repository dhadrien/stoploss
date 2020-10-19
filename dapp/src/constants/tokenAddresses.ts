import {address as daiAddress} from '../sl-sdk/lib/deployments/FDAI.json';
import {address as usdcAddress} from '../sl-sdk/lib/deployments/FUSDC.json';
import {address as usdtAddress} from '../sl-sdk/lib/deployments/FUSDT.json';
import {address as wbtcAddress} from '../sl-sdk/lib/deployments/FWBTC.json';
import {address as fwethAddress} from '../sl-sdk/lib/deployments/FWETH.json';
import {address as fethAddress} from '../sl-sdk/lib/deployments/FETH.json';
import {address as UniPairFDAIFWETHAddress} from '../sl-sdk/lib/deployments/UniPairFDAIFWETH.json';
import {address as UniPairFUSDCFWETHAddress} from '../sl-sdk/lib/deployments/UniPairFUSDCFWETH.json';
import {address as UniPairFUSDTFWETHAddress} from '../sl-sdk/lib/deployments/UniPairFUSDTFWETH.json';
import {address as UniPairFWBTCFWETHAddress} from '../sl-sdk/lib/deployments/UniPairFWBTCFWETH.json';
import {address as SLPoolFDAIFWETHAddress} from '../sl-sdk/lib/deployments/SLPoolFDAIFWETH.json';
import {address as SLPoolFUSDCFWETHAddress} from '../sl-sdk/lib/deployments/SLPoolFUSDCFWETH.json';
import {address as SLPoolFUSDTFWETHAddress} from '../sl-sdk/lib/deployments/SLPoolFUSDTFWETH.json';
import {address as SLPoolFWBTCFWETHAddress} from '../sl-sdk/lib/deployments/SLPoolFWBTCFWETH.json';
import {address as UniPairFDAIFETHAddress} from '../sl-sdk/lib/deployments/UniPairFDAIFETH.json';
import {address as UniPairFUSDCFETHAddress} from '../sl-sdk/lib/deployments/UniPairFUSDCFETH.json';
import {address as UniPairFUSDTFETHAddress} from '../sl-sdk/lib/deployments/UniPairFUSDTFETH.json';
import {address as UniPairFWBTCFETHAddress} from '../sl-sdk/lib/deployments/UniPairFWBTCFETH.json';
import {address as SLPoolFDAIFETHAddress} from '../sl-sdk/lib/deployments/SLPoolFDAIFETH.json';
import {address as SLPoolFUSDCFETHAddress} from '../sl-sdk/lib/deployments/SLPoolFUSDCFETH.json';
import {address as SLPoolFUSDTFETHAddress} from '../sl-sdk/lib/deployments/SLPoolFUSDTFETH.json';
import {address as SLPoolFWBTCFETHAddress} from '../sl-sdk/lib/deployments/SLPoolFWBTCFETH.json';
import {address as unirouterAddress} from '../sl-sdk/lib/deployments/UniswapV2Router02.json';
import BigNumber from 'bignumber.js';
export const dai = {name: "DAI", address: daiAddress.toLowerCase()};
export const usdc = {name: "USDC", address: usdcAddress.toLowerCase()};
export const usdt = {name: "USDT", address: usdtAddress.toLowerCase()};
export const wbtc = {name: "WBTC", address: wbtcAddress.toLowerCase()};
export const weth = {name: "WETH", address: fwethAddress.toLowerCase()};
export const feth = {name: "FETH", address: fethAddress.toLowerCase()};
export const addressMapping:Record<string,string> = {}
addressMapping[daiAddress.toLowerCase()] = "DAI";
addressMapping[usdcAddress.toLowerCase()] = "USDC";
addressMapping[usdtAddress.toLowerCase()] = "USDT";
addressMapping[wbtcAddress.toLowerCase()] = "WBTC";
addressMapping[fwethAddress.toLowerCase()] = "WETH";
addressMapping[fethAddress.toLowerCase()] = "FETH";

addressMapping[SLPoolFDAIFWETHAddress.toLowerCase()] = "DAIWETH";
addressMapping[SLPoolFUSDCFWETHAddress.toLowerCase()] = "USDCWETH";
addressMapping[SLPoolFUSDTFWETHAddress.toLowerCase()] = "USDTWETH";
addressMapping[SLPoolFWBTCFWETHAddress.toLowerCase()] = "WBTCWETH";
addressMapping[UniPairFDAIFWETHAddress.toLowerCase()] = "DAIWETH";
addressMapping[UniPairFUSDCFWETHAddress.toLowerCase()] = "USDCWETH";
addressMapping[UniPairFUSDTFWETHAddress.toLowerCase()] = "USDTWETH";
addressMapping[UniPairFWBTCFWETHAddress.toLowerCase()] = "WBTCWETH";
addressMapping[SLPoolFDAIFETHAddress.toLowerCase()] = "DAIFETH";
addressMapping[SLPoolFUSDCFETHAddress.toLowerCase()] = "USDCFETH";
addressMapping[SLPoolFUSDTFETHAddress.toLowerCase()] = "USDTFETH";
addressMapping[SLPoolFWBTCFETHAddress.toLowerCase()] = "WBTCFETH";
addressMapping[UniPairFDAIFETHAddress.toLowerCase()] = "DAIFETH";
addressMapping[UniPairFUSDCFETHAddress.toLowerCase()] = "USDCFETH";
addressMapping[UniPairFUSDTFETHAddress.toLowerCase()] = "USDTFETH";
addressMapping[UniPairFWBTCFETHAddress.toLowerCase()] = "WBTCFETH";

export interface TokenMapping extends Record<string, {address: string, pools?: string[], balance?:BigNumber, tokens?:string[]}>{
  
}

// export const tokenNames:string[]= ["DAI","USDC", "USDT", "WBTC", "WETH", "FETH"];
export const tokenNames:string[]= ["DAI","USDC", "USDT", "WBTC", "FETH"];
export const tokenMapping: TokenMapping= {
  "DAI": {
    address: daiAddress.toLowerCase(),
    pools: ["DAIFETH"]
    // pools: ["DAIWETH","DAIFETH"]
  },
  "USDC": {
    address: usdcAddress.toLowerCase(),
    pools: ["USDCFETH"]
    // pools: ["USDCWETH","USDCFETH"]
  },
  "USDT": {
    address: usdtAddress.toLowerCase(),
    pools: ["USDTFETH"]
    // pools: ["USDTWETH","USDTFETH"]
  },
  "WBTC": {
    address: wbtcAddress.toLowerCase(),
    pools: ["WBTCFETH"]
    // pools: ["WBTCWETH","WBTCFETH"]
  },
  // "WETH": {
  //   address: fwethAddress.toLowerCase(),
  //   pools: ["DAIWETH", "USDCWETH", "USDTWETH", "WBTCWETH"]
  // },
  "FETH": {
    address: fethAddress.toLowerCase(),
    pools: ["DAIFETH", "USDCFETH", "USDTFETH", "WBTCFETH"]
  },
  // "SLPoolDAIWETH": {
  //   address: SLPoolFDAIFWETHAddress
  // },
  // "SLPoolUSDTWETH": {
  //   address: SLPoolFUSDTFWETHAddress
  // },
  // "SLPoolUSDCWETH": {
  //   address: SLPoolFUSDCFWETHAddress
  // },
  // "SLPoolWBTCWETH": {
  //   address: SLPoolFWBTCFWETHAddress
  // },
  "DAIFETH": {
    address: SLPoolFDAIFETHAddress,
  },
  "USDTFETH": {
    address: SLPoolFUSDTFETHAddress
  },
  "USDCFETH": {
    address: SLPoolFUSDCFETHAddress
  },
  "WBTCFETH": {
    address: SLPoolFWBTCFETHAddress
  },
}
tokenMapping.DAIFETH.tokens = [tokenMapping.DAI.address, tokenMapping.FETH.address];
tokenMapping.USDCFETH.tokens = [tokenMapping.USDC.address, tokenMapping.FETH.address];
tokenMapping.USDTFETH.tokens = [tokenMapping.USDT.address, tokenMapping.FETH.address];
tokenMapping.WBTCFETH.tokens = [tokenMapping.WBTC.address, tokenMapping.FETH.address];
// export const daiwethpool = daiwethpoolAddress;
export const unirouter = unirouterAddress;
// export const yam = '0x0e2298e3bûse3390e3b945a5456fbf59ecc3f55da16'
// export const yamv2 = '0xaba8cac6866b83ae4eec97dd07ed254282f6ad8a'
// export const yamv3 = '0x0AaCfbeC6a24756c20D41914F2caba817C0d8521'
// export const yUsd = '0x5dbcf33d8c2e976c6b560249878e6f1491bca25c'
// export const yycrvUniLp = '0xb93Cc05334093c6B3b8Bfd29933bb8d5C031caBC'
// export const migrator = '0x72cfed9293cbfb2bfc7515c413048c697c6c811c'


