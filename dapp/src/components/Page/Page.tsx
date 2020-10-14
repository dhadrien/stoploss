import React from 'react'
import styled from 'styled-components'

import Footer from '../Footer'

import BKG from '../../assets/IMP.svg'

const Page: React.FC = ({ children }) => (
  <StyledPage>
    <StyledMain>
      {children}
    </StyledMain>
    <Footer />
  </StyledPage>
)

const StyledPage = styled.div``

const StyledMain = styled.div.attrs({
  role: 'img'
})`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 144px);
  padding: ${props => props.theme.spacing[6]}px 0;
  background-image: ${props => props.theme.background} url(${BKG});
  background-position: center;
  background-repeat: no-repeat;
`

export default Page