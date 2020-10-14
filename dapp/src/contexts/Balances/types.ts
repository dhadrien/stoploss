import BigNumber from 'bignumber.js'

export interface ContextValues extends Record<string, {address: string, pools?: string[], balance?:BigNumber}> {
  
}