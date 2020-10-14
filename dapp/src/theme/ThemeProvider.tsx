import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ThemeProvider as StyledThemeProvider } from 'styled-components'

import ThemeContext from './ThemeContext'
import { Theme } from './types'

export interface ThemeProviderProps {
  darkModeEnabled?: boolean,
  darkTheme: Theme,
  lightTheme: Theme
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  darkModeEnabled,
  darkTheme,
  lightTheme,
}) => {
  const [darkMode, setDarkMode] = useState(darkModeEnabled)
  const activeTheme = useMemo(() => {
    if (darkMode) return darkTheme
    return lightTheme
  }, [
    darkMode,
    darkTheme,
    lightTheme,
  ])

  const handleToggleDarkMode = useCallback(() => {
    setDarkMode(!darkMode)
  }, [darkMode, setDarkMode])

  const { baseBg, textColor } = activeTheme
  useEffect(() => {
    document.body.style.background = baseBg
    document.body.style.backgroundAttachment = 'fixed'
    document.body.style.backgroundSize = 'cover'
    document.body.style.color = textColor
  }, [
    baseBg,
    textColor,
  ])

  return (
    <ThemeContext.Provider value={{
      darkMode,
      onToggleDarkMode: handleToggleDarkMode,
      theme: activeTheme,
    }}>
      <StyledThemeProvider theme={activeTheme}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  )
}

export default ThemeProvider