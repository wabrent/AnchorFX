import { useState, useEffect, useRef } from 'react'
import { useAccount, useWriteContract, useBalance, useReadContract } from 'wagmi'
import { parseUnits, maxUint256 } from 'viem'
import { ANCHOR_FX_ROUTER_ADDRESS, ANCHOR_FX_ROUTER_ABI, USDC_ADDRESS, EURC_ADDRESS } from '../../config'
import { useAppState } from '../../context/useAppState'

const ORDER_TYPES = [
  { id: 'market', label: 'Market', desc: 'Execute immediately at best price' },
  { id: 'limit', label: 'Limit', desc: 'Execute at specific price' },
  { id: 'stopLoss', label: 'Stop Loss', desc: 'Sell when price drops to level' },
  { id: 'takeProfit', label: 'Take Profit', desc: 'Sell when price rises to level' },
]

const ERC20_ABI = [
  { type: 'function', name: 'approve', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'allowance', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
]

export default function OrdersView() {
  const { address } = useAccount()
  const { notify } = useAppState()
  const [orderType, setOrderType] = useState('market')
  const [side, setSide] = useState('buy')
  const [amount, setAmount] = useState('')
  const [limitPrice, setLimitPrice] = useState('')
  const [stopPrice, setStopPrice] = useState('')
  const [orders, setOrders] = useState([])
  const [approveConfirmed, setApproveConfirmed] = useState(false)
  const actionRef = useRef(null)

  const { data: balanceData } = useBalance({ address, chainId: 5042002 })
  const { writeContract, isPending, isSuccess, error } = useWriteContract()
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, ANCHOR_FX_ROUTER_ADDRESS] : undefined,
    query: { enabled: !!address },
  })

  const parsedAmount = amount ? parseUnits(amount, 6) : 0n
  const allowanceOk = allowance !== undefined && parsedAmount > 0n && allowance >= parsedAmount
  const needsApprove = side === 'sell' && !approveConfirmed && !allowanceOk

  useEffect(() => {
    const saved = localStorage.getItem('anchorfx_orders')
    if (saved) setOrders(JSON.parse(saved))
  }, [])

  useEffect(() => {
    if (isSuccess) {
      if (actionRef.current === 'approve') {
        refetchAllowance()
        setApproveConfirmed(true)
        notify('Approval Confirmed', 'USDC approved for AnchorFX Router', 'success')
      }
      if (actionRef.current === 'order') {
        refetchAllowance()
        const record = {
          id: Date.now(),
          time: new Date().toLocaleString(),
          type: orderType,
          side,
          pair: 'USDC/EURC',
          amount,
          price: orderType === 'market' ? 'Market' : limitPrice || stopPrice,
          status: orderType === 'market' ? 'Filled' : 'Open',
        }
        const updated = [record, ...orders]
        setOrders(updated)
        localStorage.setItem('anchorfx_orders', JSON.stringify(updated))
        setAmount('')
        notify('Order Placed', `${side.toUpperCase()} ${amount} USDC - ${record.status}`, 'success')
      }
      actionRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess])

  function handleApprove() {
    if (!amount || !address) return
    actionRef.current = 'approve'
    writeContract({
      address: USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [ANCHOR_FX_ROUTER_ADDRESS, maxUint256],
    })
    notify('Approve Submitted', 'Confirming USDC approval...', 'info')
  }

  function handleOrder() {
    if (!amount) return
    actionRef.current = 'order'
    const parsedRate = parseUnits('0.9247', 18)
    const parsedAmt = parseUnits(amount, 6)
    const minOut = (parsedAmt * parsedRate) / BigInt(1e18)

    writeContract({
      address: ANCHOR_FX_ROUTER_ADDRESS,
      abi: ANCHOR_FX_ROUTER_ABI,
      functionName: 'swapFX',
      args: [USDC_ADDRESS, EURC_ADDRESS, parsedAmt, minOut, parsedRate],
    })
  }

  function cancelOrder(id) {
    const updated = orders.map(o => o.id === id ? { ...o, status: 'Cancelled' } : o)
    setOrders(updated)
    localStorage.setItem('anchorfx_orders', JSON.stringify(updated))
    notify('Order Cancelled', `Order cancelled`, 'info')
  }

  const openOrders = orders.filter(o => o.status === 'Open')
  const filledOrders = orders.filter(o => o.status === 'Filled')
  const balance = balanceData ? parseFloat(balanceData.formatted) : 0

  return (
    <div className="view-section orders-view">
      <div className="view-head">
        <h2>Orders</h2>
        <span className="view-sub">Advanced order types on Arc Network</span>
      </div>

      <div className="orders-grid">
        <div className="anchor-card orders-form-card">
          <div className="anchor-card-header">
            <span className="anchor-card-label">New Order</span>
          </div>

          <div className="orders-type-grid">
            {ORDER_TYPES.map(t => (
              <button
                key={t.id}
                className={`orders-type-btn ${orderType === t.id ? 'active' : ''}`}
                onClick={() => setOrderType(t.id)}
              >
                <span className="orders-type-name">{t.label}</span>
                <span className="orders-type-desc">{t.desc}</span>
              </button>
            ))}
          </div>

          <div className="orders-side-row">
            <button className={`orders-side-btn buy ${side === 'buy' ? 'active' : ''}`} onClick={() => setSide('buy')}>BUY</button>
            <button className={`orders-side-btn sell ${side === 'sell' ? 'active' : ''}`} onClick={() => setSide('sell')}>SELL</button>
          </div>

          <div className="orders-pair-display">
            <span>USDC / EURC</span>
            <span className="orders-pair-rate">1 USDC = 0.9247 EURC</span>
          </div>

          <div className="anchor-input-box">
            <div className="anchor-input-row">
              <span className="anchor-input-label">Amount</span>
              <span className="anchor-balance">Balance: {balance.toFixed(2)} USDC</span>
            </div>
            <input className="anchor-input" type="number" placeholder="0.0" value={amount} onChange={e => setAmount(e.target.value)} />
            <span className="anchor-input-hint">USDC</span>
          </div>

          {(orderType === 'limit' || orderType === 'takeProfit') && (
            <div className="anchor-input-box">
              <span className="anchor-input-label">Limit Price (EURC)</span>
              <input className="anchor-input" type="number" placeholder="0.9247" value={limitPrice} onChange={e => setLimitPrice(e.target.value)} />
            </div>
          )}

          {orderType === 'stopLoss' && (
            <div className="anchor-input-box">
              <span className="anchor-input-label">Stop Price (EURC)</span>
              <input className="anchor-input" type="number" placeholder="0.9200" value={stopPrice} onChange={e => setStopPrice(e.target.value)} />
            </div>
          )}

          <div className="orders-summary">
            <div className="orders-summary-row"><span>Order Type</span><span>{ORDER_TYPES.find(t => t.id === orderType)?.label}</span></div>
            <div className="orders-summary-row"><span>Side</span><span className={side === 'buy' ? 'green' : 'red'}>{side.toUpperCase()}</span></div>
            <div className="orders-summary-row"><span>Est. Fee</span><span>0.05%</span></div>
          </div>

          {needsApprove ? (
            <button className="anchor-swap-btn" onClick={handleApprove} disabled={!address || isPending}>
              {isPending ? 'Approving...' : 'Approve USDC'}
            </button>
          ) : (
            <button
              className="anchor-swap-btn"
              onClick={handleOrder}
              disabled={!address || isPending || !amount}
              style={{ background: side === 'buy' ? 'var(--green)' : 'var(--red)' }}
            >
              {isPending ? 'Placing Order...' : `Place ${ORDER_TYPES.find(t => t.id === orderType)?.label} Order`}
            </button>
          )}

          {isSuccess && <p className="anchor-msg success">Order submitted!</p>}
          {error && <p className="anchor-msg error">{error.shortMessage || error.message?.slice(0, 100)}</p>}
        </div>

        <div className="orders-list-card">
          <div className="orders-list-header"><h3>Open Orders ({openOrders.length})</h3></div>
          {openOrders.length === 0 ? (
            <div className="orders-empty">No open orders</div>
          ) : openOrders.map(o => (
            <div key={o.id} className="orders-list-item">
              <div className="orders-item-main">
                <span className={`orders-item-side ${o.side}`}>{o.side.toUpperCase()}</span>
                <span className="orders-item-pair">{o.pair}</span>
                <span className="orders-item-amount">{o.amount} USDC</span>
                <span className="orders-item-price">@ {o.price}</span>
              </div>
              <div className="orders-item-footer">
                <span className="orders-item-time">{o.time}</span>
                <button className="orders-cancel-btn" onClick={() => cancelOrder(o.id)}>Cancel</button>
              </div>
            </div>
          ))}

          {filledOrders.length > 0 && (
            <>
              <div className="orders-list-header" style={{ marginTop: '1rem' }}><h3>Filled ({filledOrders.length})</h3></div>
              {filledOrders.map(o => (
                <div key={o.id} className="orders-list-item filled">
                  <div className="orders-item-main">
                    <span className={`orders-item-side ${o.side}`}>{o.side.toUpperCase()}</span>
                    <span className="orders-item-pair">{o.pair}</span>
                    <span className="orders-item-amount">{o.amount} USDC</span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
