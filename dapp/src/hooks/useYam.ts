import { useContext } from 'react'
import { Context } from '../contexts/SLProvider'

const useYam = () => {
  const { sl } = useContext(Context)
  return sl
}

export default useYam