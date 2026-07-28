import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'

export default function HistoryView() {
  const { address } = useAccount()
  const [trades, setTrades] = useState([])

  useEffect(() => {
    const stored = localStorage.getItem('anchorfx_trades')
    if (stored) setTrades(JSON.parse(stored))
  }, [])

  useEffect(() => {
    const handler = () => {
      const stored = localStorage.getItem('anchorfx_trades')
      if (stored) setTrades(JSON.parse(stored))
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  function clearHistory() {
    localStorage.removeItem('anchorfx_trades')
    setTrades([])
  }

  const totalVolume = trades.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)

  return (
    <div className="view-section">
      <div className="view-head">
        <h2>Trade History</h2>
        <span className="view-sub">
          {trades.length} trade{trades.length !== 1 ? 's' : ''}
          {totalVolume > 0 ? ` · ${totalVolume.toFixed(2)} USDC total volume` : ''}
        </span>
      </div>

      {trades.length > 0 ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
            <button
              onClick={clearHistory}
              style={{
                background: 'none',
                border: '0.5px solid var(--border)',
                color: 'var(--text3)',
                padding: '4px 12px',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 12,
              }}
            >Clear History</button>
          </div>
          <table className="mkt-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Rate</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t, i) => (
                <tr key={i}>
                  <td className="hist-time">{t.time}</td>
                  <td>{t.type || 'Swap'}</td>
                  <td className="mkt-price">{t.amount} USDC</td>
                  <td style={{ fontSize: 12, color: 'var(--text2)' }}>{t.rate || '--'}</td>
                  <td><span className="hist-status" style={{ color: t.status === 'Confirmed' ? 'var(--green)' : 'var(--text2)' }}>{t.status}</span></td>
                  <td>
                    {t.hash && (
                      <a className="mkt-trade-btn" href={`https://testnet.arcscan.app/tx/${t.hash}`} target="_blank" rel="noopener noreferrer">
                        View ↗
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text3)' }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: '0.5rem' }}>📊</span>
          <p style={{ fontSize: 15, marginBottom: 8 }}>No swap history yet</p>
          <p style={{ fontSize: 12 }}>Execute a swap on the Swap tab to see your history here</p>
        </div>
      )}

      {address && (
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <a
            href={`https://testnet.arcscan.app/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 12, color: 'var(--accent2)' }}
          >
            View all transactions on ArcScan ↗
          </a>
        </div>
      )}
    </div>
  )
}
