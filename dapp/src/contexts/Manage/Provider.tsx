import React, { useCallback, useEffect, useState } from 'react'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'

import ConfirmTransactionModal from 'components/ConfirmTransactionModal'
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
        ratio
        tokenIn
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
  const [orders, setOrders] = useState<StopLossData>();

  const sl = useSL()
  const { account } = useWallet()
  const { loading, data } = useQuery<StopLossData, StopLossVar>(
    STOPLOSSES_QUERY, 
    {
      variables: {orderer: account || "", },
      pollInterval: 10000,
      notifyOnNetworkStatusChange: true,
      onCompleted: () => {setOrders({loading, stopLosses: (data?.stopLosses.map(order => 
        ({
          ...order, 
          lpAmountString: (new BigNumber(order.lpAmount).dividedBy(new BigNumber(10).pow(18))).decimalPlaces(3).toString(),
          tokenInString: (new BigNumber(order.tokenIn).dividedBy(new BigNumber(10).pow(18))).decimalPlaces(3).toString(),
          amountToGuaranteeString: (new BigNumber(order.amountToGuarantee).dividedBy(new BigNumber(10).pow(18))).decimalPlaces(3).toString(),
          ratioString: (new BigNumber(order.ratio).dividedBy(new BigNumber(10).pow(18+6))).decimalPlaces(3).toString(),
          amountWithdrawnString: (new BigNumber(order.amountWithdrawn || 1).dividedBy(new BigNumber(10).pow(18))).decimalPlaces(3).toString(),
          amountToLiquidatorString: (new BigNumber(order.amountToLiquidator || 1).dividedBy(new BigNumber(10).pow(18))).decimalPlaces(3).toString(),
        })
      ) || [{
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
      }])})}},
      
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
   

  const handleWithdraw = useCallback(async (pool, orderIndex, token) => {
    if (!sl) return
    setConfirmTxModalIsOpen(true)
    await withdrawStopLoss(sl, pool, orderIndex, token, account, () => {
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
      orders: orders || ({loading: true, stopLosses: ([{
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
      }])
    }),
    }}>
      {children}
      <ConfirmTransactionModal isOpen={confirmTxModalIsOpen} />
    </Context.Provider>
  )
}

export default Provider