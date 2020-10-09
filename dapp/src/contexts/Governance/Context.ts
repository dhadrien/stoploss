import { createContext } from 'react'

import { ContextValues } from './types'

const Context = createContext<ContextValues>({
  onVote: () => {},
  onRegister: () => {},
})

export default Context
