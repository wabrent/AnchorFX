import { useState, useEffect } from 'react'
import { useAppState } from '../../context/useAppState'

const SYMBOLS = [
  { pair: 'USDC/EURC', binance: null },
  { pair: 'BTC/USD', binance: 'BTCUSDT' },
  { pair: 'ETH/USD', binance: 'ETHUSDT' },
  { pair: 'SOL/USD', binance: 'SOLUSDT' },
  { pair: 'ARB/USD', binance: 'ARBUSDT' },
  { pair: 'OP/USD', binance: 'OPUSDT' },
]

export default function MarketsView() {
  const { setActiveTab } = useAppState()
  const [prices, setPrices] = useState({})

  useEffect(() => {
    const symbols = SYMBOLS.filter(s => s.binance).map(s => `"${s.binance}"`).join(',')
    if (!symbols) return

    fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=[${symbols}]`)
      .then(r => r.json())
      .then(data => {
        const map = {}
        data.forEach(t => { map[t.symbol] = { price: parseFloat(t.lastPrice), change: parseFloat(t.priceChangePercent), volume: (parseFloat(t.quoteVolume) / 1e6).toFixed(1) + 'M' } })
        setPrices(map)
      })
      .catch(() => {})

    const interval = setInterval(() => {
      fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=[${symbols}]`)
        .then(r => r.json())
        .then(data => {
          const map = {}
          data.forEach(t => { map[t.symbol] = { price: parseFloat(t.lastPrice), change: parseFloat(t.priceChangePercent), volume: (parseFloat(t.quoteVolume) / 1e6).toFixed(1) + 'M' } })
          setPrices(map)
        })
        .catch(() => {})
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="view-section">
      <div className="view-head">
        <h2>Markets</h2>
        <span className="view-sub">Live prices from Binance · Arc Testnet</span>
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
            {SYMBOLS.map(s => {
              const p = s.binance ? prices[s.binance] : { price: 0.9247, change: 0.12, volume: '12.4M' }
              if (!p) return null
              return (
                <tr key={s.pair}>
                  <td className="mkt-pair">{s.pair}</td>
                  <td className="mkt-price">${p.price.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: p.price < 10 ? 6 : 2 })}</td>
                  <td className={`mkt-chg ${p.change >= 0 ? 'up' : 'down'}`}>{p.change >= 0 ? '+' : ''}{p.change.toFixed(2)}%</td>
                  <td className="mkt-vol">{p.volume}</td>
                  <td>
                    <button className="mkt-trade-btn" onClick={() => setActiveTab('Swap')}>Trade</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
