import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useBalance, useReadContract } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { useAppState } from '../../context/useAppState'

const CHAINS = [
  { id: 5042002, name: 'Arc Testnet', symbol: 'USDC', icon: '🔗', color: '#00e5a0' },
  { id: 1, name: 'Ethereum Mainnet', symbol: 'USDC', icon: '⟠', color: '#627eea' },
  { id: 137, name: 'Polygon', symbol: 'USDC', icon: '⬡', color: '#8247e5' },
  { id: 8453, name: 'Base', symbol: 'USDC', icon: '🔵', color: '#0052ff' },
]

const CCTP_ABI = [
  {
    type: 'function',
    name: 'depositForBurn',
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'destinationDomain', type: 'uint32' },
      { name: 'mintRecipient', type: 'bytes32' },
      { name: 'burnToken', type: 'address' },
    ],
    outputs: [{ name: 'nonce', type: 'uint64' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'quoteBurnFee',
    inputs: [{ name: 'destinationDomain', type: 'uint32' }],
    outputs: [{ name: 'fee', type: 'uint256' }],
    stateMutability: 'view',
  },
]

const USDC_ABI = [
  {
    type: 'function',
    name: 'approve',
    inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'allowance',
    inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
]

const CCTP_ADDRESSES = {
  5042002: '0x3600000000000000000000000000000000000000',
  1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  137: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
}

const USDC_ADDRESSES = {
  5042002: '0x3600000000000000000000000000000000000000',
  1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  137: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
}

const DOMAIN_MAP = {
  5042002: 1,
  1: 0,
  137: 7,
  8453: 8453,
}

const USDC_DECIMALS = 6

export default function BridgeView() {
  const { address } = useAccount()
  const { notify } = useAppState()
  const [amount, setAmount] = useState('')
  const [fromChain, setFromChain] = useState(CHAINS[0])
  const [toChain, setToChain] = useState(CHAINS[1])
  const [estimating, setEstimating] = useState(false)
  const [estimatedFee, setEstimatedFee] = useState(null)
  const [bridgeHistory, setBridgeHistory] = useState([])

  const { data: balanceData } = useBalance({
    address,
    token: USDC_ADDRESSES[fromChain.id],
    chainId: fromChain.id,
  })

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESSES[fromChain.id],
    abi: USDC_ABI,
    functionName: 'allowance',
    args: address ? [address, CCTP_ADDRESSES[fromChain.id]] : undefined,
    query: { enabled: !!address },
  })

  const { writeContract, isPending, isSuccess, error } = useWriteContract()

  const parsedAmount = amount ? parseUnits(amount, USDC_DECIMALS) : 0n
  const needsApprove = allowance !== undefined && parsedAmount > 0n && allowance < parsedAmount

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
    }
  }, [isSuccess])

  const estimateFee = async () => {
    setEstimating(true)
    try {
      setEstimatedFee('0.001 USDC')
    } catch {
      setEstimatedFee('0.001 USDC')
    } finally {
      setEstimating(false)
    }
  }

  useEffect(() => {
    if (amount && fromChain && toChain) estimateFee()
  }, [amount, fromChain, toChain])

  function handleApprove() {
    if (!amount || !address) return
    writeContract({
      address: USDC_ADDRESSES[fromChain.id],
      abi: USDC_ABI,
      functionName: 'approve',
      args: [CCTP_ADDRESSES[fromChain.id], parseUnits(amount, USDC_DECIMALS)],
    })
    notify('Approve Submitted', `Approving USDC on ${fromChain.name}...`, 'info')
  }

  function handleBridge() {
    if (!amount) return
    const mintRecipient = address?.padEnd(66, '0') || '0x' + '0'.repeat(64)
    writeContract({
      address: CCTP_ADDRESSES[fromChain.id],
      abi: CCTP_ABI,
      functionName: 'depositForBurn',
      args: [
        parseUnits(amount, USDC_DECIMALS),
        DOMAIN_MAP[toChain.id],
        mintRecipient,
        USDC_ADDRESSES[fromChain.id],
      ],
    })
    notify('Bridge Submitted', `Bridging ${amount} USDC from ${fromChain.name} to ${toChain.name}`, 'info')
  }

  function swapChains() {
    const temp = fromChain
    setFromChain(toChain)
    setToChain(temp)
  }

  return (
    <div className="view-section bridge-view">
      <div className="view-head">
        <h2>CCTP Bridge</h2>
        <span className="view-sub">Cross-chain USDC transfers via Circle CCTP</span>
      </div>

      <div className="anchor-card bridge-card">
        <div className="anchor-card-header">
          <span className="anchor-card-label">Bridge</span>
          <span className="anchor-settlement">● Instant settlement</span>
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
                Balance: {balanceData ? parseFloat(balanceData.formatted).toFixed(2) : '0.00'} USDC
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
            <span className="bridge-fee-val">{estimating ? '...' : estimatedFee || '--'}</span>
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
            <p className="anchor-msg error">{error.message.slice(0, 100)}...</p>
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
