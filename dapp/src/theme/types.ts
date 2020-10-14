export interface HSLA {
  h: number,
  s: number,
  l: number,
  a?: number
}

export interface ThemeColors {
  black: string,
  grey: {
    100: string,
    200: string,
    300: string,
    400: string,
    500: string,
    600: string,
    700: string,
    800: string,
    900: string
  },
  primary: {
    dark: string,
    light: string,
    main: string
  },
  white: string
}

export interface ThemeSurface {
  background: string,
  border: string,
  highlight: string,
  shadow: string,
}

export interface Theme {
  baseBg: string,
  baseColor: string,
  borderRadius: number,
  buttonSizes: {
    md: number,
    lg: number,
    sm: number,
  },
  colors: ThemeColors,
  highlightColor: string,
  shadowColor: string,
  siteWidth: number,
  spacing: {
    0: number,
    1: number,
    2: number,
    3: number,
    4: number,
    5: number,
    6: number,
    7: number,
    8: number
  },
  surfaces: {
    N2: ThemeSurface,
    N1: ThemeSurface,
    0: ThemeSurface,
    1: ThemeSurface,
    2: ThemeSurface,
  },
  textColor: string,
}

export interface ThemeContextValue {
  darkMode?: boolean,
  onToggleDarkMode: () => void,
  theme: Theme
}

export interface ThemeConfig {
  baseColor?: HSLA,
  baseColorDark?: HSLA,
  baseGreyColor?: HSLA,
  baseGreyColorDark?: HSLA,
  borderRadius?: number,
  siteWidth?: number
}