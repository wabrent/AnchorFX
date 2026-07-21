export function Hero() {
  return (
    <>
      <div className="ticker">
        <div className="tick-item"><span className="tick-pair">USDC/EURC</span><span className="tick-price">0.9247</span><span className="tick-change up">+0.12%</span></div>
        <div className="tick-item"><span className="tick-pair">EURC/USDC</span><span className="tick-price">1.0814</span><span className="tick-change up">+0.08%</span></div>
        <div className="tick-item"><span className="tick-pair">Settlement</span><span className="tick-price">&lt;0.4s</span><span className="tick-change up">live</span></div>
        <div className="tick-item"><span className="tick-pair">Gas fee</span><span className="tick-price">~$0.01</span><span className="tick-change up">USDC</span></div>
      </div>

      <div className="hero">
        <div className="hero-badge"><div className="dot" /> Built on Arc Network · Testnet</div>
        <h1>Instant stablecoin <em>FX</em> for the onchain economy</h1>
        <p className="hero-sub">
          Swap USDC ↔ EURC at transparent rates with deterministic sub-second settlement.
          No slippage surprises. No hidden fees.
        </p>
        <div className="hero-actions">
          <a href="#exchange" className="btn-primary">Start swapping</a>
          <a href="#analytics" className="btn-ghost">View live rates</a>
        </div>
        <div className="stats">
          <div className="stat"><div className="stat-num" style={{ color: 'var(--accent)' }}>$2.4B</div><div className="stat-label">Volume (30d)</div></div>
          <div className="stat"><div className="stat-num">0.38s</div><div className="stat-label">Avg settlement</div></div>
          <div className="stat"><div className="stat-num">$0.01</div><div className="stat-label">Flat fee / tx</div></div>
          <div className="stat"><div className="stat-num">99.99%</div><div className="stat-label">Uptime</div></div>
        </div>
        <p className="demo-note">Volume, settlement time and uptime above are illustrative demo figures.</p>
      </div>
    </>
  )
}
