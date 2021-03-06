import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import {
  ModalProps,
} from 'react-neu'
import {ContextValues} from 'contexts/Manage/types'
import LiquidatedOrder from './LiquidatedOrder';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
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
  const cancelledOrders = orders.stopLosses.filter(order => order.status === "Withdrawn")
  const executedOrders = orders.stopLosses.filter(order => order.status === "Executed")
  return (
    (
      
      <><StyledMain>
        {cancelledOrders.length === 0 && executedOrders.length === 0 ? <p>No Past Liquidations From Your Account</p> : 
        <Table>
          <TableRow>
            <TableCell>Status</TableCell>
            <TableCell>Uniswap Pair</TableCell>
            <TableCell>Token</TableCell>
            <TableCell>Order Size</TableCell>
            <TableCell>Amount Guaranteed</TableCell>
            <TableCell>Amount Withdrawn</TableCell>
            <TableCell>Fees Received</TableCell>
          </TableRow>
        <TableBody>
        {executedOrders.map(order => <LiquidatedOrder order={order} onWithdraw={onWithdraw} isWithdrawing={isWithdrawing} /> )}
        </TableBody>
        </Table>}
      </StyledMain>
      </>
    )
  )
}

export default ManageOrders;