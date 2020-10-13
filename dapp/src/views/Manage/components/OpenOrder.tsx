import React, { useCallback, useMemo, useState, useEffect } from 'react'

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
  weth,
  addressMapping,
} from 'constants/tokenAddresses'

import {Price, Prices} from 'hooks/usePrice';

interface CreateOrderProps extends ModalProps {
  order: StopLossDisplayed;
  isWithdrawing?: boolean,
  prices?: Prices
  onWithdraw: (pool: string, orderIndex: string, token: string) => void,
}

const OpenOrder: React.FC<CreateOrderProps> = ({order, onWithdraw, isWithdrawing, prices}) => {
  const pool = addressMapping[order.uniPair]
  const [price, setPrice] = useState<BigNumber>()
  const [ratioA, setRatioA] = useState<BigNumber>()
  const [ratioB, setRatioB] = useState<BigNumber>()
  useEffect(() => {
    setPrice(prices?.[addressMapping[order.uniPair]].price);
    setRatioA(prices?.[addressMapping[order.uniPair]].ratioA);
    setRatioB(prices?.[addressMapping[order.uniPair]].ratioB);
  },[prices, setPrice, setRatioA, setRatioB])
 
  const handleCreateOrderClick = useCallback(() => {
    onWithdraw(pool, order.orderNumber, order.tokenToGuarantee)
  }, [onWithdraw, pool])
  return(
    <>  <tr>
            <td>{order.status}</td>
            <td>{addressMapping[order.uniPair]}</td>
            <td>{addressMapping[order.tokenToGuarantee]}</td>
            <td>{order.tokenInString + " " + addressMapping[order.tokenToGuarantee]}</td>
            <td>{order.amountToGuaranteeString + addressMapping[order.tokenToGuarantee]}</td>
            <td>{price && ratioA && ratioB ? 
                  order.tokenToGuarantee == weth.address? 
                    ratioA.multipliedBy(order.lpAmount).dividedBy(new BigNumber(10).pow(18+6)).decimalPlaces(3).toString() + " " + addressMapping[order.tokenToGuarantee]
                    : ratioB.multipliedBy(order.lpAmount).dividedBy(new BigNumber(10).pow(18+6)).decimalPlaces(3).toString() + " " + addressMapping[order.tokenToGuarantee]
                  : "loading"}</td>
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
}

export default OpenOrder;