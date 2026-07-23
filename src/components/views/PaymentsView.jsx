import { useState, useEffect } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { USDC_ADDRESS } from '../../config'

const PAYMENT_TYPES = [
  { id: 'oneTime', label: 'One-Time', desc: 'Single payment link', icon: '🔗' },
  { id: 'recurring', label: 'Recurring', desc: 'Subscription payments', icon: '🔄' },
  { id: 'split', label: 'Split Payment', desc: 'Split between multiple recipients', icon: '✂️' },
  { id: 'escrow', label: 'Escrow', desc: 'Held until conditions met', icon: '🔒' },
]

export default function PaymentsView() {
  const { address } = useAccount()
  const [payments, setPayments] = useState([])

  const { data: balanceData } = useBalance({ address, token: USDC_ADDRESS, chainId: 5042002 })
  const balance = balanceData ? parseFloat(balanceData.formatted) : 0

  useEffect(() => {
    const saved = localStorage.getItem('anchorfx_payments')
    if (saved) setPayments(JSON.parse(saved))
  }, [])

  return (
    <div className="view-section payments-view">
      <div className="view-head">
        <h2>Payment Links</h2>
        <span className="view-sub">Programmable payments on Arc Network</span>
      </div>

      <div style={{ padding: '1rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, marginBottom: '1.5rem', fontSize: 13, color: '#f59e0b' }}>
        Payment links are under development. Direct USDC transfers work via Swap tab.
      </div>

      <div className="vaults-stats" style={{ marginBottom: '1.5rem' }}>
        <div className="vaults-stat-card">
          <span className="vaults-stat-label">Your USDC</span>
          <span className="vaults-stat-val">{balance.toFixed(2)}</span>
        </div>
        <div className="vaults-stat-card">
          <span className="vaults-stat-label">Payment Types</span>
          <span className="vaults-stat-val">{PAYMENT_TYPES.length}</span>
        </div>
        <div className="vaults-stat-card">
          <span className="vaults-stat-label">Network</span>
          <span className="vaults-stat-val" style={{ fontSize: 13 }}>Arc Testnet</span>
        </div>
      </div>

      <div className="payments-type-grid" style={{ marginBottom: '1.5rem' }}>
        {PAYMENT_TYPES.map(t => (
          <div key={t.id} className="payments-type-btn" style={{ opacity: 0.6 }}>
            <span className="payments-type-icon">{t.icon}</span>
            <span className="payments-type-name">{t.label}</span>
            <span className="payments-type-desc">{t.desc}</span>
          </div>
        ))}
      </div>

      {payments.length > 0 && (
        <div className="payments-list-card">
          <div className="payments-list-header">
            <h3>Payment History ({payments.length})</h3>
          </div>
          {payments.map(p => (
            <div key={p.id} className="payments-list-item">
              <div className="payments-item-main">
                <span className="payments-item-type">{PAYMENT_TYPES.find(t => t.id === p.type)?.icon}</span>
                <div className="payments-item-info">
                  <span className="payments-item-amount">{p.amount} USDC</span>
                  <span className="payments-item-recipient">{p.recipient}</span>
                </div>
                <span className="payments-item-status active">{p.status}</span>
              </div>
              <div className="payments-item-footer">
                <span className="payments-item-time">{p.time}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
