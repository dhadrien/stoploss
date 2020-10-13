import {address as daiAddress} from '../sl-sdk/lib/deployments/FDAI.json';
import {address as usdcAddress} from '../sl-sdk/lib/deployments/FUSDC.json';
import {address as usdtAddress} from '../sl-sdk/lib/deployments/FUSDT.json';
import {address as wbtcAddress} from '../sl-sdk/lib/deployments/FWBTC.json';
import {address as UniPairFDAIFWETHAddress} from '../sl-sdk/lib/deployments/UniPairFDAIFWETH.json';
import {address as SLPoolFDAIFWETHAddress} from '../sl-sdk/lib/deployments/SLPoolFDAIFWETH.json';
import {address as SLPoolFUSDCFWETHAddress} from '../sl-sdk/lib/deployments/SLPoolFUSDCFWETH.json';
import {address as SLPoolFUSDTFWETHAddress} from '../sl-sdk/lib/deployments/SLPoolFUSDTFWETH.json';
import {address as SLPoolFWBTCFWETHAddress} from '../sl-sdk/lib/deployments/SLPoolFWBTCFWETH.json';
import {address as wethAddress} from '../sl-sdk/lib/deployments/FWETH.json';
import {address as unirouterAddress} from '../sl-sdk/lib/deployments/UniswapV2Router02.json';
import BigNumber from 'bignumber.js';
export const dai = {name: "DAI", address: daiAddress.toLowerCase()};
export const usdc = {name: "USDC", address: usdcAddress.toLowerCase()};
export const usdt = {name: "USDT", address: usdtAddress.toLowerCase()};
export const wbtc = {name: "WBTC", address: wbtcAddress.toLowerCase()};
export const weth = {name: "WETH", address: wethAddress.toLowerCase()};
export const addressMapping:Record<string,string> = {}
addressMapping[daiAddress.toLowerCase()] = "DAI";
addressMapping[usdcAddress.toLowerCase()] = "USDC";
addressMapping[usdtAddress.toLowerCase()] = "USDT";
addressMapping[wbtcAddress.toLowerCase()] = "WBTC";
addressMapping[wethAddress.toLowerCase()] = "WETH";

export interface TokenMapping extends Record<string, {address: string, pools?: string[], balance?:BigNumber}>{
  
}

export const tokenNames:string[]= ["DAI","USDC", "USDT", "WBTC", "ETH"];
export const tokenMapping: TokenMapping= {
  "DAI": {
    address: daiAddress.toLowerCase(),
    pools: ["DAIWETH"]
  },
  "USDC": {
    address: usdcAddress.toLowerCase(),
    pools: ["USDCWETH"]
  },
  "USDT": {
    address: usdtAddress.toLowerCase(),
    pools: ["USDTWETH"]
  },
  "WBTC": {
    address: wbtcAddress.toLowerCase(),
    pools: ["WBTCWETH"]
  },
  "ETH": {
    address: wethAddress.toLowerCase(),
    pools: ["DAIWETH", "USDCWETH", "USDTWETH", "WBTCWETH"]
  },
  "SLPoolDAIWETH": {
    address: SLPoolFDAIFWETHAddress
  },
  "SLPoolUSDTWETH": {
    address: SLPoolFUSDTFWETHAddress
  },
  "SLPoolUSDCWETH": {
    address: SLPoolFUSDCFWETHAddress
  },
  "SLPoolWBTCWETH": {
    address: SLPoolFWBTCFWETHAddress
  },
  // "USDC": usdcAddress.toLowerCase(),
  // "USDT": usdtAddress.toLowerCase(),
  // "WBTC": wbtcAddress.toLowerCase(),
  // "ETH": wethAddress.toLowerCase()
}
// export const daiwethpool = daiwethpoolAddress;
export const unirouter = unirouterAddress;
// export const yam = '0x0e2298e3bûse3390e3b945a5456fbf59ecc3f55da16'
// export const yamv2 = '0xaba8cac6866b83ae4eec97dd07ed254282f6ad8a'
// export const yamv3 = '0x0AaCfbeC6a24756c20D41914F2caba817C0d8521'
// export const yUsd = '0x5dbcf33d8c2e976c6b560249878e6f1491bca25c'
// export const yycrvUniLp = '0xb93Cc05334093c6B3b8Bfd29933bb8d5C031caBC'
// export const migrator = '0x72cfed9293cbfb2bfc7515c413048c697c6c811c'


