import React from 'react'
import {
  Container,
  Spacer,
  useTheme,
} from 'react-neu'

import Page from 'components/Page'
import PageHeader from 'components/PageHeader'

// import useBalances from 'hooks/useBalances'
// import useVesting from 'hooks/useVesting'

const Home: React.FC = () => {
  const { darkMode } = useTheme()
  // const { yamV2Balance } = useBalances()
  // const { vestedBalance } = useVesting()
  return (
    <Page>
      <PageHeader
        icon={darkMode ? "🌚" : "🌞"}
        subtitle={darkMode ? "Dark mode Stop Loss: stronger than ever!" : "Don't be greedy, don't loss it all on Impermanent Losses!"}
        title="stoploss.finance."
      />
      {/* <Container>
        <RegisterVoteNotice />
        <Spacer />
        {(yamV2Balance && yamV2Balance.toNumber() > 0) && (
          <>
            <MigrationNotice />
            <Spacer />
          </>
        )}
        {(vestedBalance && vestedBalance.toNumber() > 0) && (
          <>
            <VestingNotice />
            <Spacer />
          </>
        )}
        <Treasury />
        <Spacer />
        <Split>
          <Rebase />
          <Stats />
        </Split>
      </Container> */}
    </Page>
  )
}

export default Home
