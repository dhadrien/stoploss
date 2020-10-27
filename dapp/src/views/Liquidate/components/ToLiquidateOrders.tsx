import React from 'react'
import styled from 'styled-components'
import {
  ModalProps,
} from 'react-neu'
import {ContextValues} from 'contexts/Manage/types'
import usePrice from 'hooks/usePrice'
import {
  tokenMapping
} from 'constants/tokenAddresses'
import ToLiquidateOrder from './ToLiquidateOrder';
import useToLiquidate from 'hooks/useToLiquidate'
import { useWallet } from 'use-wallet'
import useSL from 'hooks/useSL'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';

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
const ToLiquidateOrders: React.FC = () => {
  const {orders, onLiquidate, isLiquidating} = useToLiquidate();
  const prices = usePrice(tokenMapping["FETH"].pools || [""]);
  return (
    (
      <>
      {!orders.loading ? 
          (<><StyledMain>
            {orders.stopLosses.length === 0 ? <p>No ddPast orders</p> : 
              (
              <>
                <h3>{"Fetched Stop Loss in danger: health factor < 1"}</h3>
                <TableContainer>
                <Table>
                  <TableRow>
                    <TableCell>status</TableCell>
                    <TableCell>Pair</TableCell>
                    <TableCell>Token Guaranteed</TableCell>
                    <TableCell>Token In</TableCell>
                    <TableCell>Amount Guaranteed</TableCell>
                    <TableCell>Current Value</TableCell>
                    <TableCell>Health Factor</TableCell>
                  </TableRow>
                <TableBody>
                  {orders.stopLosses.map(order => <ToLiquidateOrder order={order} onLiquidate={onLiquidate} isLiquidating={isLiquidating} prices={prices} />)}
                </TableBody>
                </Table>
                </TableContainer>
              </>)
            }
          </StyledMain></>) 
        : <p></p>
      }
        
      </>
    )
  )
}

export default ToLiquidateOrders;