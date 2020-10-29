# Stop 😈 Loss Protocol

## Project Description

😈 The Stoploss Protocol gives you more control over the risk you are taking when participating in DeFi.

**It brings Stop-loss and take-profit orders in DeFi**, one of the essential features of financial systems, without taking custody of the funds involved.

The first version of the Stoploss Protocol, developped during Ethonline hackathon, focuses on **insuring Liquidity Providers on Uniswap against Impermanent Loss** (IL).

Provide Liquidity, Set your maximum amount of IL, the protocol **guarantees you to exit your LP position when needed**.

Find below our demo for Ethonline :)

[![Stoploss Demo](https://img.youtube.com/vi/qpoUf3ILZNs/0.jpg)](https://www.youtube.com/watch?v=qpoUf3ILZNs "stoploss@ethonline")

### Why AMMs?

Impermanent losses for LPs is recognized in the industry as the biggest problem of AMMs: "*Impermanent loss is by far one of the biggest detriments to the success of DEXs like Uniswap."* — Lucas and Cooper

AMM are still new and the understanding of Impermanent Loss is reserved for experts. By insuring LP activities, we hope to help new commers to experiment with **Liquidity Providing in a safer environment**. 

We are also providing a **new DeFi primitive**, that we are sure DeFi individuals and protocols will leverage for new sophisticated strategies.

### Stoploss.finance Alpha specs

Most LPs supplying liquidity to AMMs such as Uniswap suffer from Impermanent losses. Stoploss allows LPs to limit those losses via a decentralized StopLoss protocol that triggers automated liquidations based on users' maximum acceptable loss.
The alpha version will allow users on [https://kovan.stoploss.finance](http://kovan.stoploss.finance)  to: 
1. Provide Liquidity to the 4 [UNI Pools](https://app.uniswap.org/#/uni) [(](https://uniswap.org/blog/uni/)[ETH/USDT](https://uniswap.info/pair/0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852), [ETH/USDC,](https://uniswap.info/pair/0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc) [ETH/DAI](https://uniswap.info/pair/0xa478c2975ab1ea89e8196811f51a7b7ade33eb11) & [ETH/WBTC](https://uniswap.info/pair/0xbb2b8038a1640196fbe3e38816f3e67cba72d940))
2. Set a stop loss order to limit impermanent losses with a guaranteed amount in Tokens

![MiroBoard](https://drive.google.com/uc?export=view&id=1ZaDDQf9Ccfw1hVstczXKTQ9biqd3Ytu-)

Example: 

- Provide 700 DAI as liquidity in the ETH/DAI pool
- Place a stop-loss order guaranteeing 500 DAI
- If the liquidity of the LP gets close to 500 DAI (500+X%), LP position will get liquidated, 500 DAI will be sent to the LP.*

OR For the most bullish of us

- Provide 3 ETH in the ETH/DAI pool
- Place a stop-loss order guaranteeing 2 ETH
- If the liquidity of the LP gets close to 2ETH (2ETH+X%), LP position will get liquidated, 2ETH DAI will be sent to the LP.*

**The agent in charge of liquidating the position will get the X%*



### Kovan Deployment

http://kovan.stoploss.finance/

- Subgraph: https://thegraph.com/explorer/subgraph/dhadrien/stoploss-subgraph-kovan

- StopLoss factory on kovan: 0xdF2Bde4940EFA578068DD44f11b06d066dA07253

- FETH Token : 0xf40F537701098aA93294189395E0d9A5316C3D47
- FDAI Token : 0x7062a05C08d5a6E61Ff05C6D850b3485DB5DEf40
- FUSDC Token : 0x91Fc8CAdb3A7D2c142a7FcfAa94be9e730cDE147
- FUSDT Token : 0x8b3135358af861dcb253B0Af93A5be66a32c2B97
- FWBTC Token : 0x23a698d97f601eA4db799Dda3108e3386A15E45b

- Token Vault: 0x37F38422eA99eABCF64c4ac30123F334E8093FD1

- FETH/FDAI Uniswap Pair : 0x7b386F21A3E5A464Dc9293bA19EE2a681830513F
- FETH/FUSDC Uniswap Pair : 0xA63042674e0dfeE36E1B47Df6088724996625494
- FETH/FUSDT Uniswap Pair : 0xb2052C151a2aef858f69022494E2c6def5E87851
- FETH/FWBTC Uniswap Pair : 0x58A49507E60e41cb1Ca0Bc651519C32C97A98600
- FETH/FDAI Stoploss Pool : 0xF5d8D17B673e1f2c0e3225A90A44D516418b76C5
- FETH/FUSDC Stoploss Pool : 0xfb553db85b7e04FDaE0adB252261b557b91E93c3
- FETH/FUSDT Stoploss Pool : 0x790A148e3122e2c51045fB7d9f986FdC5fA21A9e
- FETH/FWBTC Stoploss Pool : 0xb3871715Ba1184e3C10890d1e1dce9Df01c45c30
