import React, { useCallback, useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'
import { provider } from 'web3-core'

import {
  dai,
  daiwethpair,
} from 'constants/tokenAddresses'
import { getBalance } from 'utils'

import Context from './Context'

const Provider: React.FC = ({ children }) => {
  const [daiBalance, setDaiBalance] = useState<BigNumber>()
  const [daiwethPairBalance, setDaiwethPairBalance] = useState<BigNumber>()

  const { account, ethereum }: { account: string | null, ethereum: provider } = useWallet()

  const fetchBalances = useCallback(async (userAddress: string, provider: provider) => {
    const balances = await Promise.all([
      await getBalance(provider, dai, userAddress),
      await getBalance(provider, daiwethpair, userAddress),
    ])
    console.log('hahahah', balances);
    setDaiBalance(new BigNumber(balances[0]).dividedBy(new BigNumber(10).pow(18)))
    setDaiwethPairBalance(new BigNumber(balances[1]).dividedBy(new BigNumber(10).pow(18)))
  }, [
    setDaiBalance,
    setDaiwethPairBalance
  ])

  useEffect(() => {
    if (account && ethereum) {
      fetchBalances(account, ethereum)
    }
  }, [
    account,
    ethereum,
    fetchBalances,
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
  ])

  return (
    <Context.Provider value={{
      daiBalance,
      daiwethPairBalance,
    }}>
      {children}
    </Context.Provider>
  )
}

export default Provider