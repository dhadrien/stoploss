import React, { useCallback, useMemo, useState } from 'react'

import BigNumber from 'bignumber.js'
import {
  Button,
  Modal,
  ModalActions,
  ModalContent,
  ModalProps,
  ModalTitle,
} from 'react-neu'
import OpenOrder from './OpenOrder';
import {ContextValues} from 'contexts/Manage/types'
import TokenInput from 'components/TokenInput'
import useBalances from 'hooks/useBalances'
import { getFullDisplayBalance } from 'utils'
import {
  dai,
  daiwethpair,
} from 'constants/tokenAddresses'

interface CreateOrderProps extends ContextValues, ModalProps {
}

const ManageOrders: React.FC<CreateOrderProps> = ({orders, onWithdraw, isWithdrawing}) => {
  console.log("hyyoyoyo", orders.stopLosses);
  const openOrders = orders.stopLosses.filter(order => order.status === "Created")
  console.log("hyyoyoyo222", openOrders);
  const withdrawnOrders = orders.stopLosses.filter(order => order.status === "Withdrawn")
  const executedOrders = orders.stopLosses.filter(order => order.status === "Executed")
  return (
    (
      
      <>
      {openOrders.length === 0 ? <p>no open Orders</p> : 
        openOrders.map(order => <OpenOrder order={order} onWithdraw={onWithdraw} isWithdrawing={isWithdrawing} /> )}
      {/* <h3>Stop Losses: UniPair DAI/ETH {orders?.stopLosses[0]?.uniPair}</h3>
      <table>
        <thead>
          <tr>
            <th>status</th>
            <th>Token Guaranteed</th>
            <th>Amount Guaranteed</th>
            <th>Lp Amount</th>
            <th>Amount Withdrawn</th>
            <th>Fees to Liquidator</th>
          </tr>
        </thead>
        <tbody>
          {orders && orders.stopLosses.map(order => {
           return (
            <tr>
              <td>{order.status}</td>
              <td>{order.tokenToGuarantee == dai.toLowerCase() ? "DAI" : "ETH"}</td>
              <td>{order.amountToGuarantee}</td>
              <td>{order.lpAmount}</td>
              <td>{order.amountWithdrawn}</td>
              <td>{order.amountToLiquidator}</td>
            </tr>
          ) 
          })}
        </tbody>
      </table> */}
      </>
    )
  )
}

export default ManageOrders;