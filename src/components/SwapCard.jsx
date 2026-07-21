import { useState } from 'react'

const RATE = 0.9247 // demo rate — not a live price feed

export function SwapCard({ wallet, onOpenModal }) {
  const { isConnected, isWrongNetwork, usdcBalance, eurcBalance } = wallet
  const [flipped, setFlipped] = useState(false)
  const [amtIn, setAmtIn] = useState(1000)
  const [execState, setExecState] = useState('idle') // idle | pending | done

  const rate = flipped ? 1 / RATE : RATE
  const amtOut = (amtIn * rate) || 0

  const payToken = flipped ? 'EURC' : 'USDC'
  const receiveToken = flipped ? 'USDC' : 'EURC'

  const usdcBalDisplay = usdcBalance ? parseFloat(usdcBalance.formatted).toFixed(2) : '—'
  const eurcBalDisplay = eurcBalance ? parseFloat(eurcBalance.formatted).toFixed(2) : '—'
  const payBalance = payToken === 'USDC' ? usdcBalDisplay : eurcBalDisplay

  function flip() {
    setFlipped(f => !f)
    setAmtIn(1000)
  }

  function executeSwap() {
    if (!isConnected) { onOpenModal(); return }
    setExecState('pending')
    setTimeout(() => setExecState('done'), 1800)
    setTimeout(() => setExecState('idle'), 4000)
  }

  return (
    <div className="section" id="exchange">
      <div className="section-center-head">
        <div className="section-tag">Exchange</div>
        <div className="section-title">Swap in one click</div>
        <div className="section-sub">Rate locked at execution — no front-running, no MEV</div>
      </div>

      <div className="swap-card">
        <div className="swap-label">
          You pay <span className="bal-hint">Balance: {payBalance} {payToken}</span>
        </div>
        <div className="token-row">
          <div className={`token-icon ${payToken === 'USDC' ? 'usdc-icon' : 'eurc-icon'}`}>
            {payToken === 'USDC' ? '$' : '€'}
          </div>
          <div className="token-info">
            <div className="token-name">{payToken}</div>
            <div className="token-chain">Arc Network</div>
          </div>
          <div className="token-amount">
            <input
              className="amount-input"
              type="number"
              min="0"
              step="1"
              value={amtIn}
              onChange={e => setAmtIn(parseFloat(e.target.value) || 0)}
            />
            <div className="amount-usd">= {payToken === 'USDC' ? '$' : '€'}{amtIn.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div className="swap-divider">
          <button className="swap-arrow" onClick={flip} title="Flip direction">⇅</button>
        </div>

        <div className="swap-label">
          You receive <span className="bal-hint">Balance: {receiveToken === 'USDC' ? usdcBalDisplay : eurcBalDisplay} {receiveToken}</span>
        </div>
        <div className="token-row">
          <div className={`token-icon ${receiveToken === 'USDC' ? 'usdc-icon' : 'eurc-icon'}`}>
            {receiveToken === 'USDC' ? '$' : '€'}
          </div>
          <div className="token-info">
            <div className="token-name">{receiveToken}</div>
            <div className="token-chain">Arc Network</div>
          </div>
          <div className="token-amount">
            <input className="amount-input" type="number" readOnly value={amtOut.toFixed(2)} style={{ cursor: 'default' }} />
            <div className="amount-usd">≈ {receiveToken === 'USDC' ? '$' : '€'}{amtOut.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div className="rate-bar">
          <span>Rate <span className="demo-tag">demo</span></span>
          <span className="rate-val">1 {payToken} = {rate.toFixed(4)} {receiveToken}</span>
        </div>
        <div className="rate-bar" style={{ borderTop: 'none' }}>
          <span>Protocol fee</span><span className="rate-val">0.05% · ~${(amtIn * 0.0005).toFixed(2)}</span>
        </div>
        <div className="rate-bar" style={{ borderTop: 'none' }}>
          <span>Network fee</span><span className="rate-val">$0.01 USDC</span>
        </div>

        {!isConnected ? (
          <button className="swap-btn" onClick={onOpenModal}>Connect wallet to swap</button>
        ) : isWrongNetwork ? (
          <button className="swap-btn warn" onClick={wallet.switchChain}>Switch to Arc Testnet</button>
        ) : (
          <button
            className={`swap-btn ${execState === 'done' ? 'done' : ''} ${execState === 'pending' ? 'pending' : ''}`}
            onClick={executeSwap}
            disabled={execState !== 'idle'}
          >
            {execState === 'pending' && 'Confirm in wallet...'}
            {execState === 'done' && 'Swap executed · 0.38s (demo)'}
            {execState === 'idle' && 'Preview swap'}
          </button>
        )}
        <p className="demo-note">
          On-chain execution isn't wired up yet — this shows the flow. Real swaps need the FXSwap contract deployed on Arc Testnet.
        </p>
      </div>
    </div>
  )
}
