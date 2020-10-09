import { createContext } from 'react'

import { ContextValues } from './types'

const Context = createContext<ContextValues>({
  onMakeOffer: () => {},
  onApprove: () => {},
})

export default Context