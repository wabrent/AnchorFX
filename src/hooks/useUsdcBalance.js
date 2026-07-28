import { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { createPublicClient, http, formatUnits } from 'viem'
import { arcTestnet, USDC_ADDRESS } from '../config'

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

export function useUsdcBalance() {
  const { address } = useAccount()
  const [erc20Val, setErc20Val] = useState(0n)
  const [nativeVal, setNativeVal] = useState(0n)

  const fetch = useCallback(async () => {
    if (!address) return
    try {
      const [e, n] = await Promise.all([
        client.readContract({
          address: USDC_ADDRESS,
          abi: BALANCE_OF_ABI,
          functionName: 'balanceOf',
          args: [address],
        }),
        client.getBalance({ address }),
      ])
      setErc20Val(e)
      setNativeVal(n)
    } catch {
      // ignore errors
    }
  }, [address])

  useEffect(() => {
    if (!address) {
      setErc20Val(0n)
      setNativeVal(0n)
      return
    }
    fetch()
    const interval = setInterval(fetch, 5000)
    return () => clearInterval(interval)
  }, [address, fetch])

  useEffect(() => {
    const handler = () => fetch()
    window.addEventListener('anchorfx:refresh', handler)
    return () => window.removeEventListener('anchorfx:refresh', handler)
  }, [fetch])

  if (!address) return { balance: 0, formatted: '0' }

  if (erc20Val > 0n) {
    const formatted = formatUnits(erc20Val, 6)
    return { balance: parseFloat(formatted) || 0, formatted }
  }

  const formatted = formatUnits(nativeVal, 18)
  const balance = parseFloat(formatted) || 0
  return { balance, formatted }
}
