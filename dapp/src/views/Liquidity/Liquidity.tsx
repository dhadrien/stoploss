import React, { useMemo, useState } from 'react'

import {
  Box,
  Button,
  Container,
  Separator,
  Spacer,
} from 'react-neu'
import {
  Grid,
  LinearProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core'

import { useWallet } from 'use-wallet'
import {
  dai,
  daiwethpair,
} from 'constants/tokenAddresses'
import Page from 'components/Page'
import PageHeader from 'components/PageHeader'

// import { gql } from 'apollo-boost';
// import ApolloClient from 'apollo-boost';
// import { ApolloProvider as ApolloNew } from '@apollo/react-common';
// import { ApolloProvider, Query } from 'react-apollo';
// import { ApolloProvider as ApolloProviderHooks } from 'react-apollo-hooks';
import { ApolloClient, InMemoryCache, gql, ApolloProvider, useQuery } from '@apollo/client';
enum StopLossStatus {
  "Created",
  "Withdrawn",
  "Executed",
  "ShouldBeExecuted"
}

interface StopLoss {
  id: number;
  uniPair: string;
  orderer: string;
  delegated: Boolean;
  lpAmount: BigInt;
  tokenToGuarantee: string;
  ratio: BigInt;
  status: StopLossStatus;
  amountWithdrawn: BigInt;
  liquidator?: string;
  tokenToLiquidator?: string;
  amountToLiquidator?: BigInt;
}
interface StopLossData {
  stopLosses: StopLoss[]
}

interface StopLossVar{
  uniPair: string;
}




// import Unipair from './components/Unipair';

const Liquidity: React.FC = () => {
  const client = new ApolloClient({
    uri: process.env.REACT_APP_GRAPHQL_ENDPOINT || "http://localhost:8000/subgraphs/name/dhadrien/stoploss-subgraph",
    cache: new InMemoryCache(),
  })
  
  const STOPLOSSES_QUERY = gql`
    query GetStopLoss($uniPair: String) {
      stopLosses (orderer: $orderer) {
        id
        uniPair
        status
        orderer
        tokenToGuarantee
        lpAmount
        amountToLiquidator
        amountWithdrawn
      }
    }
  `;
  const { loading, data } = useQuery<StopLossData, StopLossVar>(
    STOPLOSSES_QUERY, 
    {variables: {uniPair: daiwethpair}}
  );
  loading ? console.log("loading") : console.log("$$$$$$$$$$$$$,", data);
  return (
      <Page>
      <PageHeader
        icon="💰"
        subtitle="Add liquidity to the Uniswap Pool"
        title="Liquidity"
      />  
      <Container>
      
      <div>
      <h3>Stop Losses</h3>
      {loading ? (
        <p>Loading ...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>status</th>
              <th>Token</th>
              <th>Lp Amount</th>
              <th>Amount Withdrawn</th>
              <th>Amount to Liq</th>
            </tr>
          </thead>
          <tbody>
            {data && data.stopLosses.map(a => (
              <tr>
                <td>{a.status}</td>
                <td>{a.tokenToGuarantee}</td>
                <td>{a.lpAmount}</td>
                <td>{a.amountWithdrawn}</td>
                <td>{a.amountToLiquidator}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
      </Container>
    </Page>
  )
}

export default Liquidity