import { useState, useEffect, useCallback } from 'react'

const EUR_USD_FEED = 'a995d00bb36a63cef7fd2c287dc105fc8f3d93779f062f09551b0af3e81ec30b'

async function fetchEurUsd() {
  const res = await fetch(
    `https://hermes.pyth.network/v2/updates/price/latest?ids[]=${EUR_USD_FEED}`
  )
  if (!res.ok) throw new Error('Pyth fetch failed')
  const data = await res.json()
  const parsed = data.parsed?.[0]?.price
  if (!parsed) throw new Error('No price data')
  const expo = typeof parsed.expo === 'number' ? parsed.expo : Number(parsed.expo)
  const price = Number(parsed.price) * Math.pow(10, expo)
  return price
}

export function usePythRate() {
  const [eurUsd, setEurUsd] = useState(1.1486)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    try {
      const price = await fetchEurUsd()
      if (price > 0) {
        setEurUsd(price)
        setError(null)
      }
    } catch (e) {
      setError(e.message || 'Pyth error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
    const interval = setInterval(fetch, 15000)
    return () => clearInterval(interval)
  }, [fetch])

  return {
    eurUsd,
    usdcToEurc: 1 / eurUsd,
    loading,
    error,
  }
}
