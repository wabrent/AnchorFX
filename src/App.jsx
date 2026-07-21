import { useState } from 'react'
import { WagmiProvider, useAccount, useConnect, useDisconnect, useWriteContract, useBalance } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { parseUnits } from 'viem'
import { config, ANCHOR_FX_ROUTER_ADDRESS, ANCHOR_FX_ROUTER_ABI } from './config'

const queryClient = new QueryClient()

const TOKEN_IN = '0x0000000000000000000000000000000000000001'
const TOKEN_OUT = '0x0000000000000000000000000000000000000002'

function AnchorApp() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  const [amountIn, setAmountIn] = useState('')
  const [rate] = useState('0.9247')

  const { data: balanceData } = useBalance({ address })
  const { writeContract, isPending, isSuccess, error } = useWriteContract()

  function handleSwap() {
    if (!amountIn) return
    const parsedAmount = parseUnits(amountIn, 18)
    const parsedRate = parseUnits(rate, 18)
    const minOut = (parsedAmount * parsedRate) / BigInt(1e18)

    writeContract({
      address: ANCHOR_FX_ROUTER_ADDRESS,
      abi: ANCHOR_FX_ROUTER_ABI,
      functionName: 'swapFX',
      args: [TOKEN_IN, TOKEN_OUT, parsedAmount, minOut, parsedRate],
    })
  }

  return (
    <div className="anchor-page">
      <header className="anchor-header">
        <div className="anchor-header-left">
          <span className="anchor-logo">Anchor<span className="anchor-accent">FX</span></span>
          <span className="anchor-badge">Built on Arc Network</span>
        </div>
        <div>
          {isConnected ? (
            <button className="anchor-btn-ghost" onClick={() => disconnect()}>
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </button>
          ) : (
            <button className="anchor-btn-primary" onClick={() => connect({ connector: connectors[0] })}>
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      <main className="anchor-main">
        <div className="anchor-hero">
          <h1 className="anchor-hero-title">Instant Stablecoin FX for On-Chain Economy</h1>
          <p className="anchor-hero-sub">
            Deterministic sub-second settlement on Arc Network. Zero slippage surprises, predictable ~$0.01 gas fees.
          </p>
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
                  Balance: {balanceData ? parseFloat(balanceData.formatted).toFixed(2) : '0.00'} ARC
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

            <button
              className="anchor-swap-btn"
              onClick={handleSwap}
              disabled={!isConnected || isPending || !amountIn}
            >
              {isPending ? 'Executing Transaction on Arc...' : 'Execute On-Chain FX Swap'}
            </button>

            {isSuccess && (
              <p className="anchor-msg success">✓ Confirmed on Arc scan!</p>
            )}
            {error && (
              <p className="anchor-msg error">{error.message.slice(0, 80)}...</p>
            )}
          </div>
        </div>

        <div className="anchor-subscriptions">
          <h2 className="anchor-sub-title">Smart Contract Subscriptions in USDC</h2>
          <div className="anchor-sub-grid">
            <div className="anchor-sub-card">
              <h3 className="anchor-sub-name">Starter</h3>
              <p className="anchor-sub-price">$0 <span className="anchor-sub-period">/ mo</span></p>
              <p className="anchor-sub-desc">Up to 5 active subs, USDC settlement.</p>
            </div>
            <div className="anchor-sub-card featured">
              <span className="anchor-sub-popular">Popular</span>
              <h3 className="anchor-sub-name">Growth</h3>
              <p className="anchor-sub-price">$49 <span className="anchor-sub-period">/ mo in USDC</span></p>
              <p className="anchor-sub-desc">Unlimited subs, USDC + EURC, Webhooks.</p>
            </div>
            <div className="anchor-sub-card">
              <h3 className="anchor-sub-name">Enterprise</h3>
              <p className="anchor-sub-price">Custom</p>
              <p className="anchor-sub-desc">Multi-token FX, White-label UI, Dedicated support.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AnchorApp />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
