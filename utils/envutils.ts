import {config} from 'dotenv';

export function getEnv(path: string): NodeJS.ProcessEnv {
  config({path});
  const {...values} = process.env;
  return values;
}

export const DEFAULT_ENV_ADDRESS = 'Address not defined in corresponding .env!';
