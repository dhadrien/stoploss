import BigNumber from 'bignumber.js'

export interface ContextValues {
  isWithdrawing?: boolean,
  onWithdraw: (orderIndex: string, token: string) => void,
  orders: StopLossData
}

export interface StopLoss {
  id: number;
  orderNumber?: string;
  uniPair?: string;
  orderer?: string;
  delegated?: Boolean;
  lpAmount?: BigInt;
  tokenToGuarantee?: string;
  tokenIn?: BigInt;
  amountToGuarantee?: BigInt;
  ratio?: BigInt;
  status?: string;
  amountWithdrawn?: BigInt;
  liquidator?: string;
  tokenToLiquidator?: string;
  amountToLiquidator?: BigInt;
}
export interface StopLossData {
  loading: Boolean;
  stopLosses: StopLoss[]
}

export interface StopLossVar{
  orderer: string;
}