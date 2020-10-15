import React from 'react'
import styled from 'styled-components'
import { NavLink } from 'react-router-dom'

const Nav: React.FC = () => {
  return (
    <StyledNav>
      {/* <StyledLink exact activeClassName="active" to="/"> </StyledLink> */}
      <StyledLink exact activeClassName="active" to="/stoploss"> STOPLOSS </StyledLink>
      <StyledLink exact activeClassName="active" to="/manage"> MANAGE </StyledLink>
      <StyledLink exact activeClassName="active" to="/liquidate"> LIQUIDATE </StyledLink>
    </StyledNav>
  )
}

const StyledNav = styled.nav`
  align-items: center;
  display: flex;
`

const StyledLink = styled(NavLink)`
  color: ${props => props.theme.colors.grey[600]};
  font-weight: 700;
  padding-left: ${props => props.theme.spacing[3]}px;
  padding-right: ${props => props.theme.spacing[3]}px;
  text-decoration: none;
  &:hover {
    color: ${props => props.theme.colors.grey[600]};
  }
  &.active {
    color: ${props => props.theme.colors.grey[500]};
    text-decoration: overline;
  }
`

export default Nav
