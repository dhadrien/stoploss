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
import { getFullDisplayBalance } from 'utils'
import {
  dai,
  addressMapping,
} from 'constants/tokenAddresses'

interface CreateOrderProps extends ModalProps {
  order: StopLossDisplayed;
  isWithdrawing?: boolean,
  onWithdraw: (pool: string, orderIndex: string, token: string) => void,
}

const CancelledOrder: React.FC<CreateOrderProps> = ({order, onWithdraw, isWithdrawing}) => {


  const handleCreateOrderClick = useCallback(() => {
    onWithdraw(addressMapping[order.uniPair], order.orderNumber || "0", order.tokenToGuarantee || "0x")
  }, [onWithdraw, dai])
  return (
    (
      
      <>  <tr>
              <td>{order.status}</td>
              <td>{addressMapping[order.tokenToGuarantee.toLocaleLowerCase()]}</td>
              <td>{order.tokenInString}</td>
              <td>{order.amountToGuaranteeString}</td>
              <td>{order.amountWithdrawnString} </td>
            </tr>
          
      </>
    )
  )
}

export default CancelledOrder;