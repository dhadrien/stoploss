import "dotenv";
import {Wallet} from "@ethersproject/wallet";
import {usePlugin, BuidlerConfig} from "@nomiclabs/buidler/config";
import {getEnv} from "./utils/envutils";
import path from "path";
const env = getEnv(path.join(__dirname, "./.env"));
// usePlugin("@nomiclabs/buidler-waffle");
// usePlugin("@nomiclabs/buidler-web3");
// usePlugin("@nomiclabs/buidler-ethers");
usePlugin("buidler-ethers-v5");
usePlugin("buidler-deploy");
usePlugin("solidity-coverage");

const {MNEMONIC} = env;

const mnemonic = MNEMONIC;
let accounts;
let buidlerEvmAccounts;
if (mnemonic) {
  accounts = {
    mnemonic,
  };
  buidlerEvmAccounts = [];
  for (let i = 0; i < 10; i++) {
    const wallet = Wallet.fromMnemonic(mnemonic, "m/44'/60'/0'/0/" + i);
    buidlerEvmAccounts.push({
      privateKey: wallet.privateKey,
      balance: "1000000000000000000000000000000000",
    });
  }
} else {
  buidlerEvmAccounts = [];
  for (let i = 0; i < 10; i++) {
    const wallet = Wallet.createRandom();
    buidlerEvmAccounts.push({
      privateKey: wallet.privateKey,
      balance: "1000000000000000000000000000000000",
    });
  }
}

const config: BuidlerConfig = {
  solc: {
    version: "0.7.1",
    optimizer: {
      enabled: true,
      runs: 2000,
    },
  },
  namedAccounts: {
    deployer: 0,
    user: 1,
  },
  networks: {
    coverage: {
      url: "http://localhost:5458",
    },
    buidlerevm: {
      accounts: buidlerEvmAccounts,
    },
    localhost: {
      url: "http://localhost:8545",
      accounts,
    },
    staging: {
      url: "https://rinkeby.infura.io/v3/" + process.env.INFURA_TOKEN,
      accounts,
    },
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/" + process.env.INFURA_TOKEN,
      accounts,
    },
    kovan: {
      url: "https://kovan.infura.io/v3/" + process.env.INFURA_TOKEN,
      accounts,
    },
    goerli: {
      url: "https://goerli.infura.io/v3/" + process.env.INFURA_TOKEN,
      accounts,
    },
    mainnet: {
      url: "https://mainnet.infura.io/v3/" + process.env.INFURA_TOKEN,
      accounts,
    },
  },
  paths: {
    sources: "src",
    deploy: "deploy",
    deployments: "deployments",
    imports: "imports",
  },
};

export default config;
