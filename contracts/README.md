
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
