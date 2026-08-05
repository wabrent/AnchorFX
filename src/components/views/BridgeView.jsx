import { useState, useEffect, useRef } from 'react'
import {
  useAccount,
  useChainId,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useBalance,
} from 'wagmi'
import { parseUnits, maxUint256, parseGwei } from 'viem'
import { BRIDGE_SOURCES, ARC_CCTP_DOMAIN } from '../../config'
import { ERC20_ABI, TOKEN_MESSENGER_ABI } from '../../abis'
import { useAppState } from '../../context/useAppState'

export default function BridgeView() {
  const { address } = useAccount()
  const { notify } = useAppState()
  const chainId = useChainId()
  const [sourceKey, setSourceKey] = useState('sepolia')
  const [amount, setAmount] = useState('')
  const [approved, setApproved] = useState(false)
  const [switching, setSwitching] = useState(false)
  const actionRef = useRef(null)

  const source = BRIDGE_SOURCES[sourceKey]

  useEffect(() => {
    setApproved(false)
  }, [sourceKey])

  const { data: usdcBal } = useBalance({
    address,
    chainId: source.chain.id,
    token: source.usdc,
  })

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: source.usdc,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, source.tokenMessenger] : undefined,
    chainId: source.chain.id,
    query: { enabled: !!address },
  })

  const { data: writeResult, writeContract, isPending } = useWriteContract()
  const { data: receipt } = useWaitForTransactionReceipt({ hash: writeResult })

  const parsedAmount = amount ? parseUnits(amount, 6) : 0n
  const allowanceOk = allowance !== undefined && parsedAmount > 0n && allowance >= parsedAmount
  const needsApprove = !approved && !allowanceOk
  const onRightChain = chainId === source.chain.id

  async function handleSwitch() {
    const provider = window.ethereum
    if (!provider) {
      notify('No Wallet', 'No wallet extension detected', 'error')
      return
    }
    setSwitching(true)
    const hexChain = '0x' + source.chain.id.toString(16)
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChain }],
      })
      notify('Switched', `Now on ${source.name}`, 'success')
    } catch (err) {
      if (err?.code === 4902) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: hexChain,
              chainName: source.chain.name,
              nativeCurrency: source.chain.nativeCurrency,
              rpcUrls: [source.rpc],
              blockExplorerUrls: source.chain.blockExplorers ? [source.chain.blockExplorers.default.url] : undefined,
            }],
          })
          notify('Network Added', `Added and switched to ${source.name}`, 'success')
        } catch (err2) {
          notify('Switch Failed', err2?.message || 'Could not add network', 'error')
        }
      } else {
        notify('Switch Failed', err?.message || 'Could not switch network', 'error')
      }
    } finally {
      setSwitching(false)
    }
  }

  useEffect(() => {
    if (!receipt) return
    if (actionRef.current === 'approve') {
      if (receipt.status === 'success') {
        setApproved(true)
        refetchAllowance()
        notify('Approval Confirmed', 'TokenMessenger approved for USDC', 'success')
      } else {
        notify('Approval Failed', 'Transaction reverted', 'error')
      }
    }
    if (actionRef.current === 'bridge') {
      if (receipt.status === 'success') {
        notify(
          'Bridge Initiated',
          `${amount} USDC sent via CCTP → Arc (domain ${ARC_CCTP_DOMAIN}). Tokens arrive after attestation.`,
          'success'
        )
      } else {
        notify('Bridge Failed', 'Transaction reverted', 'error')
      }
    }
    actionRef.current = null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receipt])

  function handleApprove() {
    if (!address || !amount) return
    actionRef.current = 'approve'
    writeContract({
      address: source.usdc,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [source.tokenMessenger, maxUint256],
      chainId: source.chain.id,
      gas: 200000n,
      maxFeePerGas: parseGwei('20'),
      maxPriorityFeePerGas: parseGwei('1'),
    })
    notify('Approve Submitted', 'Approving TokenMessenger...', 'info')
  }

  function handleBridge() {
    if (!address || !amount) return
    actionRef.current = 'bridge'
    writeContract({
      address: source.tokenMessenger,
      abi: TOKEN_MESSENGER_ABI,
      functionName: 'depositForBurn',
      args: [parsedAmount, ARC_CCTP_DOMAIN, address, source.usdc],
      chainId: source.chain.id,
      gas: 300000n,
      maxFeePerGas: parseGwei('20'),
      maxPriorityFeePerGas: parseGwei('1'),
    })
    notify('Bridge Submitted', `Burning ${amount} USDC on ${source.name} → Arc`, 'info')
  }

  return (
    <div className="view-section">
      <div className="view-head">
        <h2>Bridge</h2>
        <span className="view-sub">CCTP · USDC to Arc Testnet (Domain {ARC_CCTP_DOMAIN})</span>
      </div>

      <div className="anchor-card">
        <div className="anchor-card-header">
          <span className="anchor-card-label">Cross-Chain Transfer</span>
          <span className="anchor-settlement" style={{ color: 'var(--accent2)' }}>● CCTP</span>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 6 }}>From</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {Object.entries(BRIDGE_SOURCES).map(([key, s]) => (
              <button
                key={key}
                onClick={() => setSourceKey(key)}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: 8,
                  fontSize: 12,
                  cursor: 'pointer',
                  background: sourceKey === key ? 'var(--accent2)' : 'var(--s2)',
                  color: sourceKey === key ? '#000' : 'var(--text2)',
                  border: 'none',
                  fontWeight: 600,
                }}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text2)' }}>USDC Balance</span>
          <span style={{ fontSize: 12, fontFamily: 'DM Mono, monospace' }}>
            {usdcBal ? parseFloat(usdcBal.formatted).toFixed(6) : '0.000000'} USDC
          </span>
        </div>

        <input
          className="anchor-input-sm"
          type="number"
          placeholder="Amount (USDC)"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          style={{ marginBottom: 10 }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--text2)' }}>To</span>
          <span style={{ fontSize: 12, color: 'var(--text)' }}>
            Arc Testnet · <span style={{ fontFamily: 'DM Mono, monospace' }}>{address ? `${address.slice(0, 6)}…${address.slice(-4)}` : '—'}</span>
          </span>
        </div>

        {!onRightChain ? (
          <button className="anchor-swap-btn" onClick={handleSwitch} disabled={switching}>
            {switching ? 'Switching…' : `Switch to ${source.name}`}
          </button>
        ) : needsApprove ? (
          <button className="anchor-swap-btn" onClick={handleApprove} disabled={isPending || !amount}>
            {isPending ? 'Approving...' : `Approve USDC`}
          </button>
        ) : (
          <button className="anchor-swap-btn" onClick={handleBridge} disabled={isPending || !amount}>
            {isPending ? 'Bridging...' : `Bridge ${amount || '0'} USDC → Arc`}
          </button>
        )}

        <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 12, lineHeight: 1.5 }}>
          CCTP burns USDC on the source chain and mints it on Arc. Settlement completes after the
          attestation service confirms the burn — typically under a minute on testnet.
        </p>
      </div>
    </div>
  )
}
