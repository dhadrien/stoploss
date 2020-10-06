import {config} from "dotenv";
import {parseEther} from "ethers/lib/utils";

export function getEnv(path: string): NodeJS.ProcessEnv {
  config({path});
  const {...values} = process.env;
  return values;
}

export const DEFAULT_ENV_ADDRESS = "Address not defined in corresponding .env!";
export const INIT_TOKEN_SUPPLY = parseEther("100000000000");
export const INIT_ETH_LIQUIDITY = parseEther("1000000");
export const INIT_DAI_LIQUIDITY = parseEther("300000000");
export const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
export const INFINITE_DEADLINE = 262156100447;
