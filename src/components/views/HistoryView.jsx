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

  return (
    <div className="view-section">
      <div className="view-head">
        <h2>Trade History</h2>
        <span className="view-sub">Your swaps on AnchorFX</span>
      </div>

      {trades.length > 0 ? (
        <table className="mkt-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {trades.map((t, i) => (
              <tr key={i}>
                <td className="hist-time">{t.time}</td>
                <td>{t.type}</td>
                <td className="mkt-price">{t.amount} USDC</td>
                <td><span className="hist-status">{t.status}</span></td>
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
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text3)' }}>
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
