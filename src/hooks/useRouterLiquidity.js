import { useState, useEffect, useCallback } from 'react'
import { createPublicClient, http, formatUnits } from 'viem'
import { arcTestnet, USDC_ADDRESS, EURC_ADDRESS, ANCHOR_FX_ROUTER_ADDRESS } from '../config'

const client = createPublicClient({
  chain: arcTestnet,
  transport: http('/api/rpc'),
})

const BALANCE_OF_ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
]

export function useRouterLiquidity() {
  const [usdc, setUsdc] = useState(0n)
  const [eurc, setEurc] = useState(0n)

  const fetch = useCallback(async () => {
    try {
      const [u, e] = await Promise.all([
        client.readContract({
          address: USDC_ADDRESS,
          abi: BALANCE_OF_ABI,
          functionName: 'balanceOf',
          args: [ANCHOR_FX_ROUTER_ADDRESS],
        }),
        client.readContract({
          address: EURC_ADDRESS,
          abi: BALANCE_OF_ABI,
          functionName: 'balanceOf',
          args: [ANCHOR_FX_ROUTER_ADDRESS],
        }),
      ])
      setUsdc(u)
      setEurc(e)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    fetch()
    const interval = setInterval(fetch, 5000)
    return () => clearInterval(interval)
  }, [fetch])

  useEffect(() => {
    const handler = () => fetch()
    window.addEventListener('anchorfx:refresh', handler)
    return () => window.removeEventListener('anchorfx:refresh', handler)
  }, [fetch])

  const usdcFormatted = formatUnits(usdc, 6)
  const eurcFormatted = formatUnits(eurc, 6)

  return {
    usdc: parseFloat(usdcFormatted) || 0,
    eurc: parseFloat(eurcFormatted) || 0,
  }
}
