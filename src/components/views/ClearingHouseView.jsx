import { useState, useEffect } from 'react'
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

  return (
    <div className="view-section clearing-view">
      <div className="view-head">
        <h2>Clearing House</h2>
        <span className="view-sub">Institutional custody and compliance on Arc Network</span>
      </div>

      <div style={{ padding: '1rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, marginBottom: '1.5rem', fontSize: 13, color: '#f59e0b' }}>
        Institutional clearing house is under development. Smart contracts for multi-sig and compliance vaults are being audited.
      </div>

      <div className="clearing-vault-types" style={{ marginBottom: '1.5rem' }}>
        {VAULT_TYPES.map(vault => (
          <div key={vault.id} className="clearing-vault-card" style={{ opacity: 0.7 }}>
            <div className="clearing-vault-icon">{vault.icon}</div>
            <div className="clearing-vault-info">
              <h3>{vault.name}</h3>
              <p>{vault.desc}</p>
            </div>
            <span className={`clearing-vault-risk risk-${vault.risk.toLowerCase().replace(' ', '-')}`}>
              {vault.risk}
            </span>
          </div>
        ))}
      </div>

      <div className="clearing-audit">
        <h3>Audit Trail (Demo)</h3>
        <div className="clearing-audit-list">
          <div className="clearing-audit-item">
            <span className="clearing-audit-time">2024-01-15 14:32</span>
            <span className="clearing-audit-action">Vault Created</span>
            <span className="clearing-audit-user">0x1234...5678</span>
            <span className="clearing-audit-details">Multi-Sig 3/5 vault</span>
          </div>
          <div className="clearing-audit-item">
            <span className="clearing-audit-time">2024-01-15 15:45</span>
            <span className="clearing-audit-action">Deposit</span>
            <span className="clearing-audit-user">0x1234...5678</span>
            <span className="clearing-audit-details">50,000 USDC deposited</span>
          </div>
          <div className="clearing-audit-item">
            <span className="clearing-audit-time">2024-01-16 09:12</span>
            <span className="clearing-audit-action">Signature Added</span>
            <span className="clearing-audit-user">0xabcd...ef01</span>
            <span className="clearing-audit-details">2/5 signatures reached</span>
          </div>
        </div>
      </div>
    </div>
  )
}
