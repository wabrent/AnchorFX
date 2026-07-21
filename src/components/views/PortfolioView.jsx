import { useAccount, useBalance } from 'wagmi'
import { MOCK_POSITIONS } from '../../utils/mockData'

export default function PortfolioView() {
  const { address } = useAccount()
  const { data: balance } = useBalance({ address })
  const equity = balance ? parseFloat(balance.formatted) : 0
  const pnl = 1142.50
  const openPositions = MOCK_POSITIONS.length

  return (
    <div className="view-section">
      <div className="view-head">
        <h2>Portfolio</h2>
        <span className="view-sub">Balances & positions</span>
      </div>

      <div className="pf-stats">
        <div className="pf-card">
          <div className="pf-card-label">Total Equity</div>
          <div className="pf-card-val">${equity.toFixed(2)}</div>
        </div>
        <div className="pf-card">
          <div className="pf-card-label">Unrealized PnL</div>
          <div className={`pf-card-val ${pnl >= 0 ? 'up' : 'down'}`}>${pnl.toFixed(2)}</div>
        </div>
        <div className="pf-card">
          <div className="pf-card-label">Open Positions</div>
          <div className="pf-card-val">{openPositions}</div>
        </div>
        <div className="pf-card">
          <div className="pf-card-label">Available Margin</div>
          <div className="pf-card-val">${equity.toFixed(2)}</div>
        </div>
      </div>

      {address && (
        <div className="pf-balance-box">
          <span className="pf-balance-label">Connected Wallet Balance</span>
          <span className="pf-balance-val">{equity.toFixed(4)} {balance?.symbol || 'ARC'}</span>
        </div>
      )}

      {MOCK_POSITIONS.length > 0 && (
        <>
          <h3 className="pf-section-title">Active Positions</h3>
          <table className="mkt-table">
            <thead>
              <tr>
                <th>Pair</th>
                <th>Side</th>
                <th>Size</th>
                <th>Entry</th>
                <th>Mark</th>
                <th>PnL</th>
                <th>Leverage</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_POSITIONS.map((p, i) => (
                <tr key={i}>
                  <td className="mkt-pair">{p.pair}</td>
                  <td><span className={`pos-badge ${p.side.toLowerCase()}`}>{p.side}</span></td>
                  <td>{p.size}</td>
                  <td>${p.entry.toLocaleString()}</td>
                  <td>${p.mark.toLocaleString()}</td>
                  <td className={p.pnl >= 0 ? 'up' : 'down'}>${p.pnl.toFixed(2)}</td>
                  <td>{p.leverage}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}
