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
  onOrder: (lpAmount: string, pool:string, token: string, amountGuaranteed: string) => void,
  token: string,
  pool: string,
}

const CreateOrder: React.FC<CreateOrderProps> = ({
  isOpen,
  onDismiss,
  onOrder,
  token,
  pool
}) => {

  const [lpAmount, setLpAmount] = useState('')
  // const [token, setToken] = useState(dai)
  const [amountGuaranteed, setAmountGuaranteed] = useState('')
  const { daiwethPairBalance } = useBalances()

  const fullBalance = useMemo(() => {
    return getFullDisplayBalance(new BigNumber(0), 0)
  }, [daiwethPairBalance])

  const handleChange = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    setLpAmount(e.currentTarget.value)
  }, [setLpAmount])

  const handleSelectMax = useCallback(() => {
    setLpAmount(fullBalance)
  }, [fullBalance, setLpAmount])

  const handleChangeGuaranteed = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    setAmountGuaranteed(e.currentTarget.value)
  }, [setAmountGuaranteed])

  const handleCreateOrderClick = useCallback(() => {
    onOrder(lpAmount, pool, token, amountGuaranteed)
  }, [onOrder, lpAmount.toString(), token, amountGuaranteed.toString()])

  return (
    <Modal isOpen={isOpen}>
      <ModalTitle text="Create stop loss offer" />
      <ModalContent>
        <TokenInput
          value={lpAmount}
          onSelectMax={handleSelectMax}
          onChange={handleChange}
          max={fullBalance}
          symbol="DAI/WETH LP"
        />
        <TokenInput
          value={amountGuaranteed}
          // onSelectMax={handleSelectMaxGuaranteed}
          onChange={handleChangeGuaranteed}
          // max={fullBalance}
          symbol="DAI TO GUARANTEE"
        />
        
      </ModalContent>
      <ModalActions>
      <Button
          onClick={onDismiss}
          text="Cancel"
          variant="secondary"
        />
        <Button
          disabled={!lpAmount || !Number(lpAmount)}
          onClick={handleCreateOrderClick}
          text="Create Stop Loss"
          variant={!lpAmount || !Number(lpAmount) ? 'secondary' : 'default'}
        />
      </ModalActions>
    </Modal>
  )
}

export default CreateOrder;