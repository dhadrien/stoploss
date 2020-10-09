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

// import Unipair from './components/Unipair';

const Liquidity: React.FC = () => {
  return (
    <Page>
      <PageHeader
        icon="💰"
        subtitle="Add liquidity to the Uniswap Pool"
        title="Liquidity"
      />  
      <Container>
        {/* <Unipair
          isOpen={false}
          onProvide={() =>{}}
        /> */}

      </Container>
    </Page>
  )
}

export default Liquidity