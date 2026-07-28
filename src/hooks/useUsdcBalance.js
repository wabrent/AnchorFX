import { useBalance, useReadContract, useAccount } from 'wagmi'
import { USDC_ADDRESS } from '../config'
import { formatUnits } from 'viem'

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

  const native = useBalance({ address, chainId: 5042002 })

  const erc20 = useReadContract({
    address: USDC_ADDRESS,
    abi: BALANCE_OF_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address, retry: false },
  })

  if (!address) return { balance: 0, formatted: '0', isLoading: false }

  const nativeVal = native.data?.value
  const nativeFormatted = native.data?.formatted
  const erc20Val = (typeof erc20.data === 'bigint' && erc20.data > 0n) ? erc20.data : 0n
  const erc20Formatted = erc20Val > 0n ? formatUnits(erc20Val, 6) : null

  if (erc20Formatted) {
    return { balance: parseFloat(erc20Formatted), formatted: erc20Formatted, isLoading: erc20.isLoading }
  }

  if (nativeFormatted && nativeVal !== undefined && nativeVal > 0n) {
    return { balance: parseFloat(nativeFormatted), formatted: nativeFormatted, isLoading: native.isLoading }
  }

  if (erc20Val === 0n && nativeVal !== undefined) {
    return { balance: parseFloat(nativeFormatted || '0'), formatted: nativeFormatted || '0', isLoading: native.isLoading || erc20.isLoading }
  }

  return { balance: 0, formatted: '0', isLoading: native.isLoading || erc20.isLoading }
}
