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

const CancelledOrder: React.FC<CreateOrderProps> = ({order, onWithdraw, isWithdrawing}) => {


  const handleCreateOrderClick = useCallback(() => {
    onWithdraw(order.orderNumber || "0", order.tokenToGuarantee || "0x")
  }, [onWithdraw, dai])
  return (
    (
      
      <>  <tr>
              <td>{order.status}</td>
              <td>{order.tokenToGuarantee == dai.toLowerCase() ? "DAI" : "ETH"}</td>
              <td>{order.tokenIn}</td>
              <td>{order.amountToGuarantee}</td>
              <td>{order.amountWithdrawn} </td>
            </tr>
          
      </>
    )
  )
}

export default CancelledOrder;