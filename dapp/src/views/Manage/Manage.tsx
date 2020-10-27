import React, { useMemo, useState } from 'react'

import {
  Button,
  Container,
} from 'react-neu'

import { useWallet } from 'use-wallet'
import useSL from 'hooks/useSL'
import Page from 'components/Page'
import PageHeader from 'components/PageHeader'
import useManage from 'hooks/useManage'
import ManageOrders from './components/ManageOrders'
import {ManageProvider} from 'contexts/Manage'

const Manage: React.FC = () => {
  const {orders, onWithdraw, isWithdrawing} = useManage();
  const {account} = useWallet();
  const [open, setOpen] = useState<boolean>(true);
  const toggleShow = () => {
    const oldShow:boolean = open;
    setOpen(!oldShow);
  }
  const sl = useSL();
  return (
    <ManageProvider>
        <Page>
        <PageHeader
          icon="🤓"
          subtitle="Your stop-losses"
          title="MANAGE"
        />  
        
        {account && sl ? 
        <div>
        <Button 
          onClick={toggleShow} 
          text={open ? "Past Orders" : "Open Orders"}
          variant="default"
        />
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
        open={open}
        />}
        </Container>
      </div> :
      <h3> Unlock your wallet!</h3>}
      </Page>
    </ManageProvider>
  )
}

export default Manage