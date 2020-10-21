import BigNumber from 'bignumber.js/bignumber';
import Web3 from 'web3';
import * as Types from "./types.js";
import { SUBTRACT_GAS_LIMIT, addressMap } from './constants.js';

import FDAI from '../deployments/FDAI.json';
import FUSDC from '../deployments/FUSDC.json';
import FUSDT from '../deployments/FUSDT.json';
import FWBTC from '../deployments/FWBTC.json';
import FETH from '../deployments/FETH.json';
import FWETH from '../deployments/FWETH.json';
import SLFactory from '../deployments/SLFactory.json';
import SLOracle from '../deployments/SLOracle.json';
import SLPoolDAIWETH from '../deployments/SLPoolFDAIFWETH.json';
import SLPoolUSDCWETH from '../deployments/SLPoolFUSDCFWETH.json';
import SLPoolUSDTWETH from '../deployments/SLPoolFUSDTFWETH.json';
import SLPoolWBTCWETH from '../deployments/SLPoolFWBTCFWETH.json';
import UniPairDAIWETH from '../deployments/UniPairFDAIFWETH.json';
import UniPairUSDCWETH from '../deployments/UniPairFUSDCFWETH.json';
import UniPairUSDTWETH from '../deployments/UniPairFUSDTFWETH.json';
import UniPairWBTCWETH from '../deployments/UniPairFWBTCFWETH.json';
import SLPoolDAIFETH from '../deployments/SLPoolFDAIFETH.json';
import SLPoolUSDCFETH from '../deployments/SLPoolFUSDCFETH.json';
import SLPoolUSDTFETH from '../deployments/SLPoolFUSDTFETH.json';
import SLPoolWBTCFETH from '../deployments/SLPoolFWBTCFETH.json';
import UniPairDAIFETH from '../deployments/UniPairFDAIFETH.json';
import UniPairUSDCFETH from '../deployments/UniPairFUSDCFETH.json';
import UniPairUSDTFETH from '../deployments/UniPairFUSDTFETH.json';
import UniPairWBTCFETH from '../deployments/UniPairFWBTCFETH.json';
import UniswapV2Factory from '../deployments/UniswapV2Factory.json';
import UniswapV2Router02 from '../deployments/UniswapV2Router02.json';
import Vault from '../deployments/Vault.json';

