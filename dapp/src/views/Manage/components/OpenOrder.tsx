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
  isWithdrawing?: boolean,
  prices?: Prices
  onWithdraw: (pool: string, orderIndex: string, token: string) => void,
}

const OpenOrder: React.FC<CreateOrderProps> = ({order, onWithdraw, isWithdrawing, prices}) => {
  const pool = addressMapping[order.uniPair]
  const [tokenB, setTokenB] = useState<string>()
  const [price, setPrice] = useState<BigNumber>()
  const [ratioA, setRatioA] = useState<BigNumber>()
  const [ratioB, setRatioB] = useState<BigNumber>()
  const [value, setValue] = useState<BigNumber>()
  const [healthFactor, setHealthFactor] = useState<BigNumber>()
  useEffect(() => {
    const _tokenA = prices?.[addressMapping[order.uniPair]].tokenA
    const _tokenB = prices?.[addressMapping[order.uniPair]].tokenB
    const _ratioA = prices?.[addressMapping[order.uniPair]].ratioA
    const _ratioB = prices?.[addressMapping[order.uniPair]].ratioB
    const _priceA = prices?.[addressMapping[order.uniPair]].priceA
    const _priceB = prices?.[addressMapping[order.uniPair]].priceB
    if(_priceA && _priceB &&  _ratioA && _ratioB && _tokenB) {
      const _price = order.tokenToGuarantee == _tokenA? 
        _priceA : 
        _priceB;
      const _value = order.tokenToGuarantee == _tokenA? 
        _ratioA.multipliedBy(order.lpAmount).dividedBy(new BigNumber(10).pow(18+6)).decimalPlaces(3) :
        _ratioB.multipliedBy(order.lpAmount).dividedBy(new BigNumber(10).pow(18+6)).decimalPlaces(3)
      const _healthFactor = order.tokenToGuarantee == _tokenA?
        _ratioA.dividedBy(order.ratio.multipliedBy(new BigNumber(105))).multipliedBy(new BigNumber(100)).decimalPlaces(2) :
        _ratioB.dividedBy(order.ratio.multipliedBy(new BigNumber(105))).multipliedBy(new BigNumber(100)).decimalPlaces(2)
      setValue(_value);
      setPrice(_price);
      setTokenB(_tokenB);
      setRatioA(_ratioA);
      setRatioB(_ratioB);
      setHealthFactor(_healthFactor)
    }
    
  },[prices, setPrice, setRatioA, setRatioB, setTokenB])
 
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
            <td>{value ? 
                  value.toString() + " " + addressMapping[order.tokenToGuarantee] :
                  "loading"}</td>
            <td>{healthFactor ? 
                  healthFactor.toString()
                  : "loading"}</td>
            <td>{order.lpAmountString}</td>
            <Button
        size="sm"
        onClick={handleCreateOrderClick}
        text="Cancel StopLoss"
      />
          </tr>
        
    </>
  )
}

export default OpenOrder;