import { memo, useEffect, useRef } from 'react'
import { useAppState } from '../../context/useAppState'

function TradingViewWidget() {
  const { selectedPair } = useAppState()
  const container = useRef(null)
  const widgetRef = useRef(null)

  useEffect(() => {
    if (!container.current) return

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/tv.js'
    script.async = true
    script.onload = () => {
      if (typeof TradingView !== 'undefined' && container.current) {
        widgetRef.current = new TradingView.widget({
          container_id: container.current.id,
          symbol: selectedPair || 'BINANCE:BTCUSDT',
          interval: '60',
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: '#030304',
          enable_publishing: false,
          hide_side_toolbar: true,
          hide_top_toolbar: false,
          allow_symbol_change: true,
          save_image: false,
          studies: ['STD;SMA'],
          autosize: true,
          time_frames: [
            { text: '1m', resolution: '1' },
            { text: '5m', resolution: '5' },
            { text: '15m', resolution: '15' },
            { text: '1h', resolution: '60' },
            { text: '4h', resolution: '240' },
            { text: '1D', resolution: '1D' },
          ],
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
    if (widgetRef.current && selectedPair) {
      widgetRef.current.setSymbol(selectedPair)
    }
  }, [selectedPair])

  return <div id="tv-chart" ref={container} className="tv-container" />
}

export default memo(TradingViewWidget)
