import { createContext } from 'react'

import { ContextValues, StopLossData } from './types'
import BigNumber from 'bignumber.js'


const Context = createContext<ContextValues>({
  onLiquidate: () => {},
  orders: {loading: true, stopLosses: [{
    id: 0,
    orderNumber: "1",
    uniPair: "0x",
    orderer: "string",
    delegated: false,
    lpAmount: new BigNumber(1),
    tokenToGuarantee: "token",
    tokenIn: new BigNumber(1),
    amountToGuarantee: new BigNumber(1),
    ratio: new BigNumber(1),
    status: "status",
    lpAmountString: "string",
    tokenInString: "string",
    amountToGuaranteeString: "string",
    ratioString: "string",
    amountWithdrawnString: "string",
    amountToLiquidatorString: "string",
  }]},
})

export default Context