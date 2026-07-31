import { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { createPublicClient, http, formatUnits } from 'viem'
import { arcTestnet } from '../config'

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

export function useTokenBalance(tokenAddress, decimals = 6) {
  const { address } = useAccount()
  const [value, setValue] = useState(0n)

  const fetch = useCallback(async () => {
    if (!address || !tokenAddress) return
    try {
      const data = await client.readContract({
        address: tokenAddress,
        abi: BALANCE_OF_ABI,
        functionName: 'balanceOf',
        args: [address],
      })
      setValue(data)
    } catch {
      // ignore
    }
  }, [address, tokenAddress])

  useEffect(() => {
    if (!address || !tokenAddress) {
      setValue(0n)
      return
    }
    fetch()
    const interval = setInterval(fetch, 5000)
    return () => clearInterval(interval)
  }, [address, tokenAddress, fetch])

  useEffect(() => {
    const handler = () => fetch()
    window.addEventListener('anchorfx:refresh', handler)
    return () => window.removeEventListener('anchorfx:refresh', handler)
  }, [fetch])

  if (!address) return { balance: 0, formatted: '0' }

  const formatted = formatUnits(value, decimals)
  const balance = parseFloat(formatted) || 0
  return { balance, formatted }
}
