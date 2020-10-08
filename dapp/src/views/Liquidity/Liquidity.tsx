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

const Liquidity: React.FC = () => {
  return (
    <Page>
      <PageHeader
        icon="💰"
        subtitle="Add liquidity to the Uniswap Pool"
        title="Liquidity"
      />
    </Page>
  )
}

export default Liquidity