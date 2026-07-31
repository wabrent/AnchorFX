import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { arcTestnet } from '../config'

export default function WrongNetworkBanner() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain, isPending } = useSwitchChain()

  if (!isConnected || chainId === arcTestnet.id) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 66,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 90,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: 'rgba(248,113,113,0.12)',
        border: '0.5px solid rgba(248,113,113,0.35)',
        color: '#fca5a5',
        padding: '10px 16px',
        borderRadius: 12,
        fontSize: 13,
        boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <span>Wrong network: chain {chainId}. This app runs on Arc Testnet ({arcTestnet.id}).</span>
      <button
        onClick={() => switchChain({ chainId: arcTestnet.id })}
        disabled={isPending}
        style={{
          background: 'linear-gradient(135deg,#00e5a0,#6B8BFF)',
          color: '#000',
          border: 'none',
          borderRadius: 8,
          padding: '6px 14px',
          fontSize: 12,
          fontWeight: 700,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {isPending ? 'Switching…' : 'Switch to Arc'}
      </button>
    </div>
  )
}
