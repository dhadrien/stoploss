import { useContext } from 'react'

import { LiquidateContext } from 'contexts/Liquidated'

const useLiquidate = () => {
  return { ...useContext(LiquidateContext) }
}

export default useLiquidate