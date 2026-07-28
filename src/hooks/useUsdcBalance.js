import { useState, useEffect } from 'react'
import { useAccount, useReadContract } from 'wagmi'
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
  const [nativeVal, setNativeVal] = useState(0n)

  useEffect(() => {
    if (!address) {
      setNativeVal(0n)
      return
    }
    let cancelled = false
    client.getBalance({ address }).then(b => {
      if (!cancelled) setNativeVal(b)
    }).catch(() => {
      if (!cancelled) setNativeVal(0n)
    })
    return () => { cancelled = true }
  }, [address])

  const erc20 = useReadContract({
    address: USDC_ADDRESS,
    abi: BALANCE_OF_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  })

  if (!address) return { balance: 0, formatted: '0', isLoading: false, refetch: () => {} }

  const erc20Val = typeof erc20.data === 'bigint' ? erc20.data : 0n

  const nativeFormatted = formatUnits(nativeVal, 18)
  const nativeBalance = parseFloat(nativeFormatted) || 0

  if (erc20Val > 0n) {
    const formatted = formatUnits(erc20Val, 6)
    return { balance: parseFloat(formatted) || 0, formatted, value: erc20Val, isLoading: erc20.isLoading, refetch: erc20.refetch }
  }

  return { balance: nativeBalance, formatted: nativeFormatted, value: nativeVal, isLoading: false, refetch: erc20.refetch }
}
