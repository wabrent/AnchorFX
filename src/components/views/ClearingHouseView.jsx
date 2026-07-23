import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useAppState } from '../../context/useAppState'

const VAULT_TYPES = [
  { id: 'multisig', name: 'Multi-Sig Vault', icon: '🔐', desc: 'Requires M-of N signatures to execute', risk: 'Very Low' },
  { id: 'timelock', name: 'Time-Lock Vault', icon: '⏰', desc: 'Funds locked until specified time', risk: 'Low' },
  { id: 'compliance', name: 'Compliance Vault', icon: '📋', desc: 'KYC/AML verified transactions only', risk: 'Low' },
  { id: 'dao', name: 'DAO Treasury', icon: '🏛️', desc: 'Governance-controlled vault', risk: 'Medium' },
]

const COMPLIANCE_RULES = [
  { id: 'kyc', name: 'KYC Verification', desc: 'All users must be verified', enabled: true },
  { id: 'aml', name: 'AML Screening', desc: 'Transaction monitoring', enabled: true },
  { id: 'sanctions', name: 'Sanctions Check', desc: 'OFAC/EU sanctions list', enabled: true },
  { id: 'travelRule', name: 'Travel Rule', desc: 'Counterparty information', enabled: false },
  { id: 'jurisdiction', name: 'Jurisdiction Restriction', desc: 'Geo-blocking', enabled: false },
]

const AUDIT_LOG = [
  { time: '2024-01-15 14:32', action: 'Vault Created', user: '0x1234...5678', details: 'Multi-Sig 3/5 vault' },
  { time: '2024-01-15 15:45', action: 'Deposit', user: '0x1234...5678', details: '50,000 USDC deposited' },
  { time: '2024-01-16 09:12', action: 'Signature Added', user: '0xabcd...ef01', details: '2/5 signatures reached' },
  { time: '2024-01-16 11:30', action: 'Signature Added', user: '0x9876...5432', details: '3/5 signatures reached' },
  { time: '2024-01-16 14:00', action: 'Transfer Executed', user: 'System', details: '10,000 USDC to 0xdead...beef' },
  { time: '2024-01-17 08:45', action: 'Compliance Alert', user: 'System', details: 'Transaction flagged for review' },
]

export default function ClearingHouseView() {
  const { address } = useAccount()
  const { notify } = useAppState()
  const [selectedVaultType, setSelectedVaultType] = useState('multisig')
  const [signers, setSigners] = useState([''])
  const [threshold, setThreshold] = useState(2)
  const [lockDuration, setLockDuration] = useState('30')
  const [rules, setRules] = useState(COMPLIANCE_RULES)
  const [showCreateForm, setShowCreateForm] = useState(false)

  function addSigner() {
    setSigners([...signers, ''])
  }

  function updateSigner(index, value) {
    const updated = [...signers]
    updated[index] = value
    setSigners(updated)
  }

  function removeSigner(index) {
    if (signers.length <= 1) return
    setSigners(signers.filter((_, i) => i !== index))
  }

  function toggleRule(id) {
    setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r))
  }

  function handleCreateVault() {
    notify('Vault Created', `${VAULT_TYPES.find(v => v.id === selectedVaultType)?.name} created successfully`, 'success')
    setShowCreateForm(false)
    setSigners([''])
  }

  return (
    <div className="view-section clearing-view">
      <div className="view-head">
        <h2>Clearing House</h2>
        <span className="view-sub">Institutional custody and compliance on Arc Network</span>
      </div>

      <div className="clearing-tabs">
        <button
          className={`clearing-tab ${!showCreateForm ? 'active' : ''}`}
          onClick={() => setShowCreateForm(false)}
        >
          Vault Overview
        </button>
        <button
          className={`clearing-tab ${showCreateForm ? 'active' : ''}`}
          onClick={() => setShowCreateForm(true)}
        >
          Create Vault
        </button>
      </div>

      {!showCreateForm ? (
        <>
          <div className="clearing-vault-types">
            {VAULT_TYPES.map(vault => (
              <div key={vault.id} className="clearing-vault-card">
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
            <h3>Audit Trail</h3>
            <div className="clearing-audit-list">
              {AUDIT_LOG.map((log, i) => (
                <div key={i} className="clearing-audit-item">
                  <span className="clearing-audit-time">{log.time}</span>
                  <span className="clearing-audit-action">{log.action}</span>
                  <span className="clearing-audit-user">{log.user}</span>
                  <span className="clearing-audit-details">{log.details}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="clearing-create">
          <div className="anchor-card clearing-create-card">
            <div className="anchor-card-header">
              <span className="anchor-card-label">Create Vault</span>
            </div>

            <div className="clearing-vault-select">
              {VAULT_TYPES.map(vault => (
                <button
                  key={vault.id}
                  className={`clearing-vault-btn ${selectedVaultType === vault.id ? 'active' : ''}`}
                  onClick={() => setSelectedVaultType(vault.id)}
                >
                  <span>{vault.icon}</span>
                  <span>{vault.name}</span>
                </button>
              ))}
            </div>

            {selectedVaultType === 'multisig' && (
              <div className="clearing-signers">
                <div className="clearing-signers-header">
                  <span>Signers ({signers.length})</span>
                  <button className="clearing-add-btn" onClick={addSigner}>+ Add Signer</button>
                </div>
                {signers.map((signer, i) => (
                  <div key={i} className="clearing-signer-row">
                    <input
                      type="text"
                      placeholder={`Signer ${i + 1} address (0x...)`}
                      value={signer}
                      onChange={e => updateSigner(i, e.target.value)}
                    />
                    <button
                      className="clearing-remove-btn"
                      onClick={() => removeSigner(i)}
                      disabled={signers.length <= 1}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <div className="clearing-threshold">
                  <span>Threshold</span>
                  <select value={threshold} onChange={e => setThreshold(parseInt(e.target.value))}>
                    {signers.map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1} of {signers.length}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {selectedVaultType === 'timelock' && (
              <div className="clearing-timelock">
                <div className="anchor-input-box">
                  <span className="anchor-input-label">Lock Duration (days)</span>
                  <input
                    className="anchor-input"
                    type="number"
                    placeholder="30"
                    value={lockDuration}
                    onChange={e => setLockDuration(e.target.value)}
                  />
                </div>
              </div>
            )}

            {selectedVaultType === 'compliance' && (
              <div className="clearing-compliance">
                <h4>Compliance Rules</h4>
                {rules.map(rule => (
                  <div key={rule.id} className="clearing-rule-row">
                    <div className="clearing-rule-info">
                      <span className="clearing-rule-name">{rule.name}</span>
                      <span className="clearing-rule-desc">{rule.desc}</span>
                    </div>
                    <button
                      className={`clearing-rule-toggle ${rule.enabled ? 'enabled' : ''}`}
                      onClick={() => toggleRule(rule.id)}
                    >
                      {rule.enabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button className="anchor-swap-btn" onClick={handleCreateVault}>
              Create {VAULT_TYPES.find(v => v.id === selectedVaultType)?.name}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
