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
import usePrice from 'hooks/usePrice'
import { getFullDisplayBalance } from 'utils'
import {
  tokenMapping
} from 'constants/tokenAddresses'
import CancelledOrder from './CancelledOrder';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';



interface CreateOrderProps extends ContextValues, ModalProps {
  open: boolean
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
const ManageOrders: React.FC<CreateOrderProps> = ({open, orders, onWithdraw, isWithdrawing}) => {
  const openOrders = orders.stopLosses.filter(order => order.status === "Created")
  const cancelledOrders = orders.stopLosses.filter(order => order.status === "Withdrawn")
  const executedOrders = orders.stopLosses.filter(order => order.status === "Executed")
  const prices = usePrice(tokenMapping["FETH"].pools || [""]);
  return open ? (
    (
      <>
      <StyledMain>
        
      {openOrders.length === 0 ? <p>No open Orders</p> : 
        <table>
        <TableHead>
          <tr>
            <th>status</th>
            <th>pair</th>
            <th>Token Guaranteed</th>
            <th>Token In</th>
            <th>Amount Guaranteed</th>
            <th>Current Value</th>
            <th>Health Ratio</th>
            <th>Lp Amount</th>
          </tr>
        </TableHead>
        <tbody>
        {openOrders.map(order => <OpenOrder order={order} onWithdraw={onWithdraw} isWithdrawing={isWithdrawing} prices={prices}/> )}
        </tbody>
        </table>}
      </StyledMain>
      </>
    )
  ) : (
      <StyledMain>
      {cancelledOrders.length === 0 && executedOrders.length === 0 ? <p>No Past orders</p> : 
        <table>
        <TableHead>
          <tr>
            <th>status</th>
            <th>Token Guaranteed</th>
            <th>Token In</th>
            <th>Amount Guaranteed</th>
            <th>Amount Withdrawn</th>
          </tr>
        </TableHead>
        <tbody>
        {cancelledOrders.map(order => <CancelledOrder order={order} onWithdraw={onWithdraw} isWithdrawing={isWithdrawing} /> )}
        {executedOrders.map(order => <CancelledOrder order={order} onWithdraw={onWithdraw} isWithdrawing={isWithdrawing} /> )}
        </tbody>
        </table>}
      </StyledMain>
  )
}

export default ManageOrders;