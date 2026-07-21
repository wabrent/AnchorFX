import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits } from 'viem'
import { useRate } from '../hooks/useRate'
import { FXSWAP_ADDRESS, FXSWAP_ABI } from '../config'

export function SwapCard({ wallet, onOpenModal }) {
  const { isConnected, isWrongNetwork, usdcBalance, eurcBalance } = wallet
  const [flipped, setFlipped] = useState(false)
  const [amtIn, setAmtIn] = useState(1000)
  const rate = useRate()

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const displayRate = flipped ? 1 / rate : rate
  const amtOut = (amtIn * displayRate) || 0

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

    const amount = parseUnits(String(amtIn), 6)
    const functionName = payToken === 'USDC' ? 'swapUsdcToEurc' : 'swapEurcToUsdc'

    writeContract({
      address: FXSWAP_ADDRESS,
      abi: FXSWAP_ABI,
      functionName,
      args: [amount],
    })
  }

  const buttonDisabled = isPending || isConfirming
  const buttonText = isSuccess
    ? 'Swap complete!'
    : isConfirming
      ? 'Swapping...'
      : isPending
        ? 'Confirm in wallet...'
        : 'Preview swap'

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
          <span>Rate</span>
          <span className="rate-val">1 {payToken} = {displayRate.toFixed(4)} {receiveToken}</span>
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
            className={`swap-btn ${isSuccess ? 'done' : ''} ${buttonDisabled ? 'pending' : ''}`}
            onClick={executeSwap}
            disabled={buttonDisabled}
          >
            {buttonText}
          </button>
        )}

        {hash && (
          <a
            className="tx-link"
            href={`https://testnet.arcscan.app/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on explorer
          </a>
        )}
      </div>
    </div>
  )
}
