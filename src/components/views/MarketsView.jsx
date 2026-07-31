import { useState, useEffect, useRef } from 'react'
import { useAppState } from '../../context/useAppState'
import { TableSkeleton } from '../Skeleton'

const SYMBOLS = [
  { pair: 'USDC/EURC', binance: null },
  { pair: 'BTC/USD', binance: 'BTCUSDT' },
  { pair: 'ETH/USD', binance: 'ETHUSDT' },
  { pair: 'SOL/USD', binance: 'SOLUSDT' },
  { pair: 'ARB/USD', binance: 'ARBUSDT' },
  { pair: 'OP/USD', binance: 'OPUSDT' },
]

const BINANCE_MAP = {
  'BTC/USD': 'BINANCE:BTCUSDT',
  'ETH/USD': 'BINANCE:ETHUSDT',
  'SOL/USD': 'BINANCE:SOLUSDT',
  'ARB/USD': 'BINANCE:ARBUSDT',
  'OP/USD': 'BINANCE:OPUSDT',
  'USDC/EURC': null,
}

export default function MarketsView() {
  const { setActiveTab, setSelectedPair } = useAppState()
  const [prices, setPrices] = useState({})
  const [loading, setLoading] = useState(true)
  const [flash, setFlash] = useState({})
  const [lastUpdate, setLastUpdate] = useState(null)
  const prevPrices = useRef({})

  useEffect(() => {
    const symbols = SYMBOLS.filter(s => s.binance).map(s => `"${s.binance}"`).join(',')
    if (!symbols) return

    const fetchPrices = () => {
      fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=[${symbols}]`)
        .then(r => r.json())
        .then(data => {
          const map = {}
          const newFlash = {}
          data.forEach(t => {
            const price = parseFloat(t.lastPrice)
            const prev = prevPrices.current[t.symbol]
            if (prev && prev !== price) {
              newFlash[t.symbol] = price > prev ? 'up' : 'down'
            }
            map[t.symbol] = {
              price,
              change: parseFloat(t.priceChangePercent),
              volume: (parseFloat(t.quoteVolume) / 1e6).toFixed(1) + 'M',
              high: parseFloat(t.highPrice),
              low: parseFloat(t.lowPrice),
            }
            prevPrices.current[t.symbol] = price
          })
          setPrices(map)
          setLastUpdate(new Date().toLocaleTimeString())
          setLoading(false)
          if (Object.keys(newFlash).length) {
            setFlash(newFlash)
            setTimeout(() => setFlash({}), 800)
          }
        })
        .catch(() => {})
    }

    fetchPrices()
    const interval = setInterval(fetchPrices, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="view-section">
      <div className="view-head">
        <h2>Markets</h2>
        <span className="view-sub">
          Live from Binance · {lastUpdate ? `Updated ${lastUpdate}` : 'Loading...'}
        </span>
      </div>
      <div className="mkt-table-wrap">
        {loading ? (
          <TableSkeleton rows={6} />
        ) : (
        <table className="mkt-table">
          <thead>
            <tr>
              <th>Pair</th>
              <th>Price</th>
              <th>24h Change</th>
              <th>24h High / Low</th>
              <th>Volume</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {SYMBOLS.map(s => {
              const p = s.binance ? prices[s.binance] : { price: 0.9247, change: 0.12, volume: '12.4M', high: 0.93, low: 0.92 }
              if (!p) return null
              const flashDir = flash[s.binance]
              return (
                <tr
                  key={s.pair}
                  className="mkt-row"
                  onClick={() => {
                    if (!BINANCE_MAP[s.pair]) {
                      setSelectedPair(null)
                      setActiveTab('Swap')
                    }
                  }}
                  style={BINANCE_MAP[s.pair] ? { cursor: 'default' } : undefined}
                >
                  <td className="mkt-pair">{s.pair}</td>
                  <td className={`mkt-price${flashDir ? ' flash-' + flashDir : ''}`}>
                    ${p.price.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: p.price < 10 ? 6 : 2 })}
                  </td>
                  <td className={`mkt-chg ${p.change >= 0 ? 'up' : 'down'}`}>
                    {p.change >= 0 ? '+' : ''}{p.change.toFixed(2)}%
                  </td>
                  <td className="mkt-vol" style={{ fontSize: 12 }}>
                    {p.high ? `$${p.high.toLocaleString('en', { maximumFractionDigits: p.high < 10 ? 6 : 2 })}` : '--'}
                    {' / '}
                    {p.low ? `$${p.low.toLocaleString('en', { maximumFractionDigits: p.low < 10 ? 6 : 2 })}` : '--'}
                  </td>
                  <td className="mkt-vol">{p.volume}</td>
                  <td>
                    {BINANCE_MAP[s.pair] ? (
                      <span className="mkt-trade-btn soon" style={{ color: 'var(--text3)', background: 'var(--s3)' }}>Soon</span>
                    ) : (
                      <span className="mkt-trade-btn">Trade →</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        )}
      </div>
    </div>
  )
}
