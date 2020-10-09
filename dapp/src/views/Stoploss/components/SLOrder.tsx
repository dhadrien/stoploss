import React, { useCallback, useMemo, useState } from 'react'

import Countdown, { CountdownRenderProps} from 'react-countdown'
import numeral from 'numeral'
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardIcon,
} from 'react-neu'
import { useWallet } from 'use-wallet'

import Label from 'components/Label'
import Value from 'components/Value'

import useSLOrder from 'hooks/useSLOrder';
import useBalances from 'hooks/useBalances';
import { bnToDec } from 'utils'
import CreateOrder from './CreateOrder'

const SLOrder: React.FC = () => {
  const [createOrderModalIsOpen, setcreateOrderModalIsOpen] = useState(false)

  const { status } = useWallet()
  const {
    onMakeOffer,
    isApproved,
    isApproving,
    isMakingOffer,
    onApprove,
  } = useSLOrder()

  const {
    daiBalance,
    daiwethPairBalance,
  } = useBalances();

  const handleDismissCreateOrderModal = useCallback(() => {
    setcreateOrderModalIsOpen(false)
  }, [setcreateOrderModalIsOpen])



  const handleOnOrder = useCallback((lpAmount: string, token: string, amountGuaranteeed: string) => {
    onMakeOffer(lpAmount, token, amountGuaranteeed)
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
          text="Create Stop Loss"
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
          variant={isApproving || status !== 'connected' ? 'secondary' : 'default'}
        />
      )
    }

    if (isApproved) {
      return (
        <Button
          full
          onClick={handleCreateOrderClick}
          text="Create Stop Loss"
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
      <Card>
        <CardIcon>🦄</CardIcon>
        <CardContent>
          <Box
            alignItems="center"
            column
          >
            <Value value={daiwethPairBalance?.toString() || "--"} />
            <Label text="Available LP Tokens" />
          </Box>
        </CardContent>
        <CardActions>
          {CreateOrderButton}
        </CardActions>
        {/* {typeof countdown !== 'undefined' && countdown > 0 && (
          <CardActions>
            <Countdown date={farmingStartTime} renderer={renderer} />
          </CardActions>
        )} */}
      </Card>
      <CreateOrder
        isOpen={createOrderModalIsOpen}
        onDismiss={handleDismissCreateOrderModal}
        onOrder={handleOnOrder}
      />
    </>
  )
}

export default SLOrder;