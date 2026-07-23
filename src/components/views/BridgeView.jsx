import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useBalance, useReadContract } from 'wagmi'
import { parseUnits, maxUint256 } from 'viem'
import { useAppState } from '../../context/useAppState'
import { USDC_ADDRESS } from '../../config'

const CHAINS = [
  { id: 5042002, name: 'Arc Testnet', symbol: 'USDC', icon: '🔗', color: '#00e5a0' },
  { id: 11155111, name: 'Sepolia Testnet', symbol: 'USDC', icon: '⟠', color: '#627eea' },
]

const USDC_ABI = [
  { type: 'function', name: 'approve', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'allowance', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'transfer', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'nonpayable' },
]

const USDC_ADDRESSES = {
  5042002: USDC_ADDRESS,
  11155111: '0x1c7D4B196Cb0C7B01d0656B2Be1d9Bf4Bb6eF0fC',
}

const BRIDGE_ADDRESSES = {
  5042002: '0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8',
  11155111: '0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8',
}

const USDC_DECIMALS = 6

export default function BridgeView() {
  const { address } = useAccount()
  const { notify } = useAppState()
  const [amount, setAmount] = useState('')
  const [fromChain, setFromChain] = useState(CHAINS[0])
  const [toChain, setToChain] = useState(CHAINS[1])
  const [bridgeHistory, setBridgeHistory] = useState([])
  const [approved, setApproved] = useState(false)

  const { data: balanceData } = useBalance({
    address,
    token: USDC_ADDRESSES[fromChain.id],
    chainId: fromChain.id,
  })

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESSES[fromChain.id],
    abi: USDC_ABI,
    functionName: 'allowance',
    args: address ? [address, BRIDGE_ADDRESSES[fromChain.id]] : undefined,
    query: { enabled: !!address },
  })

  const { writeContract, isPending, isSuccess, error } = useWriteContract()

  const parsedAmount = amount ? parseUnits(amount, USDC_DECIMALS) : 0n
  const needsApprove = !approved && allowance !== undefined && parsedAmount > 0n && allowance < parsedAmount

  useEffect(() => {
    const saved = localStorage.getItem('anchorfx_bridges')
    if (saved) setBridgeHistory(JSON.parse(saved))
  }, [])

  useEffect(() => {
    if (isSuccess) {
      refetchAllowance()
      const record = {
        time: new Date().toLocaleString(),
        amount: amount,
        from: fromChain.name,
        to: toChain.name,
        status: 'Submitted',
        type: 'CCTP Bridge',
      }
      const updated = [record, ...bridgeHistory]
      setBridgeHistory(updated)
      localStorage.setItem('anchorfx_bridges', JSON.stringify(updated))
      setAmount('')
      setApproved(false)
    }
  }, [isSuccess])

  function handleApprove() {
    if (!amount || !address) return
    writeContract({
      address: USDC_ADDRESSES[fromChain.id],
      abi: USDC_ABI,
      functionName: 'approve',
      args: [BRIDGE_ADDRESSES[fromChain.id], maxUint256],
    })
    setApproved(true)
    notify('Approve Submitted', `Approving USDC on ${fromChain.name}...`, 'info')
  }

  function handleBridge() {
    if (!amount || !address) return
    writeContract({
      address: USDC_ADDRESSES[fromChain.id],
      abi: USDC_ABI,
      functionName: 'transfer',
      args: [BRIDGE_ADDRESSES[fromChain.id], parsedAmount],
    })
    notify('Bridge Submitted', `Bridging ${amount} USDC from ${fromChain.name} to ${toChain.name}`, 'info')
  }

  function swapChains() {
    const temp = fromChain
    setFromChain(toChain)
    setToChain(temp)
    setAmount('')
    setApproved(false)
  }

  const balance = balanceData ? parseFloat(balanceData.formatted) : 0

  return (
    <div className="view-section bridge-view">
      <div className="view-head">
        <h2>Bridge</h2>
        <span className="view-sub">Cross-chain USDC transfers between testnets</span>
      </div>

      <div className="anchor-card bridge-card">
        <div className="anchor-card-header">
          <span className="anchor-card-label">Bridge</span>
          <span className="anchor-settlement">● Testnet only</span>
        </div>

        <div className="bridge-form">
          <div className="bridge-chain-row">
            <div className="bridge-chain-select">
              <label>From</label>
              <div className="bridge-chain-current" style={{ borderColor: fromChain.color + '40' }}>
                <span>{fromChain.icon}</span>
                <span>{fromChain.name}</span>
              </div>
            </div>

            <button className="bridge-swap-btn" onClick={swapChains}>⇄</button>

            <div className="bridge-chain-select">
              <label>To</label>
              <div className="bridge-chain-current" style={{ borderColor: toChain.color + '40' }}>
                <span>{toChain.icon}</span>
                <span>{toChain.name}</span>
              </div>
            </div>
          </div>

          <div className="bridge-amount-box">
            <div className="anchor-input-row">
              <span className="anchor-input-label">Amount</span>
              <span className="anchor-balance">
                Balance: {balance.toFixed(2)} USDC
              </span>
            </div>
            <input
              className="anchor-input"
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
            <span className="anchor-input-hint">USDC</span>
          </div>

          <div className="bridge-fee-row">
            <span>Estimated Fee</span>
            <span className="bridge-fee-val">~0.001 USDC</span>
          </div>

          <div className="bridge-arrival">
            <span>Arrives on {toChain.name}</span>
            <span className="bridge-arrival-amt">{amount || '0'} USDC</span>
          </div>

          {needsApprove ? (
            <button className="anchor-swap-btn" onClick={handleApprove} disabled={!address || isPending}>
              {isPending ? 'Approving...' : `Approve USDC on ${fromChain.name}`}
            </button>
          ) : (
            <button className="anchor-swap-btn" onClick={handleBridge} disabled={!address || isPending || !amount}>
              {isPending ? 'Bridging...' : 'Bridge USDC'}
            </button>
          )}

          {isSuccess && (
            <p className="anchor-msg success">Bridge transaction submitted!</p>
          )}
          {error && (
            <p className="anchor-msg error">{error.shortMessage || error.message?.slice(0, 100)}</p>
          )}
        </div>
      </div>

      {bridgeHistory.length > 0 && (
        <div className="bridge-history">
          <h3>Bridge History</h3>
          <div className="bridge-history-list">
            {bridgeHistory.map((h, i) => (
              <div key={i} className="bridge-history-item">
                <span className="bridge-hist-time">{h.time}</span>
                <span className="bridge-hist-route">{h.from} → {h.to}</span>
                <span className="bridge-hist-amount">{h.amount} USDC</span>
                <span className={`bridge-hist-status ${h.status.toLowerCase()}`}>{h.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
