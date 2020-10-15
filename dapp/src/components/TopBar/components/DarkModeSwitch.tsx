import React, { useEffect } from 'react'

import {
  Emoji,
  Switch,
  SwitchButton,
  useTheme,
} from 'react-neu'

import useLocalStorage from 'hooks/useLocalStorage'

const DarkModeSwitch: React.FC = () => {
  const { darkMode, onToggleDarkMode } = useTheme()
  const [_, setDarkModeSetting] = useLocalStorage('darkMode', darkMode)

  useEffect(() => {
    setDarkModeSetting(darkMode)
  }, [
    darkMode,
    setDarkModeSetting
  ])

  return (null)
}

export default DarkModeSwitch