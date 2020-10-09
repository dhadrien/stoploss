import BigNumber from 'bignumber.js/bignumber';
import Web3 from 'web3';
import * as Types from "./types.js";
import { SUBTRACT_GAS_LIMIT, addressMap } from './constants.js';

import FDAI from '../deployments/FDAI.json';
import FWETH from '../deployments/FWETH.json';
import SLFactory from '../deployments/SLFactory.json';
import SLOracle from '../deployments/SLOracle.json';
import SLPoolFDAIFWETH from '../deployments/SLPoolFDAIFWETH.json';
import UniPairFDAIFWETH from '../deployments/UniPairFDAIFWETH.json';
import UniswapV2Factory from '../deployments/UniswapV2Factory.json';
import UniswapV2Router02 from '../deployments/UniswapV2Router02.json';

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

    this.fdai = new this.web3.eth.Contract(FDAI.abi, FDAI.address);
    this.fweth = new this.web3.eth.Contract(FWETH.abi, FWETH.address);
    this.slFactory = new this.web3.eth.Contract(SLFactory.abi, SLFactory.address);
    this.slOracle = new this.web3.eth.Contract(SLOracle.abi, SLOracle.address);
    this.slPool = new this.web3.eth.Contract(SLPoolFDAIFWETH.abi, SLPoolFDAIFWETH.address);
    this.uniPair = new this.web3.eth.Contract(UniPairFDAIFWETH.abi, UniPairFDAIFWETH.address);
    this.unifactory = new this.web3.eth.Contract(UniswapV2Factory.abi, UniswapV2Factory.address);
    this.uniRouter = new this.web3.eth.Contract(UniswapV2Router02.abi, UniswapV2Router02.address);

    this.setProvider(provider, networkId);
    this.setDefaultAccount(this.web3.eth.defaultAccount);
  }


  setProvider(
    provider,
    networkId
  ) {
    this.fdai.setProvider(provider);
    this.fweth.setProvider(provider);
    this.slOracle.setProvider(provider);
    this.slFactory.setProvider(provider);
    this.slPool.setProvider(provider);
    this.uniPair.setProvider(provider);
    this.unifactory.setProvider(provider);
    this.uniRouter.setProvider(provider);
    const contracts = [
      { contract: this.fdai, json: FDAI },
      { contract: this.fweth, json: FWETH },
      { contract: this.slFactory, json: SLFactory },
      { contract: this.slOracle, json: SLOracle },
      { contract: this.slPool, json: SLPoolFDAIFWETH },
      { contract: this.uniPair, json: UniPairFDAIFWETH },
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
      {"pairAddress": this.uniPair.options.address, "poolAddr": this.slPool.options.address}
    ]

    this.names = {};
    this.names[this.fdai.options.address] = "FDAI";
    this.names[this.fweth.options.address] = "FWETH";
    this.names[this.slOracle.options.address] = "SL: Oracle";
    this.names[this.slFactory.options.address] = "SL: Factory";
    this.names[this.slPool.options.address] = "SL: Pool FDAI/FWETH";
    this.names[this.uniPair.options.address] = "UNI: Pair FDAI/FWETH";
    this.names[this.unifactory.options.address] = "UNI: Factory";
    this.names[this.uniRouter.options.address] = "UNI: Router";
  }

  setDefaultAccount(
    account
  ) {
    this.fdai.options.from = account;
    this.fweth.options.from = account;
    this.uniPair.options.from = account;
    this.uniRouter.options.from = account;
    this.unifactory.options.from = account;
    this.slPool.options.from = account;
    this.slFactory.options.from = account;
    this.slOracle.options.from = account
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
