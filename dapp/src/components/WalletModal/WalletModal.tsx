import React, { useCallback } from 'react'

import BigNumber from 'bignumber.js'
import styled from 'styled-components'
import { useWallet } from 'use-wallet'
import {tokenNames} from 'constants/tokenAddresses';
import numeral from 'numeral'
import {
  Box,
  Button,
  Modal,
  ModalActions,
  ModalContent,
  ModalProps,
  ModalTitle,
  Separator,
  Spacer
} from 'react-neu'

import FancyValue from 'components/FancyValue'
import Split from 'components/Split'

import useBalances from 'hooks/useBalances'
// import useVesting from 'hooks/useVesting'

const WalletModal: React.FC<ModalProps> = ({
  isOpen,
  onDismiss,
}) => {

  const { reset } = useWallet()
  
  const tokenMapping = useBalances()

  const getDisplayBalance = useCallback((value?: BigNumber) => {
    if (value) {
      return numeral(value).format('0.00a')
    } else {
      return '--'
    }
  }, [])

  const handleSignOut = useCallback(() => {
    reset()
  }, [reset])

  return (  <Modal isOpen={isOpen}>
    <ModalTitle text="My Wallet" />
    <ModalContent>
      <Split>
    {tokenNames.map(
      name=> (
        <Box row>
          <FancyValue
            icon="💰"
            label={`${name} balance`}
            value={getDisplayBalance(tokenMapping[name].balance)}
          />
        </Box>
      )
    )}
    </Split>
    </ModalContent>
    <Separator />
    <ModalActions>
      <Button
        onClick={onDismiss}
        text="Cancel"
        variant="secondary"
      />
      <Button
        onClick={handleSignOut}
        text="SignOut"
      />
    </ModalActions>
  </Modal>
  )
}

export default WalletModal