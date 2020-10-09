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
        icon="😈"
        subtitle="Create a Stop Loss Order!"
        title="Stoploss"
      />
      <SLOrder/>
    </Page>
    
  )
}

export default Stoploss