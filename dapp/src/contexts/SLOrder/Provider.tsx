import React, { useCallback, useEffect, useState } from 'react'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'

import ConfirmTransactionModal from 'components/ConfirmTransactionModal'
import useApproval from 'hooks/useApproval'
import useSL from 'hooks/useSL';
import {tokenMapping} from 'constants/tokenAddresses';
import {
  makeStopLoss
} from 'sl-sdk/utils'

import Context from './Context'

interface OrderProps {
  children?: React.ReactNode,
  token: string,
  pool?: string
}

const Provider: React.FC<OrderProps> = ({ children, token, pool }) => {
  const [confirmTxModalIsOpen, setConfirmTxModalIsOpen] = useState(false)
  // const [countdown, setCountdown] = useState<number>()
  const [isMakingOffer, setIsMakingOffer] = useState(false)

  const sl = useSL()
  const { account } = useWallet()
  // const yycrvPoolAddress = yam ? yam.contracts.yycrv_pool.options.address : ''
  const { isApproved, isApproving, onApprove } = useApproval(
    tokenMapping[token].address,
    tokenMapping["SLPool" + pool].address,
    () => setConfirmTxModalIsOpen(false)
  )

  const handleApprove = useCallback(() => {
    setConfirmTxModalIsOpen(true)
    onApprove()
  }, [
    onApprove,
    setConfirmTxModalIsOpen,
  ])

  const handleMakeOffer = useCallback(async (lpAmount, pool, token, amountGuaranteeed) => {
    if (!sl) return
    setConfirmTxModalIsOpen(true)
    await makeStopLoss(sl, lpAmount, pool, token, amountGuaranteeed, account, () => {
      setConfirmTxModalIsOpen(false)
      setIsMakingOffer(true)
    })
    setIsMakingOffer(false)
  }, [
    account,
    setConfirmTxModalIsOpen,
    setIsMakingOffer,
    sl
  ])

  // useEffect(() => {
  //   fetchBalances()
  //   let refreshInterval = setInterval(() => fetchBalances(), 10000)
  //   return () => clearInterval(refreshInterval)
  // }, [fetchBalances])

  // useEffect(() => {
  //   let refreshInterval = setInterval(() => setCountdown(farmingStartTime - Date.now()), 1000)
  //   return () => clearInterval(refreshInterval)
  // }, [setCountdown])

  return (
    <Context.Provider value={{
      onMakeOffer: handleMakeOffer,
      isApproved,
      isApproving,
      isMakingOffer,
      onApprove: handleApprove,
    }}>
      {children}
      <ConfirmTransactionModal isOpen={confirmTxModalIsOpen} />
    </Context.Provider>
  )
}

export default Provider