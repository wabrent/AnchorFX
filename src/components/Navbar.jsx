import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { useUsdcBalance } from '../hooks/useUsdcBalance'
import { useAppState } from '../context/useAppState'

export default function Navbar() {
  const { activeTab, setActiveTab, tabs } = useAppState()
  const { address } = useAccount()
  const { formatted } = useUsdcBalance()

  return (
    <header className="nav-header">
      <div className="nav-left">
        <span className="nav-logo">Anchor<span className="nav-logo-accent">FX</span></span>
        <span className="nav-badge">Arc Testnet</span>
      </div>

      <nav className="nav-tabs">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`nav-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      <div className="nav-right">
        {address && (
          <span style={{ marginRight: 12, fontSize: 13, fontFamily: 'DM Mono, monospace', color: 'var(--text)' }}>
            {formatted} USDC
          </span>
        )}
        <ConnectButton showBalance={false} />
      </div>
    </header>
  )
}
