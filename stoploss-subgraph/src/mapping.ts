import { StopLossCreated, WithdrawStopLoss, StopLossExecuted, Update } from '../generated/SLPoolFDAIFWETH/SLPoolFDAIFWETH'
import { StopLoss, PoolStatus } from '../generated/schema'

export function handleNewStopLoss(event: StopLossCreated): void {
  let stoploss = new StopLoss(event.params.tokenToGuarantee.toString() + event.params.orderNumber.toString())
  stoploss.uniPair = event.params.uniPair
  stoploss.orderer = event.params.orderer
  stoploss.delegated = event.params.delegated
  stoploss.lpAmount = event.params.lpAmount
  stoploss.tokenToGuarantee = event.params.tokenToGuarantee
  stoploss.amountToGuarantee = event.params.amountToGuarantee
  stoploss.ratio = event.params.ratio
  stoploss.status = "Created";
  stoploss.save()
}

export function handleWithdrawStopLoss(event: WithdrawStopLoss): void {
  let stoploss = StopLoss.load(event.params.tokenWithdrawn.toString() + event.params.orderNumber.toString());
  stoploss.status = "Withdrawn";
  stoploss.amountWithdrawn = event.params.amountWithdrawn;
  stoploss.save()
}
export function handleStopLossExecuted(event: StopLossExecuted): void {
  let stoploss = StopLoss.load(event.params.tokenWithdrawn.toString() + event.params.orderNumber.toString());
  stoploss.status = "Executed";
  stoploss.amountWithdrawn = event.params.amountWithdrawn;
  stoploss.liquidator = event.params.liquidator;
  stoploss.tokenToLiquidator = event.params.tokenToLiquidator;
  stoploss.amountToLiquidator = event.params.amountToLiquidator;
  stoploss.save()
}
export function handleUpdate(event: Update): void {
  let pool = new PoolStatus(event.params.timeStamp.toHex())
  pool.timeStamp = event.params.timeStamp;
  pool.priceA = event.params.newPriceA
  pool.ratioA = event.params.newRatioA
  pool.ratioB = event.params.newRatioB
  pool.save()
}
