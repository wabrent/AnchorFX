import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useBalance, useReadContract } from 'wagmi'
import { parseUnits } from 'viem'
import { ANCHOR_FX_ROUTER_ADDRESS, ANCHOR_FX_ROUTER_ABI, USDC_ADDRESS, EURC_ADDRESS } from '../../config'
import { useAppState } from '../../context/useAppState'

const ERC20_ABI = [
  { type: 'function', name: 'approve', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'allowance', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
]

export default function SwapView() {
  const { address } = useAccount()
  const { notify } = useAppState()
  const [amountIn, setAmountIn] = useState('')
  const [rate] = useState('0.9247')

  const { data: balanceData } = useBalance({ address })
  const { data: writeResult, writeContract, isPending, isSuccess, error } = useWriteContract()
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, ANCHOR_FX_ROUTER_ADDRESS] : undefined,
    query: { enabled: !!address },
  })

  const parsedAmount = amountIn ? parseUnits(amountIn, 6) : 0n
  const needsApprove = allowance !== undefined && parsedAmount > 0n && allowance < parsedAmount

  useEffect(() => {
    if (isSuccess) refetchAllowance()
  }, [isSuccess, refetchAllowance])

  function handleApprove() {
    if (!amountIn || !address) return
    writeContract({
      address: USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [ANCHOR_FX_ROUTER_ADDRESS, parseUnits(amountIn, 6)],
    })
    notify('Approve Submitted', 'Approving USDC spend...', 'info')
  }

  function handleSwap() {
    if (!amountIn) return
    const parsedRate = parseUnits(rate, 18)
    const minOut = (parsedAmount * parsedRate) / BigInt(1e18)

    writeContract({
      address: ANCHOR_FX_ROUTER_ADDRESS,
      abi: ANCHOR_FX_ROUTER_ABI,
      functionName: 'swapFX',
      args: [USDC_ADDRESS, EURC_ADDRESS, parsedAmount, minOut, parsedRate],
    })

    notify('Swap Submitted', `Swapping ${amountIn} USDC for EURC`, 'info')
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
                Balance: {balanceData ? parseFloat(balanceData.formatted).toFixed(2) : '0.00'} USDC
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

          {needsApprove ? (
            <button className="anchor-swap-btn" onClick={handleApprove} disabled={!address || isPending}>
              {isPending ? 'Approving...' : 'Approve USDC'}
            </button>
          ) : (
            <button className="anchor-swap-btn" onClick={handleSwap} disabled={!address || isPending || !amountIn}>
              {isPending ? 'Executing Transaction on Arc...' : 'Execute On-Chain FX Swap'}
            </button>
          )}

          {isSuccess && (
            <p className="anchor-msg success">✓ Confirmed on Arc scan!</p>
          )}
          {error && (
            <p className="anchor-msg error">{error.message.slice(0, 100)}...</p>
          )}
        </div>
      </div>
    </div>
  )
}
