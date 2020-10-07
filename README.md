# Stop 😈 Loss Protocol

## Project Description

😈 The stoploss protocol is a decentralized protocol against impermanent losses.

Is allows Liquidity Providers (LPs) to limit their impermanent losses on Automated Market Makers (AMMs, eg. Uniswap) in a safe, automated and non-custodial way.

### Problem Statement

Impermanent losses for LPs is recognized in the industry as the biggest problem of AMMs: "*Impermanent loss is by far one of the biggest detriments to the success of DEXs like Uniswap."* — Lucas and Cooper

*« :Imp:ermanent losses has become a problem about equal to having an elephant in the living room. It's so big you just can't ignore it. »* — :smiling-imp:
**

![Banner](https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F5fd6f7f5-8932-4fe0-804f-ef6ecbfd00b7%2FCCA0D3A6-B21B-4E18-AC14-62F4D135B90E.jpeg?table=block&id=f858c91f-6d9b-4f84-a11a-f4df695ba755&width=2690&userId=&cache=v2)

### Stoploss.finance Alpha specs

Most LPs supplying liquidity to AMMs such as Uniswap suffer from Impermanent losses. [StopLoss.finance](http://stoploss.Finance) will allow LPs to limit those losses via a decentralized StopLoss protocol that triggers automated liquidations based on users' maximum acceptable loss.

The alpha version will allow users on [https://stoploss.finance](https://stoploss.finance)  to: 

1. Provide Liquidity to the 4 [UNI Pools](https://app.uniswap.org/#/uni) [(](https://uniswap.org/blog/uni/)[ETH/USDT](https://uniswap.info/pair/0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852), [ETH/USDC,](https://uniswap.info/pair/0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc) [ETH/DAI](https://uniswap.info/pair/0xa478c2975ab1ea89e8196811f51a7b7ade33eb11) & [ETH/WBTC](https://uniswap.info/pair/0xbb2b8038a1640196fbe3e38816f3e67cba72d940))
2. Set a stop loss order to limit impermanent losses with a guaranteed amount in Tokens

Example: 

- Provide 700 DAI as liquidity in the ETH/DAI pool
- Place a stop-loss order guaranteeing 500 DAI
- If the liquidity of the LP gets close to 500 DAI (500+X%), LP position will get liquidated, 500 DAI will be sent to the LP.*

OR For the most bullish of us

- Provide 3 ETH in the ETH/DAI pool
- Place a stop-loss order guaranteeing 2 ETH
- If the liquidity of the LP gets close to 2ETH (2ETH+X%), LP position will get liquidated, 2ETH DAI will be sent to the LP.*

**The agent in charge of liquidating the position will get the X%*

## Dev environment setup
[Soon™]
