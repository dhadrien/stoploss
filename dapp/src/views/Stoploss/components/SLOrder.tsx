import React, { useCallback, useMemo, useState, useEffect } from 'react'

import Countdown, { CountdownRenderProps} from 'react-countdown'
import numeral from 'numeral'
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  ModalProps,
  CardIcon,
  Container
} from 'react-neu'
import { useWallet } from 'use-wallet'
import {
  tokenMapping,
} from 'constants/tokenAddresses'
import Label from 'components/Label'
import Value from 'components/Value'
import {SLOrderProvider} from 'contexts/SLOrder'
import useSLOrder from 'hooks/useSLOrder';
import useBalances from 'hooks/useBalances';
import useSL from 'hooks/useSL';
import CreateOrder from './CreateOrder'
import Split from 'components/Split'
import BigNumber from 'bignumber.js'
import {tokenNames,} from 'constants/tokenAddresses';
import { ReactComponent } from '*.svg'
import usePrice from 'hooks/usePrice';
import {getSome} from 'sl-sdk/utils'

interface SLOrderProps extends ModalProps {
  token: string,
  status: string,
  pool?: string,
  balance?: BigNumber
}

const SLOrder: React.FC<SLOrderProps> = ({
  token,
  status,
  balance,
  pool
  
}) => {
  const [createOrderModalIsOpen, setcreateOrderModalIsOpen] = useState(false)

  const {
    onMakeOffer,
    isApproved,
    isApproving,
    isMakingOffer,
    onApprove,
  } = useSLOrder()

  const sl = useSL();
  const { account } = useWallet();

  const [isGetting, setIsGetting] = useState(false);
  const toggleIsGetting = () => {
    const oldIsGetting:boolean = isGetting;
    setIsGetting(!oldIsGetting);
  }
  const handleDismissCreateOrderModal = useCallback(() => {
    setcreateOrderModalIsOpen(false)
  }, [setcreateOrderModalIsOpen])


  const handleOnOrder = useCallback((lpAmount: string, pool:string, token: string, amountGuaranteeed: string) => {
    onMakeOffer(lpAmount, pool, token, amountGuaranteeed)
    handleDismissCreateOrderModal()
  }, [handleDismissCreateOrderModal, onMakeOffer])


  const handleCreateOrderClick = useCallback(() => {
    setcreateOrderModalIsOpen(true)
  }, [setcreateOrderModalIsOpen])


  const CreateOrderButton = useMemo(() => {
    if (status !== 'connected') {
      return (
        <Button
          disabled
          full
          text="Provide Liquidity Safely"
          variant="secondary"
        />
      )
    }
    if (balance?.toString() === '0' && !isGetting) {
      return (
        <Button
          disabled={false}
          full
          text={`Get Some Fake ${token == "FETH" ? "ETH" : token}`}
          variant="default"
          onClick={() => {getSome(sl, tokenMapping[token].address, account, () => {toggleIsGetting()})}}
        />
      )
    }
    if (balance?.toString() === '0' && isGetting) {
      return (
        <Button
          disabled={false}
          full
          text={`Getting some ${token == "FETH" ? "ETH" : token}...`}
          variant="secondary"
        />
      )
    }
    if (isMakingOffer) {
      return (
        <Button
          disabled
          full
          text="Providing liquidity with Stoploss.."
          variant="secondary"
        />
      )
    }
    if (!isApproved && token!=="ETH") {
      return (
        <Button
          disabled={isApproving}
          full
          onClick={onApprove}
          text={!isApproving ? "Approve Stop Loss" : "Approving..."}
          variant={isApproving || status !== 'connected' ? 'default' : 'default'}
        />
      )
    }

    if (isApproved || token == "ETH") {
      return (
        <Button
          full
          onClick={handleCreateOrderClick}
          text="Provide Liquidity Safely"
        />
      )
    }
  }, [
    handleCreateOrderClick,
    isApproving,
    onApprove,
    status,
  ])

  return (
    <>
      <CardActions>
        {CreateOrderButton}
      </CardActions>
      <CreateOrder
        isOpen={createOrderModalIsOpen}
        onDismiss={handleDismissCreateOrderModal}
        onOrder={handleOnOrder}
        token={token}
        pool={pool || ""}
        balance={balance}
      />
  </>
  )
}

const SLOrders: React.FC = () => {
  const tokenMappingWithBalance = useBalances();
  const { status } = useWallet()
  const toRend: React.ReactNode[] = [];
  const prices = usePrice(tokenMapping["FETH"].pools || [""]);
  tokenNames
  .sort((name1, name2) => {
    const balance1 = tokenMappingWithBalance[name1].balance || new BigNumber(0)
    const balance2 = tokenMappingWithBalance[name2].balance 
    return balance2?.isGreaterThan(balance1) as (number | undefined) || -1
  }).map(name =>{
      tokenMappingWithBalance[name].pools?.map(pool =>{
        toRend.push( <Card>
          <CardIcon><img style={{blockSize: 100}} src={require('../../../assets/' + name+'.svg')} /></CardIcon>
          <CardContent>
            <Box
              alignItems="center"
              column
            >
              <Value value={tokenMappingWithBalance[name].balance? tokenMappingWithBalance[name].balance?.decimalPlaces(2).toString() + " " + name : "--"} />
              <Label text={<a target="_blank" href={`https://app.uniswap.org/#/swap?inputCurrency=${tokenMapping[pool].tokens?.[0]}&outputCurrency=${tokenMapping[pool].tokens?.[1]}`}>{`🦄 Uniswap ${pool} Pair`}</a> }/>
              <Label text={
                prices && name =="FETH" ? 
                  `1 FETH = ${prices[pool].priceB.decimalPlaces(4).toString()} ${pool.substring(0,4)}` :
                  prices ? 
                  `1 ${name} = ${prices[pool].priceA.decimalPlaces(4).toString()} FETH`
                  : "--"}/>
            </Box>
          </CardContent>
          <SLOrderProvider token={name} pool={pool}>
            <SLOrder
              token={name}
              pool={pool}
              status={status}
              balance={tokenMappingWithBalance[name].balance}
            />
          </SLOrderProvider>
        </Card>)
      })
    })
  return (
    <><Container>
    {toRend.map((render, k) => {
      if(k%3 === 0)
      return (
      <Split>
        {toRend[k]}
        {toRend[k+1]}
        {toRend[k+2]}
        {/* {toRend[k+3]} */}
      </Split>)
    })}
  </Container></>)
}

export default SLOrders;