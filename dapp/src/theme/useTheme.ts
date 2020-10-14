import { useContext } from 'react'
import ThemeContext from './ThemeContext'

const useTheme = () => {
  const {
    darkMode,
    onToggleDarkMode,
    theme,
  } = useContext(ThemeContext)

  return {
    darkMode,
    onToggleDarkMode,
    ...theme
  }
}

export default useTheme