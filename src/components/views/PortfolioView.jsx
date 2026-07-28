import { useAccount } from 'wagmi'
import { useUsdcBalance } from '../../hooks/useUsdcBalance'
import { useEurcBalance } from '../../hooks/useEurcBalance'
import { useState, useEffect } from 'react'

export default function PortfolioView() {
  const { address } = useAccount()
  const { balance: usdc } = useUsdcBalance()
  const { balance: eurc } = useEurcBalance()
  const [trades, setTrades] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem('anchorfx_trades')
    if (saved) setTrades(JSON.parse(saved).slice(0, 5))
  }, [])

  const usdcRate = 0.9247
  const eurcVal = eurc / usdcRate
  const totalUsdc = usdc + eurcVal

  if (!address) {
    return (
      <div className="view-section">
        <div className="view-head">
          <h2>Portfolio</h2>
          <span className="view-sub">Real balances from Arc Testnet</span>
        </div>
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text3)' }}>
          <p style={{ fontSize: 15 }}>Connect your wallet to view portfolio</p>
        </div>
      </div>
    )
  }

  return (
    <div className="view-section">
      <div className="view-head">
        <h2>Portfolio</h2>
        <span className="view-sub">Real balances from Arc Testnet</span>
      </div>

      <div className="pf-stats">
        <div className="pf-card">
          <div className="pf-card-label">USDC Balance</div>
          <div className="pf-card-val">{usdc.toFixed(2)}</div>
          <div className="pf-card-sub">~${usdc.toFixed(2)}</div>
        </div>
        <div className="pf-card">
          <div className="pf-card-label">EURC Balance</div>
          <div className="pf-card-val">{eurc.toFixed(6)}</div>
          <div className="pf-card-sub">~${eurcVal.toFixed(2)}</div>
        </div>
        <div className="pf-card" style={{ borderColor: 'var(--accent)' }}>
          <div className="pf-card-label">Total Value</div>
          <div className="pf-card-val" style={{ color: 'var(--accent)' }}>${totalUsdc.toFixed(2)}</div>
          <div className="pf-card-sub">Arc Testnet</div>
        </div>
        <div className="pf-card">
          <div className="pf-card-label">Rate</div>
          <div className="pf-card-val" style={{ fontSize: 18 }}>1 USDC = 0.9247 EURC</div>
          <div className="pf-card-sub">Chain ID 5042002</div>
        </div>
      </div>

      <div className="pf-balance-box">
        <span className="pf-balance-label">Connected Wallet</span>
        <span className="pf-balance-val" style={{ fontSize: 13, fontFamily: 'DM Mono, monospace' }}>{address}</span>
      </div>

      {trades.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <div className="orders-list-header"><h3>Recent Activity</h3></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {trades.map((t, i) => (
              <div key={i} className="orders-list-item" style={{ opacity: 0.8 }}>
                <div className="orders-item-main">
                  <span className="orders-item-pair">{t.type}</span>
                  <span className="orders-item-amount">{t.amount} USDC</span>
                  <span className="orders-item-side" style={{ color: 'var(--green)' }}>{t.status}</span>
                </div>
                <div className="orders-item-footer">
                  <span className="orders-item-time">{t.time}</span>
                  {t.rate && <span className="orders-item-time" style={{ marginLeft: 12 }}>@ {t.rate}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--s1)', borderRadius: 12, border: '0.5px solid var(--border)', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>View all transactions on ArcScan</p>
        <a
          href={`https://testnet.arcscan.app/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mkt-trade-btn"
          style={{ display: 'inline-block', padding: '8px 20px' }}
        >
          Open ArcScan
        </a>
      </div>
    </div>
  )
}
