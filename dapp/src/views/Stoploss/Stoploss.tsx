import React, { useMemo } from 'react'

// import {
//   Box,
//   Button,
//   Container,
//   Separator,
//   Spacer,
// } from 'react-neu'

import { useWallet } from 'use-wallet'

import Page from 'components/Page'
import PageHeader from 'components/PageHeader'

const Stoploss: React.FC = () => {
  return (
    <Page>
      <PageHeader
        icon="😈"
        subtitle="Create a Stop Loss Order!"
        title="Stoploss"
      />
    </Page>
  )
}

export default Stoploss