import { createContext } from 'react'

import createTheme from './createTheme'
import { ThemeContextValue } from './types'

const { light: lightTheme } = createTheme()

const ThemeContext = createContext<ThemeContextValue>({
  onToggleDarkMode: () => {},
  theme: lightTheme
})

export default ThemeContext