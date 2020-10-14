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
  isLiquidating?: boolean,
  prices?: Prices
  onLiquidate: (pool: string, orderIndex: string, token: string) => void,
}

const OpenOrder: React.FC<CreateOrderProps> = ({order, onLiquidate, isLiquidating, prices}) => {
  const pool = addressMapping[order.uniPair]
  const [price, setPrice] = useState<BigNumber>()
  const [ratioA, setRatioA] = useState<BigNumber>()
  const [ratioB, setRatioB] = useState<BigNumber>()
  const [value, setValue] = useState<BigNumber>()
  const [healthFactor, setHealthFactor] = useState<BigNumber>()
  useEffect(() => {
    const _price = prices?.[addressMapping[order.uniPair]].price;
    const _ratioA = prices?.[addressMapping[order.uniPair]].ratioA
    const _ratioB = prices?.[addressMapping[order.uniPair]].ratioB
    if(_price && _ratioA && _ratioB) {
      const _value = order.tokenToGuarantee == weth.address? 
        _ratioA.multipliedBy(order.lpAmount).dividedBy(new BigNumber(10).pow(18+6)).decimalPlaces(3) :
        _ratioB.multipliedBy(order.lpAmount).dividedBy(new BigNumber(10).pow(18+6)).decimalPlaces(3)
      const _healthFactor = order.tokenToGuarantee == weth.address? 
        _ratioA.dividedBy(order.ratio.multipliedBy(new BigNumber(105))).multipliedBy(new BigNumber(100)).decimalPlaces(2) :
        _ratioB.dividedBy(order.ratio.multipliedBy(new BigNumber(105))).multipliedBy(new BigNumber(100)).decimalPlaces(2)
      setValue(_value);
      setPrice(_price);
      setRatioA(_ratioA);
      setRatioB(_ratioB);
      setHealthFactor(_healthFactor)
    }
    
  },[prices, setPrice, setRatioA, setRatioB])
 
  const handleCreateOrderClick = useCallback(() => {
    onLiquidate(pool, order.orderNumber, order.tokenToGuarantee)
  }, [onLiquidate, pool])
  if (healthFactor?.toString().split(".")[0] != "0") return (null);
  return (
    <>  <tr>
            <td>{order.status}</td>
            <td>{addressMapping[order.uniPair]}</td>
            <td>{addressMapping[order.tokenToGuarantee]}</td>
            <td>{order.tokenInString + " " + addressMapping[order.tokenToGuarantee]}</td>
            <td>{order.amountToGuaranteeString + addressMapping[order.tokenToGuarantee]}</td>
            <td>{value ? 
                  value.toString() + " " + addressMapping[order.tokenToGuarantee] :
                  "loading"}</td>
            <td>{healthFactor ? 
                  healthFactor.toString()
                  : "loading"}</td>
            {/* <td>{order.lpAmountString}</td> */}
            <Button
        // disabled={!lpAmount || !Number(lpAmount)}
        onClick={handleCreateOrderClick}
        text="LIQUIDATE ORDER"
        // variant={!lpAmount || !Number(lpAmount) ? 'secondary' : 'default'}
      />
          </tr>
        
    </>
  )
}

export default OpenOrder;