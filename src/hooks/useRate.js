import { useState, useEffect } from 'react'

export function useRate() {
  const [rate, setRate] = useState(0.9247)

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const res = await fetch('https://api.your-oracle.com/usdc-eurc')
        const data = await res.json()
        setRate(data.rate)
      } catch {
        // keep last known rate on error
      }
    }

    fetchRate()
    const interval = setInterval(fetchRate, 30000)
    return () => clearInterval(interval)
  }, [])

  return rate
}
