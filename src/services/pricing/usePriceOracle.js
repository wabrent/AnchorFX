import { useState, useEffect, useCallback } from 'react'

const ORACLE_SOURCES = {
  chainlink: async () => {
    const response = await fetch('/api/pricing/chainlink')
    const data = await response.json()
    return {
      source: 'chainlink',
      timestamp: Date.now(),
      prices: {
        'EUR/USD': data.EURUSD?.price || null,
        'GBP/USD': data.GBPUSD?.price || null,
        'USD/JPY': data.USDJPY?.price || null,
        'AUD/USD': data.AUDUSD?.price || null,
        'USD/CAD': data.USDCAD?.price || null,
        'USD/CHF': data.USDCHF?.price || null,
      },
    }
  },
  pyth: async () => {
    const response = await fetch('/api/pricing/pyth')
    const data = await response.json()
    return {
      source: 'pyth',
      timestamp: Date.now(),
      prices: {
        'EUR/USD': data['EUR/USD']?.price || null,
        'GBP/USD': data['GBP/USD']?.price || null,
        'USD/JPY': data['USD/JPY']?.price || null,
        'AUD/USD': data['AUD/USD']?.price || null,
        'USD/CAD': data['USD/CAD']?.price || null,
        'USD/CHF': data['USD/CHF']?.price || null,
      },
    }
  },
  arcNative: async () => {
    const response = await fetch('/api/pricing/arc-native')
    const data = await response.json()
    return {
      source: 'arcNative',
      timestamp: Date.now(),
      prices: {
        'EUR/USD': data.eurUsdRate || null,
        'GBP/USD': data.gbpUsdRate || null,
        'USD/JPY': data.usdJpyRate || null,
      },
    }
  },
  binance: async () => {
    const response = await fetch('/api/pricing/binance')
    const data = await response.json()
    return {
      source: 'binance',
      timestamp: Date.now(),
      prices: {
        'EUR/USD': data['EURUSDT']?.price || null,
        'GBP/USD': data['GBPUSDT']?.price || null,
        'AUD/USD': data['AUDUSDT']?.price || null,
      },
    }
  },
}

export function usePriceOracle(initialPairs = ['EUR/USD', 'GBP/USD', 'AUD/USD', 'USD/JPY']) {
  const [sources, setSources] = useState({})
  const [currentPrices, setCurrentPrices] = useState({})
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)

  const fetchSource = useCallback(async (sourceName, fetchFn) => {
    try {
      setErrors(prev => ({ ...prev, [sourceName]: null }))
      setLoading(true)
      
      const result = await fetchFn()
      setSources(prev => ({ ...prev, [sourceName]: result }))
      
      const allSources = Object.values(sources)
      const aggregated = {
        'EUR/USD': 0,
        'GBP/USD': 0,
        'AUD/USD': 0,
        'USD/JPY': 0,
        weightSum: 0,
      }
      
      allSources.forEach(source => {
        if (source && source.prices) {
          Object.entries(source.prices).forEach(([pair, price]) => {
            if (price && aggregated.hasOwnProperty(pair)) {
              const confidence = getSourceConfidence(source.source)
              aggregated[pair] += price * confidence
              aggregated.weightSum += confidence
            }
          })
        }
      })
      
      if (aggregated.weightSum > 0) {
        const currentPrices = Object.entries(aggregated)
          .filter(([key]) => key !== 'weightSum')
          .reduce((obj, [key, total]) => ({ ...obj, [key]: total / aggregated.weightSum }), {})
        
        setCurrentPrices(currentPrices)
        setLastUpdate(Date.now())
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, [sourceName]: error.message }))
    } finally {
      setLoading(false)
    }
  }, [sources])

  const refreshAll = useCallback(() => {
    Object.entries(ORACLE_SOURCES).forEach(([sourceName, fetchFn]) => {
      fetchSource(sourceName, fetchFn)
    })
  }, [fetchSource])

  useEffect(() => {
    refreshAll()
    const interval = setInterval(refreshAll, 5000)
    return () => clearInterval(interval)
  }, [refreshAll])

  const getSourceConfidence = (sourceName) => {
    const errorCount = errors[sourceName] ? 1 : 0
    return Math.max(0, 1.0 - (errorCount * 0.3))
  }

  const getPriceStats = () => {
    const sources = Object.values(sources)
    const sourceCounts = {}
    sources.forEach(source => {
      if (source) {
        sourceCounts[source.source] = (sourceCounts[source.source] || 0) + 1
      }
    })
    return {
      lastUpdate,
      sourceCounts,
      errorCount: Object.keys(errors).length,
      pairCount: Object.keys(currentPrices).length,
    }
  }

  const forceRefreshSource = (sourceName) => {
    if (ORACLE_SOURCES[sourceName]) {
      fetchSource(sourceName, ORACLE_SOURCES[sourceName])
    }
  }

  const priceDisplay = (pair) => {
    const price = currentPrices[pair]
    if (price === undefined || price === null) return '--'
    return `$${price.toFixed(5)}`
  }

  return {
    prices: currentPrices,
    loading,
    errors,
    lastUpdate,
    priceDisplay,
    stats: getPriceStats(),
    refreshAll,
    forceRefreshSource,
    sourceNames: Object.keys(ORACLE_SOURCES),
  }
}
