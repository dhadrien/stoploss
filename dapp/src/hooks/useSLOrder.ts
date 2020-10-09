import { useContext } from 'react'

import { SLOrderContext } from 'contexts/SLOrder'

const useSLOrder = () => {
  return { ...useContext(SLOrderContext) }
}

export default useSLOrder