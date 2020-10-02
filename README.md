# Stop Loss Protocol

## You take risks, you set a wort case scenario, you sleep. Stop Loss will exit your position.

DeFi removed central parties like spot (uniswap/dex) or derivative (snx, dxdy) exchanges which is a great evolution!

Centralized Exchanges (CEX) provided other services like lending: Aave/Compoung provided this service in a decentralized fashion <3

CEXs also offered Stop Loss Service

- You could set a worst case scenario where they would exit your position on your behalf.
- Stop Loss is a protocol that offers this service, in a decentralized fasion.

## MVP UX Goal:

- User provides $600 of Liquidity on ETH/DAI uniswap pair. (1 ETH, 300 DAI Price: 1 ETH = 300 DAI).
- User goes to Stop Loss: if my position goes under $500: exit in DAI

(Note: A real bull would use STOP LOSS like this: if my position goes under 1.5 DAI: exit in ETH :))

# Dev environment setup
Using buidler, typescript, ganache-cli fork mode. => /contracts