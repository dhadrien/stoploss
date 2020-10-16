import React, { useMemo } from 'react'

import {
  Box,
  Button,
  Container,
  Separator,
  Spacer,
} from 'react-neu'

import { useWallet } from 'use-wallet'

import Page from 'components/Page'
import PageHeader from 'components/PageHeader'
import SLOrder from './components/SLOrder';

const Stoploss: React.FC = () => {
  return (
    
      <Page>
      <PageHeader
        icon="🦄 + 😈 = 🤤"
        subtitle="Stop Loss guarantees you against Impermanent Loss"
        title="Provide Liquidity With Insurance"
      />
      <SLOrder/>
    </Page>
    
  )
}

export default Stoploss