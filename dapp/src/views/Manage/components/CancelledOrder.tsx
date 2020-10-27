import React, { useCallback, useMemo, useState } from 'react'

import {
  ModalProps,
} from 'react-neu'

import {StopLossDisplayed} from 'contexts/Manage/types'
import {
  addressMapping,
} from 'constants/tokenAddresses'

interface CreateOrderProps extends ModalProps {
  order: StopLossDisplayed;
  isWithdrawing?: boolean,
  onWithdraw: (pool: string, orderIndex: string, token: string) => void,
}

const CancelledOrder: React.FC<CreateOrderProps> = ({order, onWithdraw, isWithdrawing}) => {

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