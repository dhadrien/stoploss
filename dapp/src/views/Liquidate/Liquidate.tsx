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
import useSL from 'hooks/useSL'
import {
  dai
} from 'constants/tokenAddresses'
import Page from 'components/Page'
import PageHeader from 'components/PageHeader'
// import useLiquidate from 'hooks/useSLOrder'
import ManageOrders from './components/ManageOrders'
import ToLiquidate from './components/ToLiquidateOrders'
// import LiquidateOrders from './components/LiquidateOrders'
import {ToLiquidateProvider} from 'contexts/ToLiquidate'
import useLiquidate from 'hooks/useLiquidate'
import useToLiquidate from 'hooks/useToLiquidate'
import {LiquidateProvider} from 'contexts/Liquidated'
// import { gql } from 'apollo-boost';
// import ApolloClient from 'apollo-boost';
// import { ApolloProvider as ApolloNew } from '@apollo/react-common';
// import { ApolloProvider, Query } from 'react-apollo';
// import { ApolloProvider as ApolloProviderHooks } from 'react-apollo-hooks';
// import { gql, useQuery } from '@apollo/client';
// enum StopLossStatus {
//   "Created",
//   "Withdrawn",
//   "Executed",
//   "ShouldBeExecuted"
// }

// interface StopLoss {
//   id: number;
//   uniPair: string;
//   orderer: string;
//   delegated: Boolean;
//   lpAmount: BigInt;
//   tokenToGuarantee: string;
//   amountToGuarantee: string;
//   ratio: BigInt;
//   status: StopLossStatus;
//   amountWithdrawn: BigInt;
//   liquidator?: string;
//   tokenToLiquidator?: string;
//   amountToLiquidator?: BigInt;
// }
// interface StopLossData {
//   stopLosses: StopLoss[]
// }

// interface StopLossVar{
//   uniPair: string;
// }




// import Unipair from './components/Unipair';

const Liquidate: React.FC = () => {
  const {orders, onWithdraw, isWithdrawing} = useLiquidate();
  const {account} = useWallet();
  const sl = useSL();
  const [show, setShow]= useState(true);
  const toggleShow = () => {
    const oldShow:boolean = show;
    setShow(!oldShow);
  }
  // const liquidatedOrders = orders.stopLosses.filter(order => order.status === "Executed");
  // orders.stopLosses = liquidatedOrders;
  // return (<p>hi</p>)
  return (
    <>
      <Page>
      <PageHeader
        icon="🤑"
        subtitle="Your Orders"
        title="Liquidate Stop Loss"
      />  
      
      {account && sl ? 
      <><Button onClick={toggleShow} text={show ? "Check New Liquidation Opportunities" : "My past Liquidations"}/> {show? 
        <Container>
        {orders.loading ? (
          <>
          <h3>Stop Losses</h3>
          <p>Loading ...</p>
          </>
        ) : 
        <ManageOrders
        orders ={orders}
        onWithdraw={onWithdraw}
        isWithdrawing={isWithdrawing}
        />}
        </Container> : 
        <Container>
        <ToLiquidateProvider>
        <ToLiquidate/>
      </ToLiquidateProvider>
      </Container>
      }
         </>
         :
    <h3> Unlock wallet!</h3>}
      
      
    </Page>
    
  </>
  )
}

export default Liquidate