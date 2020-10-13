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
import CreateOrder from './CreateOrder'
import Split from 'components/Split'
import BigNumber from 'bignumber.js'
import {tokenNames} from 'constants/tokenAddresses';

interface SLOrderProps extends ModalProps {
  token: string,
  status: string,
  pools?: string[],
  balance?: BigNumber
}

const SLOrder: React.FC<SLOrderProps> = ({
  token,
  status,
  balance,
  pools
  
}) => {
  const [createOrderModalIsOpen, setcreateOrderModalIsOpen] = useState(false)

  const {
    onMakeOffer,
    isApproved,
    isApproving,
    isMakingOffer,
    onApprove,
  } = useSLOrder()
  // const [tokens, setTokens] = useState<{
  //   name:string,
  //   address: string,
  //   pools: string[],
  //   balance:(BigNumber | undefined)}[]>();
  // useEffect(()=>{
  //   setTokens(tokenNames.map(name => ({
  //     ...tokenMapping[name], name, balance: balances[name]
  //   })));
  // }, [balances])

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
    if (isMakingOffer) {
      return (
        <Button
          disabled
          full
          text="Creating the Stop Loss.."
          variant="secondary"
        />
      )
    }
    if (!isApproved) {
      return (
        <Button
          disabled={isApproving}
          full
          onClick={onApprove}
          text={!isApproving ? "Approve Stop Loss" : "Approving..."}
          variant={isApproving || status !== 'connected' ? 'secondary' : 'tertiary'}
        />
      )
    }

    if (isApproved) {
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
      {tokenMapping[token].pools?.map(pool => (
    <>
    {/* <p>{pool}</p> */}
    <CreateOrder
      isOpen={createOrderModalIsOpen}
      onDismiss={handleDismissCreateOrderModal}
      onOrder={handleOnOrder}
      token={token}
      pool={pool}
      balance={balance}
    />
    </>
    )
    )}
  </>
  )
}

const SLOrders: React.FC = () => {
  const tokenMappingWithBalance = useBalances();
  const { status } = useWallet()
  return (
    <>
      <Split>
        {tokenNames.map(name =>{
            if (tokenMappingWithBalance[name].balance?.toString() == "0") return;
              else return (<>
                <Card>
                <CardIcon>💰</CardIcon>
                <CardContent>
                  <Box
                    alignItems="center"
                    column
                  >
                    <Value value={tokenMappingWithBalance[name].balance? tokenMappingWithBalance[name].balance?.decimalPlaces(2).toString() + " " + name : "--"} />
                    {tokenMappingWithBalance[name].pools?.map(pool=> <Label text={pool} />)}
                    
                  </Box>
                </CardContent>
              <SLOrderProvider token={name} pool={(tokenMappingWithBalance[name].pools || [""])[0]}>
                <SLOrder
                  token={name}
                  pools={tokenMappingWithBalance[name].pools}
                  status={status}
                  balance={tokenMappingWithBalance[name].balance}
                />
              </SLOrderProvider>
              </Card>
              </>
              )
          })}
      </Split>
    </>
  )
}

export default SLOrders;