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

import {StopLoss, StopLossDisplayed} from 'contexts/Manage/types'
import TokenInput from 'components/TokenInput'
import useBalances from 'hooks/useBalances'
import usePrice from 'hooks/usePrice'
import { getFullDisplayBalance } from 'utils'
import {
  dai,
  weth,
  daiwethpair,
} from 'constants/tokenAddresses'



interface CreateOrderProps extends ModalProps {
  order: StopLossDisplayed;
  isWithdrawing?: boolean,
  onWithdraw: (orderIndex: string, token: string) => void,
}

const OpenOrder: React.FC<CreateOrderProps> = ({order, onWithdraw, isWithdrawing}) => {
  const {price, ratioA, ratioB} = usePrice();
  console.log(order);
  const handleCreateOrderClick = useCallback(() => {
    onWithdraw(order.orderNumber, order.tokenToGuarantee)
  }, [onWithdraw, dai])
  return order.tokenToGuarantee == weth.toLowerCase() ?
   (
    (
      
      <>  <tr>
              <td>{order.status}</td>
              <td>ETH</td>
              <td>{order.tokenInString}</td>
              <td>{order.amountToGuaranteeString}</td>
              <td>{price && ratioA ? ratioA.multipliedBy(order.lpAmount).dividedBy(new BigNumber(10).pow(18+6)).decimalPlaces(3).toString() : "loading"}</td>
              <td>{order.lpAmountString}</td>
              <Button
          // disabled={!lpAmount || !Number(lpAmount)}
          onClick={handleCreateOrderClick}
          text="Cancel StopLoss"
          // variant={!lpAmount || !Number(lpAmount) ? 'secondary' : 'default'}
        />
            </tr>
          
      </>
    )
  ) :
  (
    (
      
      <>  <tr>
              <td>{order.status}</td>
              <td>DAI</td>
              <td>{order.tokenInString}</td>
              <td>{order.amountToGuaranteeString}</td>
              <td>{price && ratioB ? ratioB.multipliedBy(order.lpAmount).dividedBy(new BigNumber(10).pow(18+6)).decimalPlaces(3).toString() : "loading"}</td>
              <td>{order.lpAmountString}</td>
              <Button
          // disabled={!lpAmount || !Number(lpAmount)}
          onClick={handleCreateOrderClick}
          text="Cancel StopLoss"
          // variant={!lpAmount || !Number(lpAmount) ? 'secondary' : 'default'}
        />
            </tr>
          
      </>
    )
  )
}

export default OpenOrder;