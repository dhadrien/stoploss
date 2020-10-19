import React from 'react'
import {ReactNode} from 'react'
import styled from 'styled-components'

interface LabelProps {
  text?: ReactNode,
}

const Label: React.FC<LabelProps> = ({ text }) => (
  <StyledLabel>{text}</StyledLabel>
)

const StyledLabel = styled.div`
  color: ${props => props.theme.colors.grey[500]};
`

export default Label