import { useState } from 'react'
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
  },
]

export default function VaultsView() {
  const { address } = useAccount()
  const [selectedVault, setSelectedVault] = useState(null)
  const [depositAmount, setDepositAmount] = useState('')
  const [deposits, setDeposits] = useState(() => {
    const saved = localStorage.getItem('anchorfx_vaults')
    return saved ? JSON.parse(saved) : []
  })

  const { data: balanceData } = useBalance({ address, token: USDC_ADDRESS, chainId: 5042002 })
  const balance = balanceData ? parseFloat(balanceData.formatted) : 0

  function handleDeposit() {
    if (!depositAmount || !selectedVault || !address) return
    const record = {
      id: Date.now(),
      vaultId: selectedVault.id,
      vaultName: selectedVault.name,
      amount: parseFloat(depositAmount).toFixed(2),
      token: selectedVault.token,
      time: new Date().toLocaleString(),
      status: 'Pending',
      tx: '0x' + Math.random().toString(16).slice(2, 10) + '...' + Math.random().toString(16).slice(2, 10),
    }
    const updated = [record, ...deposits]
    setDeposits(updated)
    localStorage.setItem('anchorfx_vaults', JSON.stringify(updated))
    setDepositAmount('')
    setSelectedVault(null)
  }

  return (
    <div className="view-section vaults-view">
      <div className="view-head">
        <h2>Yield Vaults</h2>
        <span className="view-sub">ERC-4626 compliant vaults on Arc Network</span>
      </div>

      <div style={{ padding: '1rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, marginBottom: '1.5rem', fontSize: 13, color: '#f59e0b' }}>
        Vault contracts are being audited. Deposits are recorded locally for testing.
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
          <span className="vaults-stat-label">Your Deposits</span>
          <span className="vaults-stat-val">{deposits.length}</span>
        </div>
      </div>

      {selectedVault && (
        <div className="anchor-card" style={{ marginBottom: '1.5rem' }}>
          <div className="anchor-card-header">
            <span className="anchor-card-label">Deposit to {selectedVault.name}</span>
            <button
              onClick={() => setSelectedVault(null)}
              style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 16 }}
            >✕</button>
          </div>
          <div className="anchor-input-box">
            <div className="anchor-input-row">
              <span className="anchor-input-label">Amount</span>
              <span className="anchor-balance">Balance: {balance.toFixed(2)} USDC</span>
            </div>
            <input
              className="anchor-input"
              type="number"
              placeholder="0.0"
              value={depositAmount}
              onChange={e => setDepositAmount(e.target.value)}
            />
            <span className="anchor-input-hint">{selectedVault.token} | APY: {selectedVault.apy}%</span>
          </div>
          <button
            className="anchor-swap-btn"
            onClick={handleDeposit}
            disabled={!depositAmount || !address}
            style={{ marginTop: '0.75rem' }}
          >
            Deposit {depositAmount || '0'} {selectedVault.token}
          </button>
        </div>
      )}

      <div className="vaults-grid">
        {VAULTS.map(vault => (
          <div
            key={vault.id}
            className={`vault-card ${selectedVault?.id === vault.id ? 'selected' : ''}`}
            onClick={() => setSelectedVault(vault)}
            style={{ cursor: 'pointer' }}
          >
            <div className="vault-card-header">
              <div className="vault-icon" style={{ background: vault.color + '20', color: vault.color }}>
                {vault.icon}
              </div>
              <div className="vault-info">
                <h3 className="vault-name">{vault.name}</h3>
                <span className="vault-token">{vault.token}</span>
              </div>
              <span className="vault-risk" style={{ color: vault.risk === 'Low' ? 'var(--green)' : vault.risk === 'Medium' ? '#f59e0b' : 'var(--red)' }}>
                {vault.risk}
              </span>
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

      {deposits.length > 0 && (
        <div className="orders-list-card" style={{ marginTop: '1.5rem' }}>
          <div className="orders-list-header"><h3>Your Deposits ({deposits.length})</h3></div>
          {deposits.map(d => (
            <div key={d.id} className="orders-list-item">
              <div className="orders-item-main">
                <span className="orders-item-pair">{d.vaultName}</span>
                <span className="orders-item-amount">{d.amount} {d.token}</span>
                <span className="orders-item-side" style={{ color: '#f59e0b' }}>{d.status}</span>
              </div>
              <div className="orders-item-footer">
                <span className="orders-item-time">{d.time}</span>
                <span className="orders-item-price" style={{ fontSize: 11 }}>{d.tx}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
