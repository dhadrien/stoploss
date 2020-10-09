import React from 'react'
import styled from 'styled-components'

const Nav: React.FC = () => {
  return (
    <StyledNav>
      <StyledLink href="https://discord.gg/nKKhBbk">Discord</StyledLink>
      <StyledLink href="https://github.com/yam-finance/yam-www">Github</StyledLink>
      <StyledLink href="https://twitter.com/YamFinance">Twitter</StyledLink>
      <StyledLink href="https://snapshot.page/#/yam">Proposals</StyledLink>
      <StyledLink href="https://forum.yam.finance">Forum</StyledLink>
    </StyledNav>
  )
}

const StyledNav = styled.nav`
  align-items: center;
  display: flex;
`

const StyledLink = styled.a`
  color: ${props => props.theme.colors.grey[500]};
  padding-left: ${props => props.theme.spacing[3]}px;
  padding-right: ${props => props.theme.spacing[3]}px;
  text-decoration: none;
  &:hover {
    color: ${props => props.theme.colors.grey[600]};
  }
`

export default Nav
