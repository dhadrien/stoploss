import BigNumber from 'bignumber.js'

export interface ContextValues {
  isApproved?: boolean,
  isApproving?: boolean,
  isMakingOffer?: boolean,
  onMakeOffer: (lpAmount: string, token: string, amountGuaranteeed: string) => void,
  onApprove: () => void,
}