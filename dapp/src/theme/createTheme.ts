import { HSLA, Theme, ThemeConfig } from './types'

const DEFAULT_COLOR: HSLA = { h: 260, s: 77, l: 8 }

const createTheme = (config?: ThemeConfig): {
  dark: Theme,
  light: Theme
} => {
  const {
    baseColor = DEFAULT_COLOR,
    baseColorDark,
    baseGreyColor,
    baseGreyColorDark,
    borderRadius = 0,
    siteWidth = 1920
  } = config || {}

  const { h, s } = baseColor
  const { h: hDark, s: sDark } = baseColorDark || baseColor
  const { h: baseGreyH } = baseGreyColor || baseColor
  const { h: baseGreyDarkH } = baseGreyColorDark || baseColorDark || baseGreyColor || baseColor

  const blackHSLA: HSLA = { h: baseGreyH, s: 10, l: 10 }
  const whiteHSLA: HSLA = { h: baseGreyH, s: 50, l: 50 }
  const black = hslToCssString(blackHSLA)
  const white = hslToCssString(whiteHSLA)
  const grey = generateGreys(baseGreyH)

  const blackDarkHSLA: HSLA = { h: baseGreyDarkH, s: 95, l: 4 }
  const whiteDarkHSLA: HSLA = { h: baseGreyDarkH, s: 100, l: 100}
  const blackDark = hslToCssString(blackDarkHSLA)
  const whiteDark = hslToCssString(whiteDarkHSLA)
  const greyDark = generateGreys(baseGreyDarkH)


  const buttonSizes = {
    lg: 72,
    md: 48,
    sm: 36,
  }

  // const buttonSizes = {
  //   lg: 48,
  //   md: 36,
  //   sm: 24,
  // }

  const colors = {
    black,
    grey,
    primary: {
      dark: hslToCssString({ h, s, l: 15 }),
      light: hslToCssString({ h, s, l: 75 }),
      main: hslToCssString(baseColor),
    },
    white,
  }

  const colorsDark = {
    black: blackDark,
    grey: greyDark,
    primary: {
      dark: hslToCssString({ h: hDark, s: sDark, l: 15 }),
      light: hslToCssString({ h: hDark, s: sDark, l: 75 }),
      main: hslToCssString(baseColorDark || baseColor)
    },
    white: whiteDark,
  }

  const spacing = {
    0: 5,
    1: 5,
    2: 5,
    3: 8,
    4: 12,
    5: 16,
    6: 24,
    7: 36,
    8: 48
  }

  // 0: 0,
  // 1: 4,
  // 2: 8,
  // 3: 16,
  // 4: 24,
  // 5: 32,
  // 6: 48,
  // 7: 72,
  // 8: 96

  const lightTheme: Theme = {
    baseBg: `radial-gradient(circle at top, ${grey[100]}, ${grey[200]})`,
    baseColor: grey[200],
    borderRadius,
    buttonSizes,
    colors,
    highlightColor: grey[100],
    shadowColor: grey[300],
    siteWidth,
    spacing,
    surfaces: generateSurfaces(
      {
        dark: grey[300],
        light: grey[100],
        main: grey[200],
      },
      hslToCssString({ ...whiteHSLA, a: 100 }),
      hslToCssString({ ...blackHSLA, a: 15 }),
    ),
    textColor: black,
  }

  const darkTheme: Theme = {
    ...lightTheme,
    baseBg: `radial-gradient(circle at top, ${greyDark[700]}, ${greyDark[800]})`,
    baseColor: greyDark[800],
    colors: colorsDark,
    highlightColor: greyDark[700],
    shadowColor: greyDark[900],
    surfaces: generateSurfaces(
      {
        dark: greyDark[900],
        light: greyDark[700],
        main: greyDark[800],
      },
      hslToCssString({ ...whiteDarkHSLA, a: 7.5 }),
      greyDark[900],
    ),
    textColor: whiteDark,
  }

  return {
    dark: darkTheme,
    light: lightTheme,
  }
}

const hslToCssString = (hsla: HSLA) => {
  const { h, s, l, a = 100 } = hsla
  return `hsl(${h}deg ${s}% ${l}% / ${a}%)`
}

const generateGreys = (h: number) => {
  return {
    //?
    100: hslToCssString({ h, s: 1, l: 100 }),
    //?
    200: hslToCssString({ h, s: 15, l: 90 }),
    //?
    300: hslToCssString({ h, s: 30, l: 80 }),
    //?
    400: hslToCssString({ h, s: 50, l: 100 }),
    //Nav Active + Pair Txt
    500: hslToCssString({ h, s: 100, l: 100 }),
    //NavText
    600: hslToCssString({ h, s: 80, l: 75 }),
    //background
    700: hslToCssString({ h, s: 62, l: 10 }),
    //GradientInsideComponents
    800: hslToCssString({ h, s: 62, l: 20 }),
    //Borders
    900: hslToCssString({ h, s: 77, l: 8 }),
  }
}

// YELLOW1 { h: 45, s: 63, l: 59 },
// BLUE1 { h: 242, s: 62, l: 39 },
// BLUE2 { h: 240, s: 50, l: 40 },
// PURPLE1: { h: 259, s: 56, l: 35 },
// PURPLE2: {h: 259, s: 56, l: 29 }
// PURPLE3:{ h: 260, s: 77, l: 8 },

const generateSurfaces = (
  base: {
    dark: string,
    light: string,
    main: string,
  },
  highlight: string,
  shadow: string,
) => {
  const baseBg = `radial-gradient(circle at top, ${base.light}, ${base.main})`
  return {
    N2: {
      background: `radial-gradient(circle at top, ${base.main}, ${base.dark})`,
      border: '0',
      highlight: `2px -2px 3px -2px ${highlight}`,
      shadow: `-2px 2px 3px -2px ${shadow}`,
    },
    N1: {
      background: baseBg,
      border: '0',
      highlight: `1px -1px 2px ${highlight}`,
      shadow: `-1px 1px 2px ${shadow}`,
    },
    0: {
      background: baseBg,
      border: `0`,
      highlight: `-1px 1px 0px ${highlight}`,
      shadow: `0px 0px 1px 1px ${shadow}`,
    },
    1: {
      background: baseBg,
      border: '0',
      highlight: `2px -2px 3px 0px ${highlight}`,
      shadow: `-2px 2px 3px 0 ${shadow}`,
    },
    2: {
      background: baseBg,
      border: '0',
      highlight: `3px -3px 4px 0px ${highlight}`,
      shadow: `-3px 3px 4px 0 ${shadow}`,
    }
  }
}

export default createTheme