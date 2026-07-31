import { useState, useEffect, useRef } from 'react'
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits, parseGwei, keccak256, stringToHex, zeroAddress } from 'viem'
import { USDC_ADDRESS } from '../../config'
import { ERC20_ABI, AGENTIC_COMMERCE_ABI } from '../../abis'
import { useAppState } from '../../context/useAppState'

const AGENTIC_CONTRACT = '0x0747EEf0706327138c69792bF28Cd525089e4583'
const STATUS_NAMES = ['Open', 'Funded', 'Submitted', 'Completed', 'Rejected', 'Expired']

export default function AgentsView() {
  const { address } = useAccount()
  const { notify } = useAppState()
  const [jobId, setJobId] = useState('')
  const [provider, setProvider] = useState('')
  const [description] = useState('AI agent task on Arc')
  const [budget, setBudget] = useState('5')
  const [deliverable, setDeliverable] = useState('anchorfx-deliverable-v1')
  const [approved, setApproved] = useState(false)
  const actionRef = useRef(null)

  const { data: writeResult, writeContract, isPending } = useWriteContract()
  const { data: receipt } = useWaitForTransactionReceipt({ hash: writeResult })

  const jobIdNum = jobId ? BigInt(jobId) : undefined
  const { data: job, refetch: refetchJob } = useReadContract({
    address: AGENTIC_CONTRACT,
    abi: AGENTIC_COMMERCE_ABI,
    functionName: 'getJob',
    args: jobIdNum !== undefined ? [jobIdNum] : undefined,
    query: { enabled: jobIdNum !== undefined },
  })

  const deliverableHash = keccak256(stringToHex(deliverable))
  const reasonHash = keccak256(stringToHex('deliverable-approved'))
  const budgetParsed = budget ? parseUnits(budget, 6) : 0n
  const expiredAt = Math.floor(Date.now() / 1000) + 3600

  useEffect(() => {
    if (!receipt) return
    if (actionRef.current === 'approve') {
      if (receipt.status === 'success') {
        setApproved(true)
        notify('Approval Confirmed', 'AgenticCommerce approved for USDC', 'success')
      } else {
        notify('Approval Failed', 'Transaction reverted', 'error')
      }
    } else {
      const label = {
        create: 'Job created', setBudget: 'Budget set', fund: 'Escrow funded',
        submit: 'Deliverable submitted', complete: 'Job completed',
      }[actionRef.current] || 'Transaction confirmed'
      if (receipt.status === 'success') {
        notify(label, actionRef.current === 'create' ? 'Find jobId in ArcScan' : 'On Arc', 'success')
        refetchJob()
        window.dispatchEvent(new Event('anchorfx:refresh'))
      } else {
        notify('Failed', 'Transaction reverted', 'error')
      }
    }
    actionRef.current = null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receipt])

  function run(action, config) {
    actionRef.current = action
    writeContract({
      chainId: 5042002,
      maxFeePerGas: parseGwei('20'),
      maxPriorityFeePerGas: parseGwei('1'),
      ...config,
    })
  }

  return (
    <div className="view-section">
      <div className="view-head">
        <h2>AI Agents</h2>
        <span className="view-sub">ERC-8183 · Agentic escrow with USDC settlement</span>
      </div>

      <div className="anchor-card">
        <div className="anchor-card-header">
          <span className="anchor-card-label">Agentic Commerce · {STATUS_NAMES[job?.status ?? 0]}</span>
          <span className="anchor-settlement" style={{ color: 'var(--accent2)' }}>● ERC-8183</span>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            className="anchor-input"
            type="number"
            placeholder="Job ID (after creation)"
            value={jobId}
            onChange={e => setJobId(e.target.value)}
            style={{ flex: 1 }}
          />
          {job && (
            <button
              style={{
                padding: '4px 12px', background: 'var(--s2)', border: '0.5px solid var(--border)',
                color: 'var(--accent)', borderRadius: 6, fontSize: 11, cursor: 'pointer',
              }}
              onClick={() => refetchJob()}
            >Refresh</button>
          )}
        </div>

        {job && (
          <div style={{ marginBottom: 12, fontSize: 12, lineHeight: 1.8, fontFamily: 'DM Mono, monospace', background: 'var(--s1)', padding: 10, borderRadius: 8 }}>
            <div>Status: <b style={{ color: 'var(--accent2)' }}>{STATUS_NAMES[job.status]}</b></div>
            <div>Budget: {parseUnits ? (Number(job.budget) / 1e6).toFixed(6) : '0'} USDC</div>
            <div>Client: {job.client?.slice(0, 10)}…</div>
            <div>Provider: {job.provider?.slice(0, 10)}…</div>
            <div>Desc: {job.description}</div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            className="anchor-input"
            type="text"
            placeholder="Provider address"
            value={provider}
            onChange={e => setProvider(e.target.value)}
            style={{ flex: 1 }}
          />
          <button
            className="anchor-swap-btn"
            style={{ fontSize: 12, padding: '6px 12px', width: 'auto' }}
            disabled={isPending || !address || !provider}
            onClick={() => run('create', {
              address: AGENTIC_CONTRACT,
              abi: AGENTIC_COMMERCE_ABI,
              functionName: 'createJob',
              args: [provider, address, BigInt(expiredAt), description, zeroAddress],
              gas: 300000n,
            })}
          >Create Job</button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            className="anchor-input"
            type="number"
            placeholder="Budget USDC"
            value={budget}
            onChange={e => setBudget(e.target.value)}
            style={{ flex: 1 }}
          />
          <button
            className="anchor-swap-btn"
            style={{ fontSize: 12, padding: '6px 12px', width: 'auto' }}
            disabled={isPending || !jobIdNum}
            onClick={() => run('setBudget', {
              address: AGENTIC_CONTRACT,
              abi: AGENTIC_COMMERCE_ABI,
              functionName: 'setBudget',
              args: [jobIdNum, budgetParsed, '0x'],
              gas: 200000n,
            })}
          >Set Budget</button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          {!approved ? (
            <button
              className="anchor-swap-btn"
              style={{ fontSize: 12, padding: '6px 12px' }}
              disabled={isPending || !jobIdNum}
              onClick={() => run('approve', {
                address: USDC_ADDRESS,
                abi: ERC20_ABI,
                functionName: 'approve',
                args: [AGENTIC_CONTRACT, budgetParsed],
                gas: 200000n,
              })}
            >Approve USDC</button>
          ) : (
            <button
              className="anchor-swap-btn"
              style={{ fontSize: 12, padding: '6px 12px', background: 'var(--green)' }}
              disabled={isPending || !jobIdNum}
              onClick={() => run('fund', {
                address: AGENTIC_CONTRACT,
                abi: AGENTIC_COMMERCE_ABI,
                functionName: 'fund',
                args: [jobIdNum, '0x'],
                gas: 200000n,
              })}
            >Fund Escrow ({budget || '0'} USDC)</button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            className="anchor-input"
            type="text"
            placeholder="Deliverable string (hashed)"
            value={deliverable}
            onChange={e => setDeliverable(e.target.value)}
            style={{ flex: 1 }}
          />
          <button
            className="anchor-swap-btn"
            style={{ fontSize: 12, padding: '6px 12px', width: 'auto' }}
            disabled={isPending || !jobIdNum}
            onClick={() => run('submit', {
              address: AGENTIC_CONTRACT,
              abi: AGENTIC_COMMERCE_ABI,
              functionName: 'submit',
              args: [jobIdNum, deliverableHash, '0x'],
              gas: 200000n,
            })}
          >Submit</button>
          <button
            className="anchor-swap-btn"
            style={{ fontSize: 12, padding: '6px 12px', width: 'auto', background: 'var(--green)' }}
            disabled={isPending || !jobIdNum}
            onClick={() => run('complete', {
              address: AGENTIC_CONTRACT,
              abi: AGENTIC_COMMERCE_ABI,
              functionName: 'complete',
              args: [jobIdNum, reasonHash, '0x'],
              gas: 200000n,
            })}
          >Complete</button>
        </div>

        <p style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.5, marginTop: 8 }}>
          Flow: Create Job → Set Budget → Approve + Fund escrow → Submit deliverable → Complete.
          Provider releases budget only via evaluator approval. Sub-second settlement on Arc.
        </p>
      </div>
    </div>
  )
}
