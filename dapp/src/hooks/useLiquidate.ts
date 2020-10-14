import { useContext } from 'react'

import { LiquidateContext } from 'contexts/Liquidate'

const useLiquidate = () => {
  return { ...useContext(LiquidateContext) }
}

export default useLiquidate