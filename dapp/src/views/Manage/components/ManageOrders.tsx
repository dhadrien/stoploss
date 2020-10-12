import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
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
import CancelledOrder from './CancelledOrder';

interface CreateOrderProps extends ContextValues, ModalProps {
}
const StyledMain = styled.div`
  align-items: center;
  box-sizing: border-box;
  text-align: center
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 144px);
  text-align:center;
  float:left;
  position:relative;
  padding: ${props => props.theme.spacing[6]}px 0;
`
const ManageOrders: React.FC<CreateOrderProps> = ({orders, onWithdraw, isWithdrawing}) => {
  console.log("hyyoyoyo", orders.stopLosses);
  const openOrders = orders.stopLosses.filter(order => order.status === "Created")
  console.log("hyyoyoyo222", openOrders);
  const cancelledOrders = orders.stopLosses.filter(order => order.status === "Withdrawn")
  const executedOrders = orders.stopLosses.filter(order => order.status === "Executed")
  return (
    (
      
      <><StyledMain>
      {openOrders.length === 0 ? <p>no open Orders</p> : 
        <table>
        <thead>
          <tr>
            <th>status</th>
            <th>Token Guaranteed</th>
            <th>Token In</th>
            <th>Amount Guaranteed</th>
            <th>Current Value</th>
            <th>Lp Amount</th>
          </tr>
        </thead>
        <tbody>
        {openOrders.map(order => <OpenOrder order={order} onWithdraw={onWithdraw} isWithdrawing={isWithdrawing} /> )}
        </tbody>
        </table>}
        {cancelledOrders.length === 0 && executedOrders.length === 0 ? <p>No Past orders</p> : 
        <table>
        <thead>
          <tr>
            <th>status</th>
            <th>Token Guaranteed</th>
            <th>Token In</th>
            <th>Amount Guaranteed</th>
            <th>Amount Withdrawn</th>
          </tr>
        </thead>
        <tbody>
        {cancelledOrders.map(order => <CancelledOrder order={order} onWithdraw={onWithdraw} isWithdrawing={isWithdrawing} /> )}
        {executedOrders.map(order => <CancelledOrder order={order} onWithdraw={onWithdraw} isWithdrawing={isWithdrawing} /> )}
        </tbody>
        </table>}
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
      </StyledMain>
      </>
    )
  )
}

export default ManageOrders;