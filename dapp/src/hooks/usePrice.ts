import { useCallback, useEffect, useState } from 'react'

import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'
import { provider } from 'web3-core'
import useSL from 'hooks/useSL';
// import { getAllowance } from 'utils'

export interface Price {
  price: BigNumber,
  ratioA: BigNumber,
  ratioB: BigNumber
}
export interface Prices extends Record<string,Price> {}

const usePrice = (pools: string[]) => {
  const [prices, setPrices] = useState<Prices>()
  const { account, ethereum }: { account: string | null, ethereum?: provider} = useWallet()
  const sl = useSL();
  const fetchPrice = useCallback(async () => {
    if (sl){
      const newPrices: Record<string,Price>={};
        await Promise.all(pools.map(async (pool) => {
          newPrices[pool] = {
            price: (new BigNumber(await sl.contracts["SLPool" + pool].methods.priceA().call())),
            ratioA: (new BigNumber(await sl.contracts["SLPool" + pool].methods.lastRatioA().call())),
            ratioB: (new BigNumber(await sl.contracts["SLPool" + pool].methods.lastRatioB().call())),
          }
        }))  
      setPrices(newPrices);
    }
  }, [setPrices, prices, sl])

  useEffect(() => {
    if (sl && account && ethereum && pools) {
      fetchPrice()
    }
    let refreshInterval = setInterval(fetchPrice, 2000)
    return () => clearInterval(refreshInterval)
  }, [account, ethereum, sl])

  return (prices)
}

export default usePrice