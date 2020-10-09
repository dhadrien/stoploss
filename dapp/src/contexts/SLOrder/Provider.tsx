import React, { useCallback, useEffect, useState } from 'react'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'

import ConfirmTransactionModal from 'components/ConfirmTransactionModal'
import { dai, weth, daiwethpair, daiwethpool } from 'constants/tokenAddresses'
import useApproval from 'hooks/useApproval'
import useSL from 'hooks/useSL';

import {
  makeStopLoss
} from 'sl-sdk/utils'

import Context from './Context'

const Provider: React.FC = ({ children }) => {
  const [confirmTxModalIsOpen, setConfirmTxModalIsOpen] = useState(false)
  // const [countdown, setCountdown] = useState<number>()
  const [isMakingOffer, setIsMakingOffer] = useState(false)

  const sl = useSL()
  const { account } = useWallet()
  
  // const yycrvPoolAddress = yam ? yam.contracts.yycrv_pool.options.address : ''
  const { isApproved, isApproving, onApprove } = useApproval(
    daiwethpair,
    daiwethpool,
    () => setConfirmTxModalIsOpen(false)
  )

  const handleApprove = useCallback(() => {
    setConfirmTxModalIsOpen(true)
    onApprove()
  }, [
    onApprove,
    setConfirmTxModalIsOpen,
  ])

  const handleMakeOffer = useCallback(async (lpAmount, token, amountGuaranteeed) => {
    if (!sl) return
    setConfirmTxModalIsOpen(true)
    await makeStopLoss(sl, lpAmount, token, amountGuaranteeed, account, () => {
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