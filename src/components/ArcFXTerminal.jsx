import { useState } from 'react'
import { useAccount, useConnect, useDisconnect, useWriteContract, useBalance } from 'wagmi'
import { parseUnits } from 'viem'
import { ARC_FX_ROUTER_ADDRESS, ARC_FX_ROUTER_ABI } from '../config'

const TOKEN_IN_USDC = '0x0000000000000000000000000000000000000001'
const TOKEN_OUT_EURC = '0x0000000000000000000000000000000000000002'

export default function ArcFXTerminal() {
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
      address: ARC_FX_ROUTER_ADDRESS,
      abi: ARC_FX_ROUTER_ABI,
      functionName: 'swapFX',
      args: [TOKEN_IN_USDC, TOKEN_OUT_EURC, parsedAmount, minOut, parsedRate],
    })
  }

  return (
    <div className="section" id="terminal">
      <div className="section-center-head">
        <div className="section-tag">Terminal</div>
        <div className="section-title">ARC-FX Terminal</div>
        <div className="section-sub">Execute on-chain FX swaps directly</div>
      </div>

      <div className="terminal-card">
        <div className="terminal-header">
          <h3 className="terminal-title">ARC-FX Terminal</h3>
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
          <span className="terminal-balance-label">Arc Network Balance</span>
          <p className="terminal-balance-value">
            {balanceData ? `${parseFloat(balanceData.formatted).toFixed(4)} ${balanceData.symbol}` : '0.00 ARC'}
          </p>
        </div>

        <div className="terminal-field">
          <label className="terminal-label">Pay (USDC)</label>
          <input
            className="terminal-input"
            type="number"
            placeholder="0.0"
            value={amountIn}
            onChange={e => setAmountIn(e.target.value)}
          />
        </div>

        <div className="terminal-rate">
          <span>Target Rate (EUR/USD):</span>
          <span className="terminal-rate-val">{rate}</span>
        </div>

        <button
          className="terminal-action-btn"
          onClick={handleExecuteSwap}
          disabled={!isConnected || isPending || !amountIn}
        >
          {isPending ? 'Executing Transaction on Arc...' : 'Execute On-Chain FX Swap'}
        </button>

        {isSuccess && (
          <div className="terminal-msg success">
            Transaction successfully confirmed on Arc Network!
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
