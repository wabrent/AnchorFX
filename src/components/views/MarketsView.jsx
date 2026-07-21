import { MARKETS } from '../../utils/mockData'
import { useAppState } from '../../context/useAppState'

export default function MarketsView() {
  const { setActiveTab } = useAppState()

  return (
    <div className="view-section">
      <div className="view-head">
        <h2>Markets</h2>
        <span className="view-sub">Real-time prices · Arc Testnet</span>
      </div>
      <div className="mkt-table-wrap">
        <table className="mkt-table">
          <thead>
            <tr>
              <th>Pair</th>
              <th>Price</th>
              <th>24h Change</th>
              <th>Volume</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {MARKETS.map(m => (
              <tr key={m.pair}>
                <td className="mkt-pair">{m.pair}</td>
                <td className="mkt-price">${m.price.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: m.price < 10 ? 4 : 2 })}</td>
                <td className={`mkt-chg ${m.change >= 0 ? 'up' : 'down'}`}>{m.change >= 0 ? '+' : ''}{m.change}%</td>
                <td className="mkt-vol">{m.volume}</td>
                <td>
                  <button className="mkt-trade-btn" onClick={() => setActiveTab('Swap')}>Trade</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
