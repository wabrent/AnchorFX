import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useBalance } from 'wagmi'
import { parseUnits } from 'viem'
import { USDC_ADDRESS } from '../../config'
import { useAppState } from '../../context/useAppState'

const ERC20_ABI = [
  { type: 'function', name: 'transfer', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'balanceOf', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
]

const PAYMENT_TYPES = [
  { id: 'oneTime', label: 'One-Time', desc: 'Single payment link', icon: '🔗' },
  { id: 'recurring', label: 'Recurring', desc: 'Subscription payments', icon: '🔄' },
  { id: 'split', label: 'Split Payment', desc: 'Split between multiple recipients', icon: '✂️' },
  { id: 'escrow', label: 'Escrow', desc: 'Held until conditions met', icon: '🔒' },
]

export default function PaymentsView() {
  const { address } = useAccount()
  const { notify } = useAppState()
  const [paymentType, setPaymentType] = useState('oneTime')
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  const [memo, setMemo] = useState('')
  const [payments, setPayments] = useState([])
  const [generatedLink, setGeneratedLink] = useState(null)

  const { data: balanceData } = useBalance({ address })
  const { writeContract, isPending, isSuccess, error } = useWriteContract()

  useEffect(() => {
    const saved = localStorage.getItem('anchorfx_payments')
    if (saved) setPayments(JSON.parse(saved))
  }, [])

  useEffect(() => {
    if (isSuccess && amount) {
      const record = {
        id: Date.now(),
        time: new Date().toLocaleString(),
        type: paymentType,
        amount,
        recipient: recipient || 'Anyone',
        memo,
        status: 'Created',
        link: `arcfx://pay/${Date.now()}`,
      }
      const updated = [record, ...payments]
      setPayments(updated)
      localStorage.setItem('anchorfx_payments', JSON.stringify(updated))
      setGeneratedLink(record.link)
      notify('Payment Link Created', `Created ${paymentType} payment for ${amount} USDC`, 'success')
    }
  }, [isSuccess])

  function handleCreatePayment() {
    if (!amount) return

    if (recipient && recipient !== address) {
      writeContract({
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [recipient, parseUnits(amount, 6)],
      })
    } else {
      const record = {
        id: Date.now(),
        time: new Date().toLocaleString(),
        type: paymentType,
        amount,
        recipient: 'Anyone with link',
        memo,
        status: 'Active',
        link: `arcfx://pay/${Date.now()}`,
      }
      const updated = [record, ...payments]
      setPayments(updated)
      localStorage.setItem('anchorfx_payments', JSON.stringify(updated))
      setGeneratedLink(record.link)
      notify('Payment Link Created', `Created ${paymentType} payment for ${amount} USDC`, 'success')
    }
  }

  function copyLink(link) {
    navigator.clipboard.writeText(link).then(() => {
      notify('Copied', 'Payment link copied to clipboard', 'info')
    })
  }

  function deactivatePayment(id) {
    const updated = payments.map(p => p.id === id ? { ...p, status: 'Deactivated' } : p)
    setPayments(updated)
    localStorage.setItem('anchorfx_payments', JSON.stringify(updated))
    notify('Deactivated', 'Payment link deactivated', 'info')
  }

  const activePayments = payments.filter(p => p.status === 'Active')
  const historicalPayments = payments.filter(p => p.status !== 'Active')

  return (
    <div className="view-section payments-view">
      <div className="view-head">
        <h2>Payment Links</h2>
        <span className="view-sub">Programmable payments on Arc Network</span>
      </div>

      <div className="payments-grid">
        <div className="anchor-card payments-form-card">
          <div className="anchor-card-header">
            <span className="anchor-card-label">Create Payment</span>
          </div>

          <div className="payments-type-grid">
            {PAYMENT_TYPES.map(t => (
              <button
                key={t.id}
                className={`payments-type-btn ${paymentType === t.id ? 'active' : ''}`}
                onClick={() => setPaymentType(t.id)}
              >
                <span className="payments-type-icon">{t.icon}</span>
                <span className="payments-type-name">{t.label}</span>
                <span className="payments-type-desc">{t.desc}</span>
              </button>
            ))}
          </div>

          <div className="anchor-input-box">
            <span className="anchor-input-label">Amount (USDC)</span>
            <input
              className="anchor-input"
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
            <span className="anchor-input-hint">
              Balance: {balanceData ? parseFloat(balanceData.formatted).toFixed(2) : '0.00'} USDC
            </span>
          </div>

          <div className="anchor-input-box">
            <span className="anchor-input-label">Recipient Address (optional)</span>
            <input
              className="anchor-input"
              type="text"
              placeholder="0x... or leave empty for anyone"
              value={recipient}
              onChange={e => setRecipient(e.target.value)}
            />
            <span className="anchor-input-hint">Leave empty to create a claimable link</span>
          </div>

          <div className="anchor-input-box">
            <span className="anchor-input-label">Memo (optional)</span>
            <input
              className="anchor-input"
              type="text"
              placeholder="Payment for..."
              value={memo}
              onChange={e => setMemo(e.target.value)}
            />
          </div>

          <button
            className="anchor-swap-btn"
            onClick={handleCreatePayment}
            disabled={!address || isPending || !amount}
          >
            {isPending ? 'Creating...' : 'Create Payment Link'}
          </button>

          {generatedLink && (
            <div className="payments-generated">
              <span className="payments-gen-label">Payment Link</span>
              <div className="payments-gen-link">
                <code>{generatedLink}</code>
                <button className="payments-copy-btn" onClick={() => copyLink(generatedLink)}>Copy</button>
              </div>
            </div>
          )}

          {error && <p className="anchor-msg error">{error.message.slice(0, 100)}...</p>}
        </div>

        <div className="payments-list-card">
          <div className="payments-list-header">
            <h3>Active Links ({activePayments.length})</h3>
          </div>
          {activePayments.length === 0 ? (
            <div className="payments-empty">No active payment links</div>
          ) : (
            activePayments.map(p => (
              <div key={p.id} className="payments-list-item">
                <div className="payments-item-main">
                  <span className="payments-item-type">{PAYMENT_TYPES.find(t => t.id === p.type)?.icon}</span>
                  <div className="payments-item-info">
                    <span className="payments-item-amount">{p.amount} USDC</span>
                    <span className="payments-item-recipient">{p.recipient}</span>
                  </div>
                  <span className="payments-item-status active">Active</span>
                </div>
                <div className="payments-item-footer">
                  <span className="payments-item-time">{p.time}</span>
                  {p.memo && <span className="payments-item-memo">{p.memo}</span>}
                  <div className="payments-item-actions">
                    <button className="payments-action-btn" onClick={() => copyLink(p.link)}>Copy Link</button>
                    <button className="payments-action-btn deactivate" onClick={() => deactivatePayment(p.id)}>Deactivate</button>
                  </div>
                </div>
              </div>
            ))
          )}

          {historicalPayments.length > 0 && (
            <>
              <div className="payments-list-header" style={{ marginTop: '1rem' }}>
                <h3>History ({historicalPayments.length})</h3>
              </div>
              {historicalPayments.map(p => (
                <div key={p.id} className="payments-list-item historical">
                  <div className="payments-item-main">
                    <span className="payments-item-type">{PAYMENT_TYPES.find(t => t.id === p.type)?.icon}</span>
                    <div className="payments-item-info">
                      <span className="payments-item-amount">{p.amount} USDC</span>
                      <span className="payments-item-recipient">{p.recipient}</span>
                    </div>
                    <span className="payments-item-status deactivated">Deactivated</span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
