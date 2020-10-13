import React, { useCallback, useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'
import { provider } from 'web3-core'

import { getBalance } from 'utils'

import Context from './Context'
import {tokenMapping, tokenNames, TokenMapping} from 'constants/tokenAddresses';


const Provider: React.FC = ({ children }) => {
  const [tokenBalances, setTokenBalances] = useState<TokenMapping>()
  // const [daiwethPairBalance, setDaiwethPairBalance] = useState<BigNumber>()

  const { account, ethereum, balance }: { account: string | null, ethereum: provider, balance: string | null } = useWallet()

  const fetchBalances = useCallback(async (userAddress: string, provider: provider) => {
    await Promise.all(tokenNames.map(async (name) => name === "ETH" ?
      tokenMapping["ETH"].balance = new BigNumber(balance).dividedBy(new BigNumber(10).pow(18)) :
      tokenMapping[name].balance = new BigNumber(await getBalance(provider, tokenMapping[name].address, userAddress)).dividedBy(new BigNumber(10).pow(18))
    ))
    setTokenBalances(tokenMapping);
    // console.log('hahahah', balances);
    // );
    // setDaiBalance(new BigNumber(balances[0]).dividedBy(new BigNumber(10).pow(18)))
    // setUsdcBalance(new BigNumber(balances[1]).dividedBy(new BigNumber(10).pow(18)))
    // setUsdtBalance(new BigNumber(balances[2]).dividedBy(new BigNumber(10).pow(18)))
    // setWbtcBalance(new BigNumber(balances[3]).dividedBy(new BigNumber(10).pow(18)))
    // setWethBalance(new BigNumber(balances[4]).dividedBy(new BigNumber(10).pow(18)))
  }, [
    setTokenBalances,
    balance
    // setWethBalance,
  ])

  useEffect(() => {
    if (account && ethereum) {
      fetchBalances(account, ethereum)
    }
  }, [
    account,
    ethereum,
    fetchBalances,
    balance,
  ])

  useEffect(() => {
    if (account && ethereum) {
      fetchBalances(account, ethereum)
      let refreshInterval = setInterval(() => fetchBalances(account, ethereum), 10000)
      return () => clearInterval(refreshInterval)
    }
  }, [
    account,
    ethereum,
    fetchBalances,
    balance,
  ])

  return (
    <Context.Provider value={
      tokenBalances || tokenMapping
      // "WETH": wethBalance,
      // "DdaiwethPairBalance,
    }>
      {children}
    </Context.Provider>
  )
}

export default Provider