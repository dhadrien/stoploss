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
import ToLiquidateOrder from './ToLiquidateOrder';
import useToLiquidate from 'hooks/useToLiquidate'
import { useWallet } from 'use-wallet'
import useSL from 'hooks/useSL'

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
const ToLiquidateOrders: React.FC = () => {
  const {orders, onLiquidate, isLiquidating} = useToLiquidate();
  const {account} = useWallet();
  const sl = useSL();
  const prices = usePrice(tokenMapping["ETH"].pools || [""]);
  return (
    (
      <>
      {!orders.loading ? 
          (<><StyledMain>
            {orders.stopLosses.length === 0 ? <p>No ddPast orders</p> : 
              (
              <>
                <h3>{"Fetched Stop Loss in danger: health factor < 1"}</h3>
                <table>
                <thead>
                  <tr>
                    <th>status</th>
                    <th>Pair</th>
                    <th>Token Guaranteed</th>
                    <th>Token In</th>
                    <th>Amount Guaranteed</th>
                    <th>Current Value</th>
                    <th>Health Factor </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.stopLosses.map(order => <ToLiquidateOrder order={order} onLiquidate={onLiquidate} isLiquidating={isLiquidating} prices={prices} />)}
                </tbody>
                </table>
              </>)
            }
          </StyledMain></>) 
        : <p>haha</p>
      }
        
      </>
    )
  )
}

export default ToLiquidateOrders;