export class Contracts {
  constructor(
    provider,
    networkId,
    web3,
    options
  ) {
    this.web3 = web3;
    this.defaultConfirmations = options.defaultConfirmations;
    this.autoGasMultiplier = options.autoGasMultiplier || 1.5;
    this.confirmationType = options.confirmationType || Types.ConfirmationType.Confirmed;
    this.defaultGas = options.defaultGas;
    this.defaultGasPrice = options.defaultGasPrice;

    this.FDAI = new this.web3.eth.Contract(FDAI.abi, FDAI.address);
    this.FUSDC = new this.web3.eth.Contract(FUSDC.abi, FUSDC.address);
    this.FUSDT = new this.web3.eth.Contract(FUSDT.abi, FUSDT.address);
    this.FWBTC = new this.web3.eth.Contract(FWBTC.abi, FWBTC.address);
    this.FWETH = new this.web3.eth.Contract(FWETH.abi, FWETH.address);
    this.FETH = new this.web3.eth.Contract(FETH.abi, FETH.address);
    this.slFactory = new this.web3.eth.Contract(SLFactory.abi, SLFactory.address);
    this.slOracle = new this.web3.eth.Contract(SLOracle.abi, SLOracle.address);
    this.Vault = new this.web3.eth.Contract(Vault.abi, Vault.address);
    // this.SLPoolDAIWETH = new this.web3.eth.Contract(SLPoolDAIWETH.abi, SLPoolDAIWETH.address); //legacy pool will be changed one day
    // this.uniPair = new this.web3.eth.Contract(UniPairDAIWETH.abi, UniPairDAIWETH.address);
    this.SLPoolDAIWETH = new this.web3.eth.Contract(SLPoolDAIWETH.abi, SLPoolDAIWETH.address);
    this.SLPoolUSDCWETH = new this.web3.eth.Contract(SLPoolUSDCWETH.abi, SLPoolUSDCWETH.address);
    this.SLPoolUSDTWETH = new this.web3.eth.Contract(SLPoolUSDTWETH.abi, SLPoolUSDTWETH.address);
    this.SLPoolWBTCWETH = new this.web3.eth.Contract(SLPoolWBTCWETH.abi, SLPoolWBTCWETH.address);
    this.UniPairDAIWETH = new this.web3.eth.Contract(UniPairDAIWETH.abi, UniPairDAIWETH.address);
    this.UniPairUSDCWETH = new this.web3.eth.Contract(UniPairUSDCWETH.abi, UniPairUSDCWETH.address);
    this.UniPairUSDTWETH = new this.web3.eth.Contract(UniPairUSDTWETH.abi, UniPairUSDTWETH.address);
    this.UniPairWBTCWETH = new this.web3.eth.Contract(UniPairWBTCWETH.abi, UniPairWBTCWETH.address);
    this.SLPoolDAIFETH = new this.web3.eth.Contract(SLPoolDAIFETH.abi, SLPoolDAIFETH.address);
    this.SLPoolUSDCFETH = new this.web3.eth.Contract(SLPoolUSDCFETH.abi, SLPoolUSDCFETH.address);
    this.SLPoolUSDTFETH = new this.web3.eth.Contract(SLPoolUSDTFETH.abi, SLPoolUSDTFETH.address);
    this.SLPoolWBTCFETH = new this.web3.eth.Contract(SLPoolWBTCFETH.abi, SLPoolWBTCFETH.address);
    this.UniPairDAIFETH = new this.web3.eth.Contract(UniPairDAIFETH.abi, UniPairDAIFETH.address);
    this.UniPairUSDCFETH = new this.web3.eth.Contract(UniPairUSDCFETH.abi, UniPairUSDCFETH.address);
    this.UniPairUSDTFETH = new this.web3.eth.Contract(UniPairUSDTFETH.abi, UniPairUSDTFETH.address);
    this.UniPairWBTCFETH = new this.web3.eth.Contract(UniPairWBTCFETH.abi, UniPairWBTCFETH.address);
    this.unifactory = new this.web3.eth.Contract(UniswapV2Factory.abi, UniswapV2Factory.address);
    this.uniRouter = new this.web3.eth.Contract(UniswapV2Router02.abi, UniswapV2Router02.address);

    this.setProvider(provider, networkId);
    this.setDefaultAccount(this.web3.eth.defaultAccount);
  }


