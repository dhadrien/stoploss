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

import TokenInput from 'components/TokenInput'
import useBalances from 'hooks/useBalances'
import { getFullDisplayBalance } from 'utils'
import {
  dai,
} from 'constants/tokenAddresses'
import Split from 'components/Split'
interface CreateOrderProps extends ModalProps {
  onOrder: (amount: string, pool:string, token: string, amountGuaranteed: string) => void,
  token: string,
  pool: string,
  balance?: BigNumber
}

const CreateOrder: React.FC<CreateOrderProps> = ({
  isOpen,
  onDismiss,
  onOrder,
  token,
  pool,
  balance
}) => {

  const [amount, setAmount] = useState('')
  // const [token, setToken] = useState(dai)
  const [amountGuaranteed, setAmountGuaranteed] = useState('')

  const fullBalance = useMemo(() => {
    return getFullDisplayBalance(balance ? balance : new BigNumber(0), 0)
  }, [balance])

  const handleChange = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    setAmount(e.currentTarget.value)
  }, [setAmount])

  const handleSelectMax = useCallback(() => {
    setAmount(fullBalance)
  }, [fullBalance, setAmount])

  const handleChangeGuaranteed = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    setAmountGuaranteed(e.currentTarget.value)
  }, [setAmountGuaranteed])

  const handleCreateOrderClick = useCallback(() => {
    onOrder(amount, pool, token, amountGuaranteed)
  }, [onOrder, amount.toString(), token, amountGuaranteed.toString()])

  return (
    <Modal isOpen={isOpen}>
      <ModalTitle text="Create stop loss offer" />
      <ModalContent>
        <TokenInput
          value={amount}
          onSelectMax={handleSelectMax}
          onChange={handleChange}
          max={fullBalance}
          symbol={token}
        />
        <TokenInput
          value={amountGuaranteed}
          // onSelectMax={handleSelectMaxGuaranteed}
          onChange={handleChangeGuaranteed}
          // max={fullBalance}
          symbol={token + " GUARANTEED"}
        />
        
      </ModalContent>
      <ModalActions>
      <Button
          onClick={onDismiss}
          text="Cancel"
          variant="secondary"
        />
        <Button
          disabled={!amount || !Number(amount)}
          onClick={handleCreateOrderClick}
          text="Create Stop Loss"
          variant={!amount || !Number(amount) ? 'secondary' : 'default'}
        />
      </ModalActions>
    </Modal>
  )
}

export default CreateOrder;