import { useState, useEffect } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { USDC_ADDRESS } from '../../config'

const VAULTS = [
  {
    id: 'usdc-stable',
    name: 'USDC Stable Pool',
    token: 'USDC',
    apy: 8.42,
    tvl: '12.4M',
    strategy: 'Lending + LP Fees',
    risk: 'Low',
    color: '#00e5a0',
    icon: '💎',
    description: 'Low-risk stablecoin yield through lending protocols and LP fees',
    status: 'Coming Soon',
  },
  {
    id: 'eurc-stable',
    name: 'EURC Stable Pool',
    token: 'EURC',
    apy: 7.85,
    tvl: '8.2M',
    strategy: 'FX Arbitrage + Lending',
    risk: 'Low',
    color: '#6B8BFF',
    icon: '🏦',
    description: 'Euro stablecoin yield via FX arbitrage and lending',
    status: 'Coming Soon',
  },
  {
    id: 'mixed-stable',
    name: 'Mixed Stable Pool',
    token: 'USDC/EURC',
    apy: 12.34,
    tvl: '24.6M',
    strategy: 'Multi-Asset LP',
    risk: 'Medium',
    color: '#f59e0b',
    icon: '⚡',
    description: 'Diversified stablecoin yield with multi-asset LP positions',
    status: 'Coming Soon',
  },
  {
    id: 'high-yield',
    name: 'High Yield Pool',
    token: 'USDC/EURC/ARB',
    apy: 18.67,
    tvl: '5.8M',
    strategy: 'Concentrated LP',
    risk: 'High',
    color: '#ef4444',
    icon: '🔥',
    description: 'High yield through concentrated liquidity provision',
    status: 'Coming Soon',
  },
]

export default function VaultsView() {
  const { address } = useAccount()
  const [selectedVault, setSelectedVault] = useState(null)

  const { data: balanceData } = useBalance({ address, token: USDC_ADDRESS, chainId: 5042002 })
  const balance = balanceData ? parseFloat(balanceData.formatted) : 0

  return (
    <div className="view-section vaults-view">
      <div className="view-head">
        <h2>Yield Vaults</h2>
        <span className="view-sub">ERC-4626 compliant vaults on Arc Network</span>
      </div>

      <div style={{ padding: '1rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, marginBottom: '1.5rem', fontSize: 13, color: '#f59e0b' }}>
        Vaults are under development. Deposit functionality will be available soon.
      </div>

      <div className="vaults-stats">
        <div className="vaults-stat-card">
          <span className="vaults-stat-label">Your USDC</span>
          <span className="vaults-stat-val">{balance.toFixed(2)}</span>
        </div>
        <div className="vaults-stat-card">
          <span className="vaults-stat-label">Available Vaults</span>
          <span className="vaults-stat-val">{VAULTS.length}</span>
        </div>
        <div className="vaults-stat-card">
          <span className="vaults-stat-label">Network</span>
          <span className="vaults-stat-val" style={{ fontSize: 13 }}>Arc Testnet</span>
        </div>
      </div>

      <div className="vaults-grid">
        {VAULTS.map(vault => (
          <div key={vault.id} className="vault-card" style={{ opacity: 0.7 }}>
            <div className="vault-card-header">
              <div className="vault-icon" style={{ background: vault.color + '20', color: vault.color }}>
                {vault.icon}
              </div>
              <div className="vault-info">
                <h3 className="vault-name">{vault.name}</h3>
                <span className="vault-token">{vault.token}</span>
              </div>
              <span className="vault-risk risk-medium">{vault.status}</span>
            </div>

            <div className="vault-metrics">
              <div className="vault-metric">
                <span className="vault-metric-label">APY</span>
                <span className="vault-metric-val green">{vault.apy}%</span>
              </div>
              <div className="vault-metric">
                <span className="vault-metric-label">TVL</span>
                <span className="vault-metric-val">${vault.tvl}</span>
              </div>
              <div className="vault-metric">
                <span className="vault-metric-label">Strategy</span>
                <span className="vault-metric-val" style={{ fontSize: 11 }}>{vault.strategy}</span>
              </div>
            </div>

            <p className="vault-desc">{vault.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
