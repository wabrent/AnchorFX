import { useAccount, useReadContract } from 'wagmi'
import { formatUnits } from 'viem'
import { EURC_ADDRESS } from '../config'

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

  const { data } = useReadContract({
    address: EURC_ADDRESS,
    abi: BALANCE_OF_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  if (!address) return { balance: 0, formatted: '0', isLoading: false }

  const value = typeof data === 'bigint' ? data : 0n
  const formatted = formatUnits(value, 6)
  const balance = parseFloat(formatted) || 0

  return { balance, formatted, value, isLoading: false }
}
