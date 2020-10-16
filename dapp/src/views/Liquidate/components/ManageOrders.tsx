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
import {ContextValues} from 'contexts/Manage/types'
import TokenInput from 'components/TokenInput'
import useBalances from 'hooks/useBalances'
import usePrice from 'hooks/usePrice'
import { getFullDisplayBalance } from 'utils'
import {
  tokenMapping
} from 'constants/tokenAddresses'
import LiquidatedOrder from './LiquidatedOrder';

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
  const openOrders = orders.stopLosses.filter(order => order.status === "Created")
  const cancelledOrders = orders.stopLosses.filter(order => order.status === "Withdrawn")
  const executedOrders = orders.stopLosses.filter(order => order.status === "Executed")
  const prices = usePrice(tokenMapping["FETH"].pools || [""]);
  return (
    (
      
      <><StyledMain>
        {cancelledOrders.length === 0 && executedOrders.length === 0 ? <p>No Past orders</p> : 
        <table>
        <thead>
          <tr>
            <th>status</th>
            <th>Pair</th>
            <th>Token Guaranteed</th>
            <th>Token In</th>
            <th>Amount Guaranteed</th>
            <th>Amount Withdrawn</th>
            <th>Fees Received </th>
          </tr>
        </thead>
        <tbody>
        {executedOrders.map(order => <LiquidatedOrder order={order} onWithdraw={onWithdraw} isWithdrawing={isWithdrawing} /> )}
        </tbody>
        </table>}
      </StyledMain>
      </>
    )
  )
}

export default ManageOrders;