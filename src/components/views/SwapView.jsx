import { useState, useEffect, useRef, useMemo } from 'react'
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import { useUsdcBalance } from '../../hooks/useUsdcBalance'
import { useEurcBalance } from '../../hooks/useEurcBalance'
import { parseUnits, maxUint256, formatUnits, parseGwei } from 'viem'
import { ANCHOR_FX_ROUTER_ADDRESS, ANCHOR_FX_ROUTER_ABI, USDC_ADDRESS, EURC_ADDRESS } from '../../config'
import { ERC20_ABI } from '../../abis'
import { useAppState } from '../../context/useAppState'

const SLIPPAGE_OPTIONS = [0.1, 0.5, 1, 3]
const DEADLINE_MINUTES = 30

async function fetchRate(direction) {
  if (direction === 'usdc2eurc') {
    return fetch('https://api.binance.com/api/v3/ticker/price?symbol=EURUSDT')
      .then(r => r.json())
      .then(d => (1 / parseFloat(d.price)).toFixed(6))
      .catch(() => '0.924700')
  }
  return fetch('https://api.binance.com/api/v3/ticker/price?symbol=EURUSDT')
    .then(r => r.json())
    .then(d => parseFloat(d.price).toFixed(6))
    .catch(() => '1.081400')
}

export default function SwapView() {
  const { address } = useAccount()
  const { notify } = useAppState()
  const [amountIn, setAmountIn] = useState('')
  const [direction, setDirection] = useState('usdc2eurc')
  const [rate, setRate] = useState('0.924700')
  const [slippage, setSlippage] = useState(0.5)
  const [approveConfirmed, setApproveConfirmed] = useState(false)
  const actionRef = useRef(null)

  const { balance: usdcBalance } = useUsdcBalance()
  const { balance: eurcBalance } = useEurcBalance()

  const tokenIn = direction === 'usdc2eurc' ? USDC_ADDRESS : EURC_ADDRESS
  const tokenOut = direction === 'usdc2eurc' ? EURC_ADDRESS : USDC_ADDRESS
  const inSymbol = direction === 'usdc2eurc' ? 'USDC' : 'EURC'
  const outSymbol = direction === 'usdc2eurc' ? 'EURC' : 'USDC'
  const inDecimals = 6
  const outDecimals = 6
  const balanceIn = direction === 'usdc2eurc' ? usdcBalance : eurcBalance
  const balanceOut = direction === 'usdc2eurc' ? eurcBalance : usdcBalance

  useEffect(() => {
    fetchRate(direction).then(setRate)
    const interval = setInterval(() => {
      fetchRate(direction).then(r => {
        setRate(prev => r !== prev ? r : prev)
      })
    }, 15000)
    return () => clearInterval(interval)
  }, [direction])

  const { data: writeResult, writeContract, isPending, isSuccess, error } = useWriteContract()
  const { data: receipt } = useWaitForTransactionReceipt({ hash: writeResult })
  const { data: allowance } = useReadContract({
    address: tokenIn,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, ANCHOR_FX_ROUTER_ADDRESS] : undefined,
    query: { enabled: !!address },
  })

  const parsedAmount = amountIn ? parseUnits(amountIn, inDecimals) : 0n
  const amountTooBig = parsedAmount > 0n && parseFloat(amountIn) > balanceIn
  const allowanceOk = allowance !== undefined && parsedAmount > 0n && allowance >= parsedAmount
  const needsApprove = !approveConfirmed && !allowanceOk

  const amountOut = useMemo(() => {
    if (!amountIn) return '0'
    const out = parseFloat(amountIn) * parseFloat(rate)
    const fee = out * 0.0005
    return (out - fee).toFixed(outDecimals === 6 ? 2 : 6)
  }, [amountIn, rate, outDecimals])

  const protocolFee = useMemo(() => {
    if (!amountIn) return '0'
    return (parseFloat(amountIn) * 0.0005).toFixed(inDecimals === 6 ? 2 : 6)
  }, [amountIn, inDecimals])

  const minOutParsed = useMemo(() => {
    if (!amountIn || !rate) return 0n
    const raw = parseFloat(amountIn) * parseFloat(rate)
    const fee = raw * 0.0005
    const afterSlippage = (raw - fee) * (1 - slippage / 100)
    return parseUnits(afterSlippage.toFixed(outDecimals), outDecimals)
  }, [amountIn, rate, slippage, outDecimals])

  useEffect(() => {
    if (!receipt) return
    if (actionRef.current === 'approve') {
      if (receipt.status === 'success') {
        setApproveConfirmed(true)
        notify('Approval Confirmed', `${inSymbol} approved for AnchorFX Router`, 'success')
      } else {
        notify('Approval Failed', 'Transaction reverted on-chain', 'error')
      }
    }
    if (actionRef.current === 'swap') {
      if (receipt.status === 'success') {
        const trade = {
          time: new Date().toLocaleString(),
          type: `${inSymbol} → ${outSymbol}`,
          amount: amountIn,
          rate,
          status: 'Confirmed',
          hash: receipt.transactionHash,
        }
        const existing = JSON.parse(localStorage.getItem('anchorfx_trades') || '[]')
        existing.unshift(trade)
        localStorage.setItem('anchorfx_trades', JSON.stringify(existing))
        setAmountIn('')
        notify('Swap Confirmed', `Swapped ${amountIn} ${inSymbol} → ${amountOut} ${outSymbol}`, 'success')
      } else {
        notify('Swap Failed', 'Transaction reverted on-chain. Check balance and try again.', 'error')
      }
    }
    actionRef.current = null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receipt])

  function handleApprove() {
    if (!amountIn || !address) return
    actionRef.current = 'approve'
      writeContract({
        address: tokenIn,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [ANCHOR_FX_ROUTER_ADDRESS, maxUint256],
        gas: 200000n,
        maxFeePerGas: parseGwei('20'),
        maxPriorityFeePerGas: parseGwei('1'),
      })
    notify('Approve Submitted', `Approving ${inSymbol} spend...`, 'info')
  }

  function handleSwap() {
    if (!amountIn) return
    actionRef.current = 'swap'
    const parsedRate = parseUnits(rate, 18)

      writeContract({
        address: ANCHOR_FX_ROUTER_ADDRESS,
        abi: ANCHOR_FX_ROUTER_ABI,
        functionName: 'swapFX',
        args: [tokenIn, tokenOut, parsedAmount, minOutParsed, parsedRate],
        gas: 300000n,
        maxFeePerGas: parseGwei('20'),
        maxPriorityFeePerGas: parseGwei('1'),
      })

    notify('Swap Submitted', `${amountIn} ${inSymbol} → ~${amountOut} ${outSymbol}`, 'info')
  }

  function flipDirection() {
    setDirection(prev => prev === 'usdc2eurc' ? 'eurc2usdc' : 'usdc2eurc')
    setAmountIn('')
    setApproveConfirmed(false)
  }

  if (!address) {
    return (
      <div className="view-section swap-view-centered">
        <div className="view-head">
          <h2>Swap</h2>
          <span className="view-sub">Instant stablecoin exchange on Arc Network</span>
        </div>
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text3)' }}>
          <p style={{ fontSize: 15 }}>Connect your wallet to start swapping</p>
        </div>
      </div>
    )
  }

  return (
    <div className="view-section swap-view-centered">
      <div className="view-head">
        <h2>Swap</h2>
        <span className="view-sub">USDC ↔ EURC • 0.05% fee • &lt;0.4s settlement</span>
      </div>

      <div className="anchor-card">
        <div className="anchor-card-header">
          <span className="anchor-card-label">Exchange</span>
          <span className="anchor-settlement" style={{ color: 'var(--green)' }}>● Live Rate</span>
        </div>

        <div className="anchor-swap-form">
          <div className="anchor-input-box">
            <div className="anchor-input-row">
              <span className="anchor-input-label">You Pay</span>
              <span className="anchor-balance">
                Balance: {balanceIn.toFixed(inDecimals === 6 ? 2 : 6)} {inSymbol}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                className="anchor-input"
                type="number"
                placeholder="0.0"
                value={amountIn}
                onChange={e => setAmountIn(e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                onClick={() => setAmountIn(balanceIn > 0 ? balanceIn.toFixed(inDecimals === 6 ? 2 : 6) : '')}
                style={{
                  background: 'var(--s2)',
                  border: '0.5px solid var(--border)',
                  color: 'var(--accent)',
                  borderRadius: 8,
                  padding: '0 12px',
                  cursor: 'pointer',
                  fontSize: 12,
                  whiteSpace: 'nowrap',
                }}
              >MAX</button>
            </div>
            <span className="anchor-input-hint">{inSymbol} (Arc Network)</span>
          </div>

          <button
            onClick={flipDirection}
            style={{
              display: 'block',
              margin: '0.25rem auto',
              background: 'var(--s2)',
              border: '0.5px solid var(--border)',
              color: 'var(--text2)',
              borderRadius: '50%',
              width: 36,
              height: 36,
              fontSize: 16,
              cursor: 'pointer',
              lineHeight: '36px',
              textAlign: 'center',
            }}
          >↓↑</button>

          <div className="anchor-input-box" style={{ opacity: 0.9 }}>
            <div className="anchor-input-row">
              <span className="anchor-input-label">You Receive</span>
              <span className="anchor-balance">
                Balance: {balanceOut.toFixed(outDecimals === 6 ? 2 : 6)} {outSymbol}
              </span>
            </div>
            <input
              className="anchor-input"
              type="text"
              readOnly
              value={amountOut}
              style={{ background: 'var(--s1)' }}
            />
            <span className="anchor-input-hint">{outSymbol} (estimated)</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
            <span style={{ fontSize: 12, color: 'var(--text2)' }}>Rate</span>
            <span style={{ fontSize: 12, fontFamily: 'DM Mono, monospace', color: 'var(--text)' }}>
              1 {inSymbol} = {rate} {outSymbol}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
            <span style={{ fontSize: 12, color: 'var(--text2)' }}>Fee</span>
            <span style={{ fontSize: 12, fontFamily: 'DM Mono, monospace', color: 'var(--text2)' }}>
              {protocolFee} {inSymbol} (0.05%)
            </span>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: 12, color: 'var(--text2)' }}>Slippage Tolerance</span>
              <span style={{ fontSize: 12, fontFamily: 'DM Mono, monospace', color: 'var(--accent)' }}>{slippage}%</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {SLIPPAGE_OPTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => setSlippage(s)}
                  style={{
                    flex: 1,
                    padding: '4px 0',
                    borderRadius: 6,
                    fontSize: 12,
                    cursor: 'pointer',
                    background: slippage === s ? 'var(--accent)' : 'var(--s2)',
                    color: slippage === s ? 'var(--bg)' : 'var(--text2)',
                    border: slippage === s ? 'none' : '0.5px solid var(--border)',
                    fontWeight: slippage === s ? 600 : 400,
                  }}
                >{s}%</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>Min received</span>
            <span style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', color: 'var(--text3)' }}>
              {minOutParsed > 0n ? formatUnits(minOutParsed, outDecimals) : '0'} {outSymbol}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>Deadline</span>
            <span style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', color: 'var(--text3)' }}>{DEADLINE_MINUTES}m</span>
          </div>

          {amountTooBig ? (
            <button className="anchor-swap-btn" disabled style={{ background: 'var(--s3)', color: 'var(--red)', cursor: 'not-allowed' }}>
              Insufficient {inSymbol} Balance
            </button>
          ) : needsApprove ? (
            <button className="anchor-swap-btn" onClick={handleApprove} disabled={isPending}>
              {isPending ? 'Approving...' : `Approve ${inSymbol}`}
            </button>
          ) : (
            <button className="anchor-swap-btn" onClick={handleSwap} disabled={isPending || !amountIn}>
              {isPending ? 'Executing...' : `Swap ${inSymbol} → ${outSymbol}`}
            </button>
          )}

          {isSuccess && actionRef.current === null && (
            <p className="anchor-msg success">Transaction confirmed on Arc!</p>
          )}
          {error && (
            <p className="anchor-msg error">{error.shortMessage || error.message}</p>
          )}
        </div>
      </div>
    </div>
  )
}
