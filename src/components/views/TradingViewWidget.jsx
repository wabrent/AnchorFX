import { memo, useEffect, useRef } from 'react'

function TradingViewWidget({ symbol = 'BINANCE:BTCUSDT', interval = '60' }) {
  const container = useRef(null)

  useEffect(() => {
    if (!container.current) return

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/tv.js'
    script.async = true
    script.onload = () => {
      if (typeof TradingView !== 'undefined' && container.current) {
        new TradingView.widget({
          container_id: container.current.id,
          symbol,
          interval,
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: '#0a0a0a',
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          save_image: false,
          height: 480,
          width: '100%',
        })
      }
    }
    document.head.appendChild(script)

    return () => {
      const containerEl = container.current
      if (containerEl) containerEl.innerHTML = ''
    }
  }, [symbol, interval])

  return <div id="tv-chart" ref={container} className="tv-container" />
}

export default memo(TradingViewWidget)