  setProvider(
    provider,
    networkId
  ) {
    this.FDAI.setProvider(provider);
    this.FUSDC.setProvider(provider);
    this.FUSDT.setProvider(provider);
    this.FWBTC.setProvider(provider);
    this.FWETH.setProvider(provider);
    this.Vault.setProvider(provider);
    this.slOracle.setProvider(provider);
    this.slFactory.setProvider(provider);
    this.SLPoolDAIWETH.setProvider(provider);
    this.UniPairDAIWETH.setProvider(provider);
    this.unifactory.setProvider(provider);
    this.uniRouter.setProvider(provider);
    const contracts = [
      { contract: this.FDAI, json: FDAI },
      { contract: this.FUSDT, json: FUSDT },
      { contract: this.FUSDC, json: FUSDC },
      { contract: this.FWBTC, json: FWBTC },
      { contract: this.FWETH, json: FWETH },
      { contract: this.slFactory, json: SLFactory },
      { contract: this.slOracle, json: SLOracle },
      { contract: this.SLPoolDAIWETH, json: SLPoolDAIWETH },
      { contract: this.UniPairDAIWETH, json: UniPairDAIWETH },
      { contract: this.unifactory, json: UniswapV2Factory },
      { contract: this.uniRouter, json: UniswapV2Router02 },
    ]

    contracts.forEach(contract => this.setContractProvider(
        contract.contract,
        contract.json,
        provider,
        networkId,
      ),
    );

    this.pools = [
      {"pairAddress": this.UniPairDAIWETH.options.address, "poolAddr": this.SLPoolDAIWETH.options.address},
      {"pairAddress": this.UniPairUSDCWETH.options.address, "poolAddr": this.SLPoolUSDCWETH.options.address},
      {"pairAddress": this.UniPairUSDTWETH.options.address, "poolAddr": this.SLPoolUSDTWETH.options.address},
      {"pairAddress": this.UniPairWBTCWETH.options.address, "poolAddr": this.SLPoolWBTCWETH.options.address},
    ]

    this.names = {};
    this.names[this.FDAI.options.address] = "FDAI";
    this.names[this.FWETH.options.address] = "FWETH";
    this.names[this.slOracle.options.address] = "SL: Oracle";
    this.names[this.slFactory.options.address] = "SL: Factory";
    this.names[this.SLPoolUSDCWETH.options.address] = "SL: Pool FUSDC/FWETH";
    this.names[this.SLPoolUSDTWETH.options.address] = "SL: Pool FDUSDTFWETH";
    this.names[this.SLPoolWBTCWETH.options.address] = "SL: Pool FDAWBTCWETH";
    this.names[this.SLPoolDAIWETH.options.address] = "SL: Pool FDAI/FWETH";
    this.names[this.UniPairUSDTWETH.options.address] = "UNI: Pair FUSDT/FWETH";
    this.names[this.UniPairUSDCWETH.options.address] = "UNI: Pair FDUSDCFWETH";
    this.names[this.UniPairWBTCWETH.options.address] = "UNI: Pair FDAWBTCWETH";
    this.names[this.UniPairDAIWETH.options.address] = "UNI: Pair FDAI/FWETH";
    this.names[this.SLPoolUSDCFETH.options.address] = "SL: Pool FUSDC/FFETH";
    this.names[this.SLPoolUSDTFETH.options.address] = "SL: Pool FDUSDTFFETH";
    this.names[this.SLPoolWBTCFETH.options.address] = "SL: Pool FDAWBTCFETH";
    this.names[this.SLPoolDAIFETH.options.address] = "SL: Pool FDAI/FFETH";
    this.names[this.UniPairUSDTFETH.options.address] = "UNI: Pair FUSDT/FFETH";
    this.names[this.UniPairUSDCFETH.options.address] = "UNI: Pair FDUSDCFFETH";
    this.names[this.UniPairWBTCFETH.options.address] = "UNI: Pair FDAWBTCFETH";
    this.names[this.UniPairDAIFETH.options.address] = "UNI: Pair FDAI/FFETH";
    this.names[this.unifactory.options.address] = "UNI: Factory";
    this.names[this.uniRouter.options.address] = "UNI: Router";
  }

  setDefaultAccount(
    account
  ) {
    this.FDAI.options.from = account;
    this.FWETH.options.from = account;
    this.uniRouter.options.from = account;
    this.unifactory.options.from = account;
    this.slFactory.options.from = account;
    this.slOracle.options.from = account
    this.UniPairDAIWETH.options.from = account;
    this.UniPairUSDCWETH.options.from = account;
    this.UniPairUSDTWETH.options.from = account;
    this.UniPairWBTCWETH.options.from = account;
    this.SLPoolDAIWETH.options.from = account;
    this.SLPoolUSDTWETH.options.from = account;
    this.SLPoolUSDCWETH.options.from = account;
    this.SLPoolWBTCWETH.options.from = account;
    this.UniPairDAIFETH.options.from = account;
    this.UniPairUSDCFETH.options.from = account;
    this.UniPairUSDTFETH.options.from = account;
    this.UniPairWBTCFETH.options.from = account;
    this.SLPoolDAIFETH.options.from = account;
    this.SLPoolUSDTFETH.options.from = account;
    this.SLPoolUSDCFETH.options.from = account;
    this.SLPoolWBTCFETH.options.from = account;
    this.Vault.options.from = account;
  }

