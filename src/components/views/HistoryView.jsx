import { MOCK_HISTORY } from '../../utils/mockData'

export default function HistoryView() {
  return (
    <div className="view-section">
      <div className="view-head">
        <h2>Trade History</h2>
        <span className="view-sub">Recent activity</span>
      </div>

      <table className="mkt-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Pair</th>
            <th>Side</th>
            <th>Type</th>
            <th>Size</th>
            <th>Price</th>
            <th>Fee</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_HISTORY.map((h, i) => (
            <tr key={i}>
              <td className="hist-time">{h.time}</td>
              <td className="mkt-pair">{h.pair}</td>
              <td><span className={`pos-badge ${h.side === 'Buy' ? 'long' : 'short'}`}>{h.side}</span></td>
              <td>{h.type}</td>
              <td>{h.size}</td>
              <td className="mkt-price">${h.price.toLocaleString()}</td>
              <td>${h.fee.toFixed(2)}</td>
              <td><span className="hist-status">{h.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
