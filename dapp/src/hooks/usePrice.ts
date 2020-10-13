import { useCallback, useEffect, useState } from 'react'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'
import { provider } from 'web3-core'
import useSL from 'hooks/useSL';
// import { getAllowance } from 'utils'

const usePrice = (tokenAddress?: string, spenderAddress?: string) => {
  const [price, setPrice] = useState<BigNumber>()
  const [ratioA, setRatioA] = useState<BigNumber>()
  const [ratioB, setRatioB] = useState<BigNumber>()
  const { account, ethereum }: { account: string | null, ethereum?: provider} = useWallet()
  const sl = useSL();
  const fetchPrice = useCallback(async () => {
    if (sl){
      setPrice(new BigNumber(await sl.contracts.SLPoolFDAIFWETH.methods.priceA().call()));
      setRatioA(new BigNumber(await sl.contracts.SLPoolFDAIFWETH.methods.lastRatioA().call()));
      setRatioB(new BigNumber(await sl.contracts.SLPoolFDAIFWETH.methods.lastRatioB().call()));
    }
  }, [setPrice, sl])

  useEffect(() => {
    if (sl && account && ethereum && spenderAddress && tokenAddress) {
      fetchPrice()
    }
    let refreshInterval = setInterval(fetchPrice, 2000)
    return () => clearInterval(refreshInterval)
  }, [account, ethereum, sl, price, ratioA, ratioB])

  return ({price, ratioA, ratioB })
}

export default usePrice