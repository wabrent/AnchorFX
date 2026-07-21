const PLANS = [
  {
    name: 'Starter', price: '$0', unit: '/ mo',
    desc: 'For individuals and hobbyists exploring onchain payments',
    features: [
      { text: 'Up to 5 active subs', active: true },
      { text: 'USDC only', active: true },
      { text: 'Basic dashboard', active: true },
      { text: 'Custom intervals', active: false },
      { text: 'Webhook callbacks', active: false },
      { text: 'Multi-token', active: false },
    ],
  },
  {
    name: 'Growth', price: '$49', unit: '/ mo in USDC', featured: true,
    desc: 'For startups building subscription products on Arc',
    features: [
      { text: 'Unlimited subs', active: true },
      { text: 'USDC + EURC', active: true },
      { text: 'Advanced dashboard', active: true },
      { text: 'Custom intervals', active: true },
      { text: 'Webhook callbacks', active: true },
      { text: 'Multi-token', active: false },
    ],
  },
  {
    name: 'Enterprise', price: 'Custom', unit: '',
    desc: 'For financial institutions and high-volume platforms',
    features: [
      { text: 'Unlimited subs', active: true },
      { text: 'USDC + EURC', active: true },
      { text: 'White-label UI', active: true },
      { text: 'Custom intervals', active: true },
      { text: 'Webhook callbacks', active: true },
      { text: 'Multi-token + FX', active: true },
    ],
  },
]

export function Subscriptions({ wallet, onOpenModal }) {
  function handlePlan(plan) {
    if (!wallet.isConnected) { onOpenModal(); return }
    alert(`"${plan}" plan: subscription contracts aren't deployed yet — this is a UI preview.`)
  }

  return (
    <div className="section" id="subscriptions">
      <div className="section-tag">Subscriptions</div>
      <div className="section-title">Recurring payments, on-chain</div>
      <div className="section-sub">Smart contract–enforced subscriptions in USDC. No banks, no chargebacks, no delays.</div>
      <div className="sub-grid">
        {PLANS.map(plan => (
          <div className={`sub-card ${plan.featured ? 'featured' : ''}`} key={plan.name}>
            <div className="sub-header">
              <span style={{ fontSize: 14, fontWeight: 500 }}>{plan.name}</span>
              {plan.featured && <span className="sub-badge">Most popular</span>}
            </div>
            <div className="sub-price">{plan.price} <span>{plan.unit}</span></div>
            <div className="sub-desc">{plan.desc}</div>
            <ul className="sub-features">
              {plan.features.map(f => (
                <li className={f.active ? 'active' : ''} key={f.text}>{f.text}</li>
              ))}
            </ul>
            <button className="plan-btn" onClick={() => handlePlan(plan.name)}>
              {plan.name === 'Enterprise' ? 'Contact sales' : plan.price === '$0' ? 'Get started free' : 'Subscribe now'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
