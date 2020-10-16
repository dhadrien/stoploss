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
import ManageOrders from './components/ManageOrders'
import ToLiquidate from './components/ToLiquidateOrders'
import {ToLiquidateProvider} from 'contexts/ToLiquidate'
import useLiquidate from 'hooks/useLiquidate'

const Liquidate: React.FC = () => {
  const {orders, onWithdraw, isWithdrawing} = useLiquidate();
  const {account} = useWallet();
  const sl = useSL();
  const [show, setShow]= useState(true);
  const toggleShow = () => {
    const oldShow:boolean = show;
    setShow(!oldShow);
  }
  return (
    <>
      <Page>
      <PageHeader
        icon="🤑"
        subtitle="Available stop-losses"
        title="LIQUIDATE"
      />  
      
      {account && sl ? 
      <><Button 
          onClick={toggleShow} 
          text={show ? "Check New Liquidation Opportunities" : "My past Liquidations"}
          variant="default"
        /> {show? 
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