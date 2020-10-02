# Quick Hackathon Note: 
Looking for frontend and design help: whether using this great framework (svelte) or building a react-app

What can be done today to start on the UI side: 

By following the README.md of the /contracts github module, you will deploy locally: 
- the DAI/ETH Pool, (forked from mainnet)
- An ethereum user that will have 1. Bought dai 2. Provided Liquidity to the pool.

First UI need is: 
- Showcase the Liquidity Pool tokens you have, the corresponding tokens (here EwTH and DAI)
- Offer the possibility to the user to estimate the effect on their asset depending on the Ether price. (for instance with a ETH/DAI price slider)

Please connect on discord!
# Stop Loss Protocol

## You take risks, you set a wort case scenario, you sleep. Stop Loss will exit your position.

DeFi removed central parties like spot (uniswap/dex) or derivative (snx, dxdy) exchanges which is a great evolution!

Centralized Exchanges (CEX) provided other services like lending: Aave/Compoung provided this service in a decentralized fashion <3

CEXs also offered Stop Loss Service

- You could set a worst case scenario where they would exit your position on your behalf.
- Stop Loss is a protocol that offers this service, in a decentralized fasion.

## MVP UX Goal:

- User provides Liquidity on ETH/DAI uniswap pair. (Price: 1 ETH = 300 DAI).
- User goes to Stop Loss: if price of ETH < 250 DAI => I exit my LP position (convert to DAI the remaining).

# Dev environment setup
Using buidler, typescript, ganache-cli fork mode.
## Deploy the contracts on local dev environment

You need docker installed!

### Install the dependencies
`npm install`

### Setup the enviromnent variables.

To start quick, I created a defaultenv you can start to use: 

`$ cp defaultenv .env`

Then create an infura account, get your projectID: 

`$ echo 'INFURA_TOKEN=MYTOKEN' >> .env`

It is better to create your own .env file

```
## YOUR MNEMONIC, I setup a default one in case you want to start quick
INFURA_TOKEN= YOUR TOKEN
MNEMONIC= YOUR MNEMONIC

# Imports addresses
UNISWAPV2FACTORY_ADDRESS=0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f
UNISWAPV2ROUTERV2_ADDRESS=0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
DAI_ADDRESS=0x6b175474e89094c44da98b954eedeac495271d0f
WETH_ADDRESS=0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2
```

### Let's go 

You are ready to go: 
In a new terminal, launch the local ethereum node (forked from mainnet)

`$ docker-compose up`

Launch the deployments: 

`$ npx buidler deploy --network localhost`
