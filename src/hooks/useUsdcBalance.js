import { useState, useEffect } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { createPublicClient, http, formatUnits } from 'viem'
import { arcTestnet, USDC_ADDRESS } from '../config'

const client = createPublicClient({
  chain: arcTestnet,
  transport: http('https://rpc.testnet.arc.network'),
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
    query: { enabled: !!address },
  })

  if (!address) return { balance: 0, formatted: '0', isLoading: false }

  const erc20Val = typeof erc20.data === 'bigint' ? erc20.data : 0n
  const best = erc20Val > nativeVal ? erc20Val : nativeVal
  const formatted = formatUnits(best, 6)
  const balance = parseFloat(formatted) || 0

  return { balance, formatted, value: best, isLoading: erc20.isPending || erc20.isLoading }
}
