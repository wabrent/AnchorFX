import { useState, useRef, useEffect } from 'react'

const TOKEN_META = {
  USDC: { name: 'USD Coin', color: '#2775CA', dot: 'radial-gradient(circle at 35% 30%, #6aa8ff, #2775CA)' },
  EURC: { name: 'Euro Coin', color: '#3A5BA0', dot: 'radial-gradient(circle at 35% 30%, #7b96d8, #3A5BA0)' },
  USYC: { name: 'US Yield Coin', color: '#d4a017', dot: 'radial-gradient(circle at 35% 30%, #ffd76a, #d4a017)' },
}

export default function TokenSelect({ value, onChange, tokens, disabled }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const list = tokens || Object.keys(TOKEN_META)
  const meta = TOKEN_META[value] || {}

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          background: 'var(--s2)',
          border: '0.5px solid var(--border2)',
          color: 'var(--text)',
          borderRadius: 10,
          padding: '8px 10px',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          minWidth: 86,
          justifyContent: 'space-between',
          transition: 'border-color .15s',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: meta.dot || '#888',
              display: 'inline-block',
              boxShadow: 'inset 0 -1px 2px rgba(0,0,0,0.3)',
            }}
          />
          {value}
        </span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform .2s',
            opacity: 0.6,
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            zIndex: 50,
            minWidth: 200,
            background: '#121318',
            border: '0.5px solid rgba(255,255,255,0.12)',
            borderRadius: 12,
            padding: 6,
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {list.map(sym => {
            const m = TOKEN_META[sym] || {}
            const selected = sym === value
            return (
              <button
                key={sym}
                type="button"
                onClick={() => {
                  onChange(sym)
                  setOpen(false)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  width: '100%',
                  textAlign: 'left',
                  background: selected ? 'rgba(255,255,255,0.08)' : 'transparent',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 10px',
                  color: 'var(--text)',
                  cursor: 'pointer',
                  transition: 'background .12s',
                }}
                onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent' }}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: m.dot || '#888',
                    boxShadow: 'inset 0 -1px 2px rgba(0,0,0,0.3)',
                    flexShrink: 0,
                  }}
                />
                <span style={{ flex: 1 }}>
                  <span style={{ display: 'block', fontSize: 13, fontWeight: 600, fontFamily: 'DM Mono, monospace' }}>{sym}</span>
                  <span style={{ display: 'block', fontSize: 10, color: 'var(--text3)' }}>{m.name}</span>
                </span>
                {selected && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00e5a0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
