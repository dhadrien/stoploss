import { useContext } from 'react'

import { ToLiquidateContext } from 'contexts/ToLiquidate'

const useToLiquidate = () => {
  return { ...useContext(ToLiquidateContext) }
}

export default useToLiquidate