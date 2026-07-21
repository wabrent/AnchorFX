import { useState } from 'react'
import { useAccount, useConnect, useDisconnect, useWriteContract, useBalance } from 'wagmi'
import { parseUnits } from 'viem'
import { ANCHOR_FX_ROUTER_ADDRESS, ANCHOR_FX_ROUTER_ABI } from '../config'

const USDC_ADDRESS = '0x0000000000000000000000000000000000000001'
const EURC_ADDRESS = '0x0000000000000000000000000000000000000002'

export default function AnchorFXTerminal() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  const [amountIn, setAmountIn] = useState('')
  const [rate] = useState('1.0850')

  const { data: balanceData } = useBalance({ address })
  const { writeContract, isPending, isSuccess, error } = useWriteContract()

  function handleExecuteSwap() {
    if (!amountIn || parseFloat(amountIn) <= 0) return

    const parsedAmount = parseUnits(amountIn, 18)
    const parsedRate = parseUnits(rate, 18)
    const minOut = (parsedAmount * parsedRate) / BigInt(1e18)

    writeContract({
      address: ANCHOR_FX_ROUTER_ADDRESS,
      abi: ANCHOR_FX_ROUTER_ABI,
      functionName: 'swapFX',
      args: [USDC_ADDRESS, EURC_ADDRESS, parsedAmount, minOut, parsedRate],
    })
  }

  return (
    <div className="section" id="terminal">
      <div className="section-center-head">
        <div className="section-tag">Terminal</div>
        <div className="section-title">
          Anchor<span className="anchor-title-accent">FX</span>
        </div>
        <div className="section-sub">Execute on-chain FX swaps directly</div>
      </div>

      <div className="terminal-card">
        <div className="terminal-header">
          <div>
            <h3 className="terminal-title">
              Anchor<span className="anchor-title-accent">FX</span>
            </h3>
            <p className="terminal-powered">Built on Arc Network</p>
          </div>
          {isConnected ? (
            <button className="terminal-conn-btn disconnect" onClick={() => disconnect()}>
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </button>
          ) : (
            <button className="terminal-conn-btn" onClick={() => connect({ connector: connectors[0] })}>
              Connect Wallet
            </button>
          )}
        </div>

        <div className="terminal-balance">
          <div className="terminal-balance-header">
            <span className="terminal-balance-label">Arc Network Native Balance</span>
            <span className="terminal-balance-badge">Arc Testnet</span>
          </div>
          <p className="terminal-balance-value">
            {balanceData ? `${parseFloat(balanceData.formatted).toFixed(4)} ${balanceData.symbol}` : '0.00 ARC'}
          </p>
        </div>

        <div className="terminal-field">
          <label className="terminal-label">Pay Asset (USDC)</label>
          <input
            className="terminal-input"
            type="number"
            placeholder="0.0"
            value={amountIn}
            onChange={e => setAmountIn(e.target.value)}
          />
        </div>

        <div className="terminal-rate">
          <span>Oracle Rate (EUR/USD):</span>
          <span className="terminal-rate-val">{rate}</span>
        </div>

        <button
          className="terminal-action-btn"
          onClick={handleExecuteSwap}
          disabled={!isConnected || isPending || !amountIn}
        >
          {isPending ? 'Executing On-Chain Swap...' : 'Swap FX on Arc'}
        </button>

        {isSuccess && (
          <div className="terminal-msg success">
            Transaction confirmed on Arc Network!
          </div>
        )}

        {error && (
          <div className="terminal-msg error">
            Error: {error.message.slice(0, 100)}...
          </div>
        )}
      </div>
    </div>
  )
}
