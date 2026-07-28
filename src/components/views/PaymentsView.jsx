import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useUsdcBalance } from '../../hooks/useUsdcBalance'

const PAYMENT_TYPES = [
  { id: 'oneTime', label: 'One-Time', desc: 'Single payment link', icon: '🔗' },
  { id: 'recurring', label: 'Recurring', desc: 'Subscription payments', icon: '🔄' },
  { id: 'split', label: 'Split Payment', desc: 'Split between multiple recipients', icon: '✂️' },
  { id: 'escrow', label: 'Escrow', desc: 'Held until conditions met', icon: '🔒' },
]

export default function PaymentsView() {
  const { address } = useAccount()
  const [payments, setPayments] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentType, setPaymentType] = useState('oneTime')
  const [memo, setMemo] = useState('')

  const { balance } = useUsdcBalance()

  useEffect(() => {
    const saved = localStorage.getItem('anchorfx_payments')
    if (saved) setPayments(JSON.parse(saved))
  }, [])

  function handleCreate() {
    if (!amount || !recipient || !address) return
    const id = Date.now()
    const link = `${window.location.origin}?pay=${id}&to=${recipient}&amt=${amount}`
    const record = {
      id,
      time: new Date().toLocaleString(),
      type: paymentType,
      amount: parseFloat(amount).toFixed(2),
      recipient,
      memo,
      status: 'Active',
      link,
    }
    const updated = [record, ...payments]
    setPayments(updated)
    localStorage.setItem('anchorfx_payments', JSON.stringify(updated))
    setAmount('')
    setRecipient('')
    setMemo('')
    setShowForm(false)
  }

  function cancelPayment(id) {
    const updated = payments.map(p => p.id === id ? { ...p, status: 'Cancelled' } : p)
    setPayments(updated)
    localStorage.setItem('anchorfx_payments', JSON.stringify(updated))
  }

  return (
    <div className="view-section payments-view">
      <div className="view-head">
        <h2>Payment Links</h2>
        <span className="view-sub">Programmable payments on Arc Network</span>
      </div>

      <div style={{ padding: '1rem', background: 'rgba(107,139,255,0.08)', border: '1px solid rgba(107,139,255,0.2)', borderRadius: 12, marginBottom: '1.5rem', fontSize: 13, color: '#6B8BFF' }}>
        Payment links are recorded locally. On-chain execution available via the Swap tab.
      </div>

      <div className="vaults-stats" style={{ marginBottom: '1.5rem' }}>
        <div className="vaults-stat-card">
          <span className="vaults-stat-label">Your USDC</span>
          <span className="vaults-stat-val">{balance.toFixed(2)}</span>
        </div>
        <div className="vaults-stat-card">
          <span className="vaults-stat-label">Active Links</span>
          <span className="vaults-stat-val">{payments.filter(p => p.status === 'Active').length}</span>
        </div>
        <div className="vaults-stat-card">
          <span className="vaults-stat-label">Total Created</span>
          <span className="vaults-stat-val">{payments.length}</span>
        </div>
      </div>

      <button
        className="anchor-swap-btn"
        onClick={() => setShowForm(!showForm)}
        style={{ marginBottom: '1rem' }}
      >
        {showForm ? 'Cancel' : '+ Create Payment Link'}
      </button>

      {showForm && (
        <div className="anchor-card" style={{ marginBottom: '1.5rem' }}>
          <div className="anchor-card-header">
            <span className="anchor-card-label">New Payment Link</span>
          </div>

          <div className="payments-type-grid" style={{ marginBottom: '1rem' }}>
            {PAYMENT_TYPES.map(t => (
              <div
                key={t.id}
                className={`payments-type-btn ${paymentType === t.id ? 'active' : ''}`}
                onClick={() => setPaymentType(t.id)}
                style={{ cursor: 'pointer', opacity: paymentType === t.id ? 1 : 0.6 }}
              >
                <span className="payments-type-icon">{t.icon}</span>
                <span className="payments-type-name">{t.label}</span>
                <span className="payments-type-desc">{t.desc}</span>
              </div>
            ))}
          </div>

          <div className="anchor-input-box">
            <span className="anchor-input-label">Recipient Address</span>
            <input
              className="anchor-input"
              type="text"
              placeholder="0x..."
              value={recipient}
              onChange={e => setRecipient(e.target.value)}
            />
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
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
            <span className="anchor-input-hint">USDC</span>
          </div>

          <div className="anchor-input-box">
            <span className="anchor-input-label">Memo</span>
            <input
              className="anchor-input"
              type="text"
              placeholder="What is this payment for?"
              value={memo}
              onChange={e => setMemo(e.target.value)}
            />
          </div>

          <button
            className="anchor-swap-btn"
            onClick={handleCreate}
            disabled={!amount || !recipient || !address}
            style={{ marginTop: '0.75rem' }}
          >
            Generate Payment Link
          </button>
        </div>
      )}

      {payments.length > 0 && (
        <div className="payments-list-card">
          <div className="payments-list-header">
            <h3>Payment Links ({payments.length})</h3>
          </div>
          {payments.map(p => (
            <div key={p.id} className="payments-list-item">
              <div className="payments-item-main">
                <span className="payments-item-type">{PAYMENT_TYPES.find(t => t.id === p.type)?.icon}</span>
                <div className="payments-item-info">
                  <span className="payments-item-amount">{p.amount} USDC</span>
                  <span className="payments-item-recipient">{p.recipient.slice(0, 6)}...{p.recipient.slice(-4)}</span>
                </div>
                <span className={`payments-item-status ${p.status.toLowerCase()}`}>{p.status}</span>
                {p.status === 'Active' && (
                  <button
                    onClick={() => cancelPayment(p.id)}
                    style={{ background: 'none', border: '1px solid var(--red)', color: 'var(--red)', borderRadius: 6, padding: '2px 8px', cursor: 'pointer', fontSize: 12, marginLeft: 8 }}
                  >Cancel</button>
                )}
              </div>
              <div className="payments-item-footer">
                <span className="payments-item-time">{p.time}</span>
                {p.memo && <span className="payments-item-time" style={{ marginLeft: 12 }}>"{p.memo}"</span>}
              </div>
              {p.link && (
                <div className="payments-item-footer" style={{ marginTop: 4 }}>
                  <code style={{ fontSize: 10, color: 'var(--text3)', wordBreak: 'break-all' }}>{p.link}</code>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
