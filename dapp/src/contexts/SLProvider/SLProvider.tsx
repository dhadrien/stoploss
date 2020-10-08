import React, { createContext, useEffect, useState } from 'react'

import { useWallet } from 'use-wallet'

import { Stoploss } from 'sl-sdk/lib'

export interface SLContext {
  sl?: any
}

export const Context = createContext<SLContext>({
  sl: undefined,
})

declare global {
  interface Window {
    slsauce: any
  }
}

const SLProvider: React.FC = ({ children }) => {
  const { ethereum } = useWallet()
  const [sl, setSL] = useState<any>()

  useEffect(() => {
    if (ethereum) {
      const SLLib = new Stoploss(
        ethereum,
        "1",
        false, {
          defaultAccount: "",
          defaultConfirmations: 1,
          autoGasMultiplier: 1.5,
          testing: false,
          defaultGas: "6000000",
          defaultGasPrice: "1000000000000",
          accounts: [],
          ethereumNodeTimeout: 10000
        }
      )

      setSL(SLLib)
      window.slsauce = SLLib
    }
  }, [ethereum])

  return (
    <Context.Provider value={{ sl }}>
      {children}
    </Context.Provider>
  )
}

export default SLProvider
