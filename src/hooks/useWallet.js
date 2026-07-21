import {
  useAccount,
  useConnect,
  useDisconnect,
  useBalance,
  useSwitchChain,
  useChainId,
} from 'wagmi'
import { arcTestnet, EURC_ADDRESS } from '../config'

export function trimAddr(addr) {
  return addr ? addr.slice(0, 6) + '...' + addr.slice(-4) : ''
}

export function useWallet() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending, error, pendingConnector } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain, isPending: isSwitching } = useSwitchChain()

  // USDC is Arc's native gas token, so its balance comes from useBalance with no token arg
  const { data: usdcBalance } = useBalance({ address, chainId: arcTestnet.id })
  const { data: eurcBalance } = useBalance({ address, chainId: arcTestnet.id, token: EURC_ADDRESS })

  const isWrongNetwork = isConnected && chainId !== arcTestnet.id

  function connectWith(id) {
    const connector = connectors.find(c => c.id === id) || connectors.find(c => c.name.toLowerCase().includes(id))
    if (connector) connect({ connector, chainId: arcTestnet.id })
  }

  return {
    address,
    isConnected,
    isWrongNetwork,
    connectors,
    connectWith,
    isPending,
    pendingConnector,
    error,
    disconnect,
    switchChain: () => switchChain({ chainId: arcTestnet.id }),
    isSwitching,
    usdcBalance,
    eurcBalance,
  }
}
