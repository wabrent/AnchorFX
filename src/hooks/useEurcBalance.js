import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { createPublicClient, http, formatUnits } from 'viem'
import { arcTestnet, EURC_ADDRESS } from '../config'

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

export function useEurcBalance() {
  const { address } = useAccount()
  const [value, setValue] = useState(0n)

  useEffect(() => {
    if (!address) {
      setValue(0n)
      return
    }

    const fetch = async () => {
      try {
        const data = await client.readContract({
          address: EURC_ADDRESS,
          abi: BALANCE_OF_ABI,
          functionName: 'balanceOf',
          args: [address],
        })
        setValue(data)
      } catch {
        // ignore errors
      }
    }

    fetch()
    const interval = setInterval(fetch, 5000)
    return () => clearInterval(interval)
  }, [address])

  if (!address) return { balance: 0, formatted: '0' }

  const formatted = formatUnits(value, 6)
  const balance = parseFloat(formatted) || 0
  return { balance, formatted }
}
