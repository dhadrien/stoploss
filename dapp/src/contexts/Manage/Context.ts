import { createContext } from 'react'

import { ContextValues } from './types'

const Context = createContext<ContextValues>({
  onWithdraw: () => {},
  orders: {loading: true, stopLosses: [{id:1}]},
})

export default Context