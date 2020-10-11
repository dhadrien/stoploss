import React, { useCallback, useEffect, useState } from 'react'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'

import ConfirmTransactionModal from 'components/ConfirmTransactionModal'
import { dai, weth, daiwethpair, daiwethpool } from 'constants/tokenAddresses'
import { gql, useQuery } from '@apollo/client';
import useSL from 'hooks/useSL';

import {
  withdrawStopLoss
} from 'sl-sdk/utils'

import Context from './Context'
import { StopLossData, StopLossVar, StopLoss } from './types'

const STOPLOSSES_QUERY = gql`
    query GetStopLoss($orderer: String) {
      stopLosses (where: { orderer: $orderer}) {
        id
        uniPair
        orderNumber
        status
        orderer
        tokenToGuarantee
        amountToGuarantee
        lpAmount
        amountToLiquidator
        amountWithdrawn
      }
    }
  `;

const Provider: React.FC = ({ children }) => {
  const [confirmTxModalIsOpen, setConfirmTxModalIsOpen] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [orders, setOrders] = useState<StopLossData>({loading: true, stopLosses: [{id:1}]});

  const sl = useSL()
  const { account } = useWallet()
  const { loading, data } = useQuery<StopLossData, StopLossVar>(
    STOPLOSSES_QUERY, 
    {
      variables: {orderer: account || "", },
      pollInterval: 10000,
      notifyOnNetworkStatusChange: true,
      onCompleted: () => {setOrders({loading, stopLosses: (data?.stopLosses || [{id:1}])})}},
      
  );
  
  //  useEffect(() => {
  //   let refreshInterval = setInterval(() => {
  //     return setOrders({loading, stopLosses: (data?.stopLosses || [{id:1}])});
  //   }, 2000)
  //   return () => clearInterval(refreshInterval)
  // }, [setOrders, loading])
  
  // const yycrvPoolAddress = yam ? yam.contracts.yycrv_pool.options.address : ''
  // const { isApproved, isApproving, onApprove } = useApproval(
  //   daiwethpair,
  //   daiwethpool,
  //   () => setConfirmTxModalIsOpen(false)
  // )

  // const handleApprove = useCallback(() => {
  //   setConfirmTxModalIsOpen(true)
  //   onApprove()
  // }, [
  //   onApprove,
  //   setConfirmTxModalIsOpen,
  // ])
   

  const handleWithdraw = useCallback(async (orderIndex, token) => {
    if (!sl) return
    setConfirmTxModalIsOpen(true)
    await withdrawStopLoss(sl, orderIndex, token, account, () => {
      setConfirmTxModalIsOpen(false)
      setIsWithdrawing(true)
    })
    setIsWithdrawing(false)
  }, [
    account,
    setConfirmTxModalIsOpen,
    setIsWithdrawing,
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
      onWithdraw: handleWithdraw,
      isWithdrawing,
      orders,
    }}>
      {children}
      <ConfirmTransactionModal isOpen={confirmTxModalIsOpen} />
    </Context.Provider>
  )
}

export default Provider