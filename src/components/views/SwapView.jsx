import { useState } from 'react'
import { useAccount, useWriteContract, useBalance } from 'wagmi'
import { parseUnits } from 'viem'
import { ANCHOR_FX_ROUTER_ADDRESS, ANCHOR_FX_ROUTER_ABI } from '../../config'
import { useAppState } from '../../context/useAppState'

const TOKEN_IN = '0x0000000000000000000000000000000000000001'
const TOKEN_OUT = '0x0000000000000000000000000000000000000002'

export default function SwapView() {
  const { address } = useAccount()
  const { notify } = useAppState()
  const [amountIn, setAmountIn] = useState('')
  const [rate] = useState('0.9247')

  const { data: balanceData } = useBalance({ address })
  const { writeContract, isPending, isSuccess, error } = useWriteContract()

  function handleSwap() {
    if (!amountIn) return
    const parsedAmount = parseUnits(amountIn, 18)
    const parsedRate = parseUnits(rate, 18)
    const minOut = (parsedAmount * parsedRate) / BigInt(1e18)

    writeContract({
      address: ANCHOR_FX_ROUTER_ADDRESS,
      abi: ANCHOR_FX_ROUTER_ABI,
      functionName: 'swapFX',
      args: [TOKEN_IN, TOKEN_OUT, parsedAmount, minOut, parsedRate],
    })

    notify('Swap Submitted', `Swapping ${amountIn} USDC`, 'info')
  }

  return (
    <div className="view-section swap-view-centered">
      <div className="view-head">
        <h2>Swap</h2>
        <span className="view-sub">Instant stablecoin exchange on Arc Network</span>
      </div>

      <div className="anchor-card">
        <div className="anchor-card-header">
          <span className="anchor-card-label">Exchange</span>
          <span className="anchor-settlement">● Settlement &lt;0.4s</span>
        </div>

        <div className="anchor-swap-form">
          <div className="anchor-input-box">
            <div className="anchor-input-row">
              <span className="anchor-input-label">You Pay</span>
              <span className="anchor-balance">
                Balance: {balanceData ? parseFloat(balanceData.formatted).toFixed(2) : '0.00'} ARC
              </span>
            </div>
            <input
              className="anchor-input"
              type="number"
              placeholder="0.0"
              value={amountIn}
              onChange={e => setAmountIn(e.target.value)}
            />
            <span className="anchor-input-hint">USDC (Arc Network)</span>
          </div>

          <div className="anchor-rate">1 USDC = {rate} EURC</div>

          <button
            className="anchor-swap-btn"
            onClick={handleSwap}
            disabled={!address || isPending || !amountIn}
          >
            {isPending ? 'Executing Transaction on Arc...' : 'Execute On-Chain FX Swap'}
          </button>

          {isSuccess && (
            <p className="anchor-msg success">✓ Confirmed on Arc scan!</p>
          )}
          {error && (
            <p className="anchor-msg error">{error.message.slice(0, 80)}...</p>
          )}
        </div>
      </div>
    </div>
  )
}
