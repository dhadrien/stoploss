import { useContext } from 'react'

import { ManagerContext } from 'contexts/Manage'

const useManage = () => {
  return { ...useContext(ManagerContext) }
}

export default useManage