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
import useManage from 'hooks/useManage'
import ManagerOrders from './components/ManageOrders'
import ManageOrders from './components/ManageOrders'
import {ManageProvider} from 'contexts/Manage'

const Manage: React.FC = () => {
  const {orders, onWithdraw, isWithdrawing} = useManage();
  const {account} = useWallet();
  const sl = useSL();
  // return (<p>hi</p>)
  return (
    <ManageProvider>
        <Page>
        <PageHeader
          icon="📊"
          subtitle="Your stop-losses"
          title="MANAGE"
        />  
        <Container>
        {account && sl ? 
        <div>
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
      </div> :
      <h3> Unlock your wallet!</h3>}
        
        </Container>
      </Page>
    </ManageProvider>
  )
}

export default Manage