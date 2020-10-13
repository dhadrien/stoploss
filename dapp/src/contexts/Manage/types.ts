import BigNumber from 'bignumber.js'

export interface ContextValues {
  isWithdrawing?: boolean,
  onWithdraw: (pool: string, orderIndex: string, token: string) => void,
  orders: StopLossDataDisplayed
}

export interface StopLossDisplayed extends StopLoss {
  lpAmountString?: string,
  tokenInString?: string,
  amountToGuaranteeString?: string,
  ratioString?: string,
  amountWithdrawnString?: string,
  amountToLiquidatorString?: string,
}

export interface StopLoss {
  id: number;
  orderNumber: string;
  uniPair: string;
  orderer: string;
  delegated: Boolean;
  lpAmount: BigNumber;
  tokenToGuarantee: string;
  tokenIn: BigNumber;
  amountToGuarantee: BigNumber;
  ratio: BigNumber;
  status: string;
  amountWithdrawn?: BigNumber;
  liquidator?: string;
  tokenToLiquidator?: string;
  amountToLiquidator?: BigNumber;
}
export interface StopLossData {
  loading: Boolean;
  stopLosses: StopLoss[]
}

export interface StopLossDataDisplayed {
  loading: Boolean;
  stopLosses: StopLossDisplayed[]
}

export interface StopLossVar{
  orderer: string;
}