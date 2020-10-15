import React, { useCallback, useMemo, useState } from 'react'
import { ApolloClient, InMemoryCache, gql, ApolloProvider, useQuery } from '@apollo/client';
import { createTheme } from 'theme'
import {ThemeProvider} from 'react-neu'
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from 'react-router-dom'
import { UseWalletProvider } from 'use-wallet'

import MobileMenu from 'components/MobileMenu'
import TopBar from 'components/TopBar'
import SLProvider from 'contexts/SLProvider'
import {BalancesProvider} from 'contexts/Balances'
import {ManageProvider} from 'contexts/Manage'
import {LiquidateProvider} from 'contexts/Liquidated'
import useLocalStorage from 'hooks/useLocalStorage'

import Manage from 'views/Manage';
import Stoploss from 'views/Stoploss';
import Home from 'views/Home';
import Liquidate from 'views/Liquidate';


const App: React.FC = () => {

  const [mobileMenu, setMobileMenu] = useState(false)

  const handleDismissMobileMenu = useCallback(() => {
    setMobileMenu(false)
  }, [setMobileMenu])
  const handlePresentMobileMenu = useCallback(() => {
    setMobileMenu(true)
  }, [setMobileMenu])

  return (
    <Router>
      <Providers>
        <TopBar onPresentMobileMenu={handlePresentMobileMenu} />
        <MobileMenu onDismiss={handleDismissMobileMenu} visible={mobileMenu} />
        <Switch>
          <Route exact path="/">
            <Stoploss />
          </Route>
          <Route exact path="/manage">
            <ManageProvider>
              <Manage />
            </ManageProvider>
          </Route>
          <Route exact path="/liquidate">
            <LiquidateProvider>
              <Liquidate />
            </LiquidateProvider>
          </Route>
          <Route path="/stoploss">
            <Stoploss />
          </Route>
        </Switch>
      </Providers>
    </Router>
  )
}

const Providers: React.FC = ({ children }) => {
  const client = new ApolloClient({
    uri: process.env.REACT_APP_GRAPHQL_ENDPOINT || "http://localhost:8000/subgraphs/name/dhadrien/stoploss-subgraph",
    cache: new InMemoryCache(),
  })
  const [darkModeSetting] = useLocalStorage('darkMode', false)
  const { dark: darkTheme, light: lightTheme } = useMemo(() => {
    return createTheme({
      baseColor: { h: 45, s: 63, l: 59 },
      baseColorDark: { h: 242, s: 62, l: 39 },
      baseGreyColor: { h: 259, s: 56, l: 35 },
      baseGreyColorDark: { h: 242, s: 62, l: 39 },
      borderRadius: 8,
      siteWidth: 1400,
    })
  }, [])

// YELLOW1 { h: 45, s: 63, l: 59 },
// BLUE1 { h: 242, s: 62, l: 39 },
// BLUE2 { h: 227, s: 63, l: 37 },
// PINK1 { h: 292, s: 63, l: 37 }
// PURPLE1: { h: 259, s: 56, l: 35 },
// PURPLE2: { h: 260, s: 77, l: 8 },


  return (
    <ThemeProvider
      darkModeEnabled={darkModeSetting}
      darkTheme={darkTheme}
      lightTheme={lightTheme}
    >
      <UseWalletProvider
        chainId={1337}
        connectors={{
          walletconnect: { rpcUrl: 'https://mainnet.eth.aragon.network/' },
        }}
      >
        <SLProvider>
          <BalancesProvider>
              <ApolloProvider client={client}>
                  {children}
              </ApolloProvider>
          </BalancesProvider>
        </SLProvider>
      </UseWalletProvider>
    </ThemeProvider>
  )
}

export default App
