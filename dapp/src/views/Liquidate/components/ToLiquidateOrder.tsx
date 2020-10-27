import React, { useCallback, useMemo, useState, useEffect } from 'react'

import BigNumber from 'bignumber.js'
import {
  Button,
  ModalProps,
} from 'react-neu'

import {StopLossDisplayed} from 'contexts/Manage/types'
import {
  addressMapping,
} from 'constants/tokenAddresses'
import {Prices} from 'hooks/usePrice';

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
    const _tokenA = prices?.[addressMapping[order.uniPair]].tokenA;
    const _price = prices?.[addressMapping[order.uniPair]].priceA;
    const _ratioA = prices?.[addressMapping[order.uniPair]].ratioA
    const _ratioB = prices?.[addressMapping[order.uniPair]].ratioB
    if(_price && _ratioA && _ratioB) {
      const _value = order.tokenToGuarantee == _tokenA? 
        _ratioA.multipliedBy(order.lpAmount).dividedBy(new BigNumber(10).pow(18+6)).decimalPlaces(3) :
        _ratioB.multipliedBy(order.lpAmount).dividedBy(new BigNumber(10).pow(18+6)).decimalPlaces(3)
        const _healthFactor = order.tokenToGuarantee == _tokenA? 
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
            <Button
        size="sm"
        onClick={handleCreateOrderClick}
        text={isLiquidating ? "LIQUIDATING..." :"LIQUIDATE ORDER"}
      />
          </tr>
        
    </>
  )
}

export default OpenOrder;