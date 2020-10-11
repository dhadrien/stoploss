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

import {StopLoss} from 'contexts/Manage/types'
import TokenInput from 'components/TokenInput'
import useBalances from 'hooks/useBalances'
import { getFullDisplayBalance } from 'utils'
import {
  dai,
  daiwethpair,
} from 'constants/tokenAddresses'

interface CreateOrderProps extends ModalProps {
  order: StopLoss;
  isWithdrawing?: boolean,
  onWithdraw: (orderIndex: string, token: string) => void,
}

const OpenOrder: React.FC<CreateOrderProps> = ({order, onWithdraw, isWithdrawing}) => {


  const handleCreateOrderClick = useCallback(() => {
    console.log('$$$$$$$$$$$$$', order.orderNumber);
    onWithdraw(order.orderNumber || "0", dai)
  }, [onWithdraw, dai])
  return (
    (
      
      <>  <tr>
              <td>{order.status}</td>
              <td>{order.tokenToGuarantee == dai.toLowerCase() ? "DAI" : "ETH"}</td>
              <td>{order.amountToGuarantee}</td>
              <td>{order.lpAmount}</td>
              <td>{order.amountWithdrawn}</td>
              <td>{order.amountToLiquidator}</td>
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