const FEATURES = [
  { icon: '⚡', bg: 'rgba(0,229,160,0.1)', title: 'Deterministic finality', desc: 'Transactions settle in under 400ms. No reorgs, no uncertainty. Your rate is your rate.' },
  { icon: '$', bg: 'rgba(107,139,255,0.1)', title: 'Stable gas in USDC', desc: 'No native token needed. Fees are always ~$0.01 regardless of market conditions.' },
  { icon: '⛓', bg: 'rgba(0,229,160,0.1)', title: 'EVM compatible', desc: 'Integrate with Hardhat, Viem, ethers.js. Works with your existing Ethereum stack.' },
  { icon: '⊕', bg: 'rgba(255,160,60,0.1)', title: 'Opt-in privacy', desc: 'Confidential transfers for regulated flows with selective disclosure to counterparties.' },
  { icon: '⬡', bg: 'rgba(107,139,255,0.1)', title: 'Agent-ready API', desc: 'MCP server support — let AI agents initiate and settle FX transactions autonomously.' },
  { icon: '↻', bg: 'rgba(0,229,160,0.1)', title: 'Crosschain bridging', desc: 'Bridge USDC from Ethereum, Solana, and 12+ chains in one transaction via CCTP.' },
]

const CHAINS = ['Ethereum', 'Solana', 'Base', 'Polygon', 'Arbitrum', 'Arc Network']

export function Features() {
  return (
    <div className="section">
      <div className="section-tag">Features</div>
      <div className="section-title">Why ArcFX</div>
      <div className="section-sub">Designed for businesses, traders, and AI agents</div>
      <div className="features-grid">
        {FEATURES.map(f => (
          <div className="feature" key={f.title}>
            <div className="feature-icon" style={{ background: f.bg }}>{f.icon}</div>
            <div className="feature-title">{f.title}</div>
            <div className="feature-desc">{f.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: '0.8rem' }}>Compatible networks</div>
        <div>
          {CHAINS.map(c => (
            <span className="chain-badge" key={c}><span className="chain-dot" />{c}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
