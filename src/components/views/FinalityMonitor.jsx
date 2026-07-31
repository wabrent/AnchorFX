import { useState, useEffect, useRef } from 'react'
import { useBlockNumber } from 'wagmi'

const WINDOW = 20

export default function FinalityMonitor() {
  const { data: blockNumber } = useBlockNumber({ watch: true })
  const [times, setTimes] = useState([])
  const [lastSeen, setLastSeen] = useState(null)
  const prevBlock = useRef(null)
  const [latency, setLatency] = useState(null)

  useEffect(() => {
    if (!blockNumber) return
    const now = Date.now()
    setLastSeen(now)
    if (prevBlock.current !== null && prevBlock.current !== blockNumber) {
      const diff = now - prevBlock.current.t
      setTimes(t => [...t, { block: blockNumber, ms: diff }].slice(-WINDOW))
    }
    prevBlock.current = { block: blockNumber, t: now }
  }, [blockNumber])

  useEffect(() => {
    if (times.length > 1) {
      const avg = times.slice(1).reduce((s, x) => s + x.ms, 0) / Math.max(1, times.length - 1)
      setLatency(avg)
    }
  }, [times])

  const lastMs = times.length ? times[times.length - 1].ms : null
  const online = lastSeen && Date.now() - lastSeen < 5000

  return (
    <div className="anchor-card" style={{ marginBottom: 16 }}>
      <div className="anchor-card-header">
        <span className="anchor-card-label">Arc Network Finality</span>
        <span
          style={{
            fontSize: 11,
            color: online ? 'var(--green)' : 'var(--red)',
            fontWeight: 600,
          }}
        >
          {online ? '● LIVE' : '○ OFFLINE'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 8 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>Latest Block</div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'DM Mono, monospace' }}>
            {blockNumber ? blockNumber.toLocaleString() : '—'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>Avg Block Time</div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'DM Mono, monospace', color: 'var(--accent2)' }}>
            {latency ? `${latency.toFixed(0)} ms` : '—'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>Finality</div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'DM Mono, monospace', color: 'var(--green)' }}>
            {lastMs && lastMs < 1000 ? '<1s' : '—'}
          </div>
        </div>
      </div>

      {times.length > 1 && (
        <div style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 36 }}>
            {times.slice(1).map((t, i) => (
              <div
                key={i}
                title={`Block ${t.block.toLocaleString()}: ${t.ms}ms`}
                style={{
                  flex: 1,
                  background: t.ms < 1000 ? 'var(--green)' : t.ms < 2000 ? 'var(--accent2)' : 'var(--red)',
                  height: `${Math.min(100, (t.ms / 2000) * 100)}%`,
                  borderRadius: '2px 2px 0 0',
                  opacity: 0.85,
                }}
              />
            ))}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>
            Block arrival times (green &lt;1s · deterministic finality)
          </div>
        </div>
      )}
    </div>
  )
}
