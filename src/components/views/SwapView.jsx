import { useState, useEffect, useRef } from 'react'
import { useAccount, useWriteContract, useBalance, useReadContract } from 'wagmi'
import { parseUnits, maxUint256 } from 'viem'
import { ANCHOR_FX_ROUTER_ADDRESS, ANCHOR_FX_ROUTER_ABI, USDC_ADDRESS, EURC_ADDRESS } from '../../config'
import { useAppState } from '../../context/useAppState'

const ERC20_ABI = [
  { type: 'function', name: 'approve', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'allowance', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
]

function fetchEURRate() {
  return fetch('https://api.binance.com/api/v3/ticker/price?symbol=EURUSDT')
    .then(r => r.json())
    .then(d => (1 / parseFloat(d.price)).toFixed(4))
    .catch(() => '0.9247')
}

export default function SwapView() {
  const { address } = useAccount()
  const { notify } = useAppState()
  const [amountIn, setAmountIn] = useState('')
  const [rate, setRate] = useState('0.9247')
  const [approveConfirmed, setApproveConfirmed] = useState(false)
  const actionRef = useRef(null)

  useEffect(() => {
    fetchEURRate().then(setRate)
  }, [])

  const { data: balanceData } = useBalance({ address, chainId: 5042002 })
  const { data: writeResult, writeContract, isPending, isSuccess, error } = useWriteContract()
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, ANCHOR_FX_ROUTER_ADDRESS] : undefined,
    query: { enabled: !!address },
  })

  const parsedAmount = amountIn ? parseUnits(amountIn, 6) : 0n
  const allowanceOk = allowance !== undefined && parsedAmount > 0n && allowance >= parsedAmount
  const needsApprove = !approveConfirmed && !allowanceOk

  useEffect(() => {
    if (isSuccess) {
      if (actionRef.current === 'approve') {
        refetchAllowance()
        setApproveConfirmed(true)
        notify('Approval Confirmed', 'USDC approved for AnchorFX Router', 'success')
      }
      if (actionRef.current === 'swap') {
        refetchAllowance()
        const trade = {
          time: new Date().toLocaleString(),
          type: 'USDC → EURC',
          amount: amountIn,
          status: 'Confirmed',
          hash: writeResult,
        }
        const existing = JSON.parse(localStorage.getItem('anchorfx_trades') || '[]')
        existing.unshift(trade)
        localStorage.setItem('anchorfx_trades', JSON.stringify(existing))
        setAmountIn('')
        notify('Swap Confirmed', `Swapped ${amountIn} USDC → EURC on Arc`, 'success')
      }
      actionRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess])

  function handleApprove() {
    if (!amountIn || !address) return
    actionRef.current = 'approve'
    writeContract({
      address: USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [ANCHOR_FX_ROUTER_ADDRESS, maxUint256],
    })
    notify('Approve Submitted', 'Confirming USDC approval...', 'info')
  }

  function handleSwap() {
    if (!amountIn) return
    actionRef.current = 'swap'
    const parsedRate = parseUnits(rate, 18)
    const minOut = (parsedAmount * parsedRate) / BigInt(1e18)

    writeContract({
      address: ANCHOR_FX_ROUTER_ADDRESS,
      abi: ANCHOR_FX_ROUTER_ABI,
      functionName: 'swapFX',
      args: [USDC_ADDRESS, EURC_ADDRESS, parsedAmount, minOut, parsedRate],
    })

    notify('Swap Submitted', `Swapping ${amountIn} USDC for EURC...`, 'info')
  }

  const balance = balanceData ? parseFloat(balanceData.formatted) : 0

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
                Balance: {balance.toFixed(2)} USDC
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

          {isSuccess && actionRef.current === null && (
            <p className="anchor-msg success">Confirmed on Arc scan!</p>
          )}
          {error && (
            <p className="anchor-msg error">{error.shortMessage || error.message?.slice(0, 100)}</p>
          )}
        </div>
      </div>
    </div>
  )
}
