import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useAppState } from '../../context/useAppState'

const VAULT_TYPES = [
  { id: 'multisig', name: 'Multi-Sig Vault', icon: '🔐', desc: 'Requires M-of-N signatures to execute', risk: 'Very Low' },
  { id: 'timelock', name: 'Time-Lock Vault', icon: '⏰', desc: 'Funds locked until specified time', risk: 'Low' },
  { id: 'compliance', name: 'Compliance Vault', icon: '📋', desc: 'KYC/AML verified transactions only', risk: 'Low' },
  { id: 'dao', name: 'DAO Treasury', icon: '🏛️', desc: 'Governance-controlled vault', risk: 'Medium' },
]

export default function ClearingHouseView() {
  const { address } = useAccount()
  const { notify } = useAppState()
  const [selectedVaultType, setSelectedVaultType] = useState('multisig')
  const [vaultName, setVaultName] = useState('')
  const [signers, setSigners] = useState('')
  const [threshold, setThreshold] = useState('')
  const [vaults, setVaults] = useState(() => {
    const saved = localStorage.getItem('anchorfx_clearing')
    return saved ? JSON.parse(saved) : [
      { id: 1, time: '2024-01-15 14:32', action: 'Vault Created', user: '0x1234...5678', details: 'Multi-Sig 3/5 vault', type: 'demo' },
      { id: 2, time: '2024-01-15 15:45', action: 'Deposit', user: '0x1234...5678', details: '50,000 USDC deposited', type: 'demo' },
      { id: 3, time: '2024-01-16 09:12', action: 'Signature Added', user: '0xabcd...ef01', details: '2/5 signatures reached', type: 'demo' },
    ]
  })

  function handleCreate() {
    if (!vaultName || !address) return
    const vaultType = VAULT_TYPES.find(t => t.id === selectedVaultType)
    const record = {
      id: Date.now(),
      time: new Date().toLocaleString(),
      action: 'Vault Created',
      user: address.slice(0, 6) + '...' + address.slice(-4),
      details: `${vaultType.name} | ${threshold ? threshold + '/' : ''}${signers || '?'} signers | "${vaultName}"`,
      type: 'user',
    }
    const updated = [record, ...vaults]
    setVaults(updated)
    localStorage.setItem('anchorfx_clearing', JSON.stringify(updated))
    setVaultName('')
    setSigners('')
    setThreshold('')
    notify('Vault Created', `${vaultName} (${vaultType.name})`, 'success')
  }

  return (
    <div className="view-section clearing-view">
      <div className="view-head">
        <h2>Clearing House</h2>
        <span className="view-sub">Institutional custody and compliance on Arc Network</span>
      </div>

      <div style={{ padding: '1rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, marginBottom: '1.5rem', fontSize: 13, color: '#f59e0b' }}>
        Clearing house is under development. Vault creation is recorded locally for testing.
      </div>

      <div className="anchor-card" style={{ marginBottom: '1.5rem' }}>
        <div className="anchor-card-header">
          <span className="anchor-card-label">Create Vault</span>
        </div>

        <div className="clearing-vault-types" style={{ marginBottom: '1rem' }}>
          {VAULT_TYPES.map(v => (
            <div
              key={v.id}
              className={`clearing-vault-card ${selectedVaultType === v.id ? 'selected' : ''}`}
              onClick={() => setSelectedVaultType(v.id)}
              style={{ cursor: 'pointer', opacity: selectedVaultType === v.id ? 1 : 0.6 }}
            >
              <div className="clearing-vault-icon">{v.icon}</div>
              <div className="clearing-vault-info">
                <h3>{v.name}</h3>
                <p>{v.desc}</p>
              </div>
              <span className="clearing-vault-risk">{v.risk}</span>
            </div>
          ))}
        </div>

        <div className="anchor-input-box">
          <span className="anchor-input-label">Vault Name</span>
          <input
            className="anchor-input"
            type="text"
            placeholder="e.g. Treasury Operations"
            value={vaultName}
            onChange={e => setVaultName(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
          <div className="anchor-input-box" style={{ flex: 1 }}>
            <span className="anchor-input-label">Total Signers</span>
            <input
              className="anchor-input"
              type="number"
              placeholder="e.g. 5"
              value={signers}
              onChange={e => setSigners(e.target.value)}
            />
          </div>
          <div className="anchor-input-box" style={{ flex: 1 }}>
            <span className="anchor-input-label">Threshold</span>
            <input
              className="anchor-input"
              type="number"
              placeholder="e.g. 3"
              value={threshold}
              onChange={e => setThreshold(e.target.value)}
            />
          </div>
        </div>

        <button
          className="anchor-swap-btn"
          onClick={handleCreate}
          disabled={!vaultName || !address}
          style={{ marginTop: '0.75rem' }}
        >
          Create Vault
        </button>
      </div>

      <div className="clearing-audit">
        <h3>Audit Trail ({vaults.length})</h3>
        <div className="clearing-audit-list">
          {vaults.map(v => (
            <div key={v.id} className="clearing-audit-item" style={{ opacity: v.type === 'demo' ? 0.5 : 1 }}>
              <span className="clearing-audit-time">{v.time}</span>
              <span className="clearing-audit-action">{v.action}</span>
              <span className="clearing-audit-user">{v.user}</span>
              <span className="clearing-audit-details">{v.details}</span>
              {v.type === 'demo' && (
                <span style={{ fontSize: 10, color: 'var(--text3)', marginLeft: 8 }}>(demo)</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
