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
          <Route path="/">
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
  const [darkModeSetting] = useLocalStorage('darkMode', true)
  const { dark: darkTheme, light: lightTheme } = useMemo(() => {
    return createTheme({
      baseColor: { h: 240, s: 50, l: 40 },
      baseColorDark: { h: 240, s: 50, l: 40 },
      baseGreyColor: { h: 259, s: 56, l: 35 },
      baseGreyColorDark: { h: 240, s: 50, l: 40 },
      borderRadius: 100,
      siteWidth: 1400,
    })
  }, [])

  return (
    <ThemeProvider
      darkModeEnabled={darkModeSetting}
      darkTheme={darkTheme}
      lightTheme={lightTheme}
    >
      <UseWalletProvider
        chainId={42}
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
