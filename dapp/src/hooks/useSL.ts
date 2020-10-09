import { useContext } from 'react'
import { Context } from '../contexts/SLProvider'

const useSL = () => {
  const { sl } = useContext(Context)
  return sl
}

export default useSL