import { memo, useEffect, useRef } from 'react'
import { useAppState } from '../../context/useAppState'

const SYMBOL_LABEL = {
  'FX:EURUSD': 'EUR / USD',
  'BINANCE:BTCUSDT': 'BTC / USD',
  'BINANCE:ETHUSDT': 'ETH / USD',
  'BINANCE:SOLUSDT': 'SOL / USD',
  'BINANCE:ARBUSDT': 'ARB / USD',
  'BINANCE:OPUSDT': 'OP / USD',
}

function labelFor(symbol) {
  return SYMBOL_LABEL[symbol] || (symbol ? symbol.replace('BINANCE:', '').replace('USDT', '/ USD').replace('_', ' ') : '')
}

function TradingViewWidget() {
  const { selectedPair } = useAppState()
  const container = useRef(null)
  const widgetRef = useRef(null)
  const symbol = selectedPair || 'FX:EURUSD'

  useEffect(() => {
    if (!container.current) return

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/tv.js'
    script.async = true
    script.onload = () => {
      if (typeof TradingView !== 'undefined' && container.current) {
        widgetRef.current = new TradingView.widget({
          container_id: container.current.id,
          symbol,
          interval: '60',
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '3',
          locale: 'en',
          toolbar_bg: 'transparent',
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_side_toolbar: true,
          allow_symbol_change: true,
          save_image: false,
          autosize: true,
          studies: ['STD;SMA'],
          overrides: {
            'paneProperties.background': '#0B0E14',
            'paneProperties.backgroundType': 'solid',
            'paneProperties.vertGridProperties.color': 'rgba(255, 255, 255, 0.03)',
            'paneProperties.horzGridProperties.color': 'rgba(255, 255, 255, 0.03)',
            'mainSeriesProperties.candleStyle.upColor': '#10B981',
            'mainSeriesProperties.candleStyle.downColor': '#EF4444',
            'mainSeriesProperties.candleStyle.wickUpColor': '#10B981',
            'mainSeriesProperties.candleStyle.wickDownColor': '#EF4444',
          },
        })
      }
    }
    document.head.appendChild(script)

    return () => {
      const el = container.current
      if (el) el.innerHTML = ''
    }
  }, [])

  useEffect(() => {
    if (widgetRef.current && selectedPair && selectedPair !== symbol) {
      widgetRef.current.setSymbol(selectedPair)
    }
  }, [selectedPair])

  return (
    <div className="tv-wrapper">
      <div className="tv-header">
        <div className="tv-header-left">
          <span className="tv-dot" />
          <span className="tv-label">Live Market Chart</span>
        </div>
        <span className="tv-pair-label">{labelFor(symbol)} · 1H</span>
      </div>
      <div id="tv-chart" ref={container} className="tv-container" />
    </div>
  )
}

export default memo(TradingViewWidget)