  async callContractFunction(
    method,
    options
  ) {
    const { confirmations, confirmationType, autoGasMultiplier, ...txOptions } = options;

    if (!this.blockGasLimit) {
      await this.setGasLimit();
    }

    if (!txOptions.gasPrice && this.defaultGasPrice) {
      txOptions.gasPrice = this.defaultGasPrice;
    }

    if (confirmationType === Types.ConfirmationType.Simulate || !options.gas) {
      let gasEstimate;
      if (this.defaultGas && confirmationType !== Types.ConfirmationType.Simulate) {
        txOptions.gas = this.defaultGas;
      } else {
        try {
          console.log("estimating gas");
          gasEstimate = await method.estimateGas(txOptions);
        } catch (error) {
          const data = method.encodeABI();
          const { from, value } = options;
          const to = method._parent._address;
          error.transactionData = { from, value, data, to };
          throw error;
        }

        const multiplier = autoGasMultiplier || this.autoGasMultiplier;
        const totalGas = Math.floor(gasEstimate * multiplier);
        txOptions.gas = totalGas < this.blockGasLimit ? totalGas : this.blockGasLimit;
      }

      if (confirmationType === Types.ConfirmationType.Simulate) {
        let g = txOptions.gas;
        return { gasEstimate, g };
      }
    }

    if (txOptions.value) {
      txOptions.value = new BigNumber(txOptions.value).toFixed(0);
    } else {
      txOptions.value = '0';
    }

    const promi = method.send(txOptions);

    const OUTCOMES = {
      INITIAL: 0,
      RESOLVED: 1,
      REJECTED: 2,
    };

    let hashOutcome = OUTCOMES.INITIAL;
    let confirmationOutcome = OUTCOMES.INITIAL;

    const t = confirmationType !== undefined ? confirmationType : this.confirmationType;

    if (!Object.values(Types.ConfirmationType).includes(t)) {
      throw new Error(`Invalid confirmation type: ${t}`);
    }

    let hashPromise;
    let confirmationPromise;

    if (t === Types.ConfirmationType.Hash || t === Types.ConfirmationType.Both) {
      hashPromise = new Promise(
        (resolve, reject) => {
          promi.on('error', (error) => {
            if (hashOutcome === OUTCOMES.INITIAL) {
              hashOutcome = OUTCOMES.REJECTED;
              reject(error);
              const anyPromi = promi ;
              anyPromi.off();
            }
          });

          promi.on('transactionHash', (txHash) => {
            if (hashOutcome === OUTCOMES.INITIAL) {
              hashOutcome = OUTCOMES.RESOLVED;
              resolve(txHash);
              if (t !== Types.ConfirmationType.Both) {
                const anyPromi = promi ;
                anyPromi.off();
              }
            }
          });
        },
      );
    }

    if (t === Types.ConfirmationType.Confirmed || t === Types.ConfirmationType.Both) {
      confirmationPromise = new Promise(
        (resolve, reject) => {
          promi.on('error', (error) => {
            if (
              (t === Types.ConfirmationType.Confirmed || hashOutcome === OUTCOMES.RESOLVED)
              && confirmationOutcome === OUTCOMES.INITIAL
            ) {
              confirmationOutcome = OUTCOMES.REJECTED;
              reject(error);
              const anyPromi = promi ;
              anyPromi.off();
            }
          });

          const desiredConf = confirmations || this.defaultConfirmations;
          if (desiredConf) {
            promi.on('confirmation', (confNumber, receipt) => {
              if (confNumber >= desiredConf) {
                if (confirmationOutcome === OUTCOMES.INITIAL) {
                  confirmationOutcome = OUTCOMES.RESOLVED;
                  resolve(receipt);
                  const anyPromi = promi ;
                  anyPromi.off();
                }
              }
            });
          } else {
            promi.on('receipt', (receipt) => {
              confirmationOutcome = OUTCOMES.RESOLVED;
              resolve(receipt);
              const anyPromi = promi ;
              anyPromi.off();
            });
          }
        },
      );
    }

    if (t === Types.ConfirmationType.Hash) {
      const transactionHash = await hashPromise;
      if (this.notifier) {
          this.notifier.hash(transactionHash)
      }
      return { transactionHash };
    }

    if (t === Types.ConfirmationType.Confirmed) {
      return confirmationPromise;
    }

    const transactionHash = await hashPromise;
    if (this.notifier) {
        this.notifier.hash(transactionHash)
    }
    return {
      transactionHash,
      confirmation: confirmationPromise,
    };
  }

  async callConstantContractFunction(
    method,
    options
  ) {
    const m2 = method;
    const { blockNumber, ...txOptions } = options;
    return m2.call(txOptions, blockNumber);
  }

  async setGasLimit() {
    const block = await this.web3.eth.getBlock('latest');
    this.blockGasLimit = block.gasLimit - SUBTRACT_GAS_LIMIT;
  }

  setContractProvider(
    contract,
    contractJson,
    provider,
    networkId,
  ){
    contract.setProvider(provider);
    try {
      contract.options.address = contractJson.networks[networkId]
        && contractJson.networks[networkId].address;
    } catch (error) {
      // console.log(error)
    }
  }
}
