import { useAccount, useReadContract } from 'wagmi'
import { EURC_ADDRESS } from '../../config'
import { useUsdcBalance } from '../../hooks/useUsdcBalance'
import { formatUnits } from 'viem'

const BALANCE_OF_ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
]

export default function PortfolioView() {
  const { address } = useAccount()
  const { balance: usdc } = useUsdcBalance()

  const { data: eurcRaw } = useReadContract({
    address: EURC_ADDRESS,
    abi: BALANCE_OF_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const eurc = typeof eurcRaw === 'bigint' ? parseFloat(formatUnits(eurcRaw, 18)) : 0

  return (
    <div className="view-section">
      <div className="view-head">
        <h2>Portfolio</h2>
        <span className="view-sub">Real balances from Arc Testnet</span>
      </div>

      {address ? (
        <>
          <div className="pf-stats">
            <div className="pf-card">
              <div className="pf-card-label">USDC Balance</div>
              <div className="pf-card-val">{usdc.toFixed(2)}</div>
            </div>
            <div className="pf-card">
              <div className="pf-card-label">EURC Balance</div>
              <div className="pf-card-val">{eurc.toFixed(2)}</div>
            </div>
            <div className="pf-card">
              <div className="pf-card-label">Network</div>
              <div className="pf-card-val" style={{ fontSize: 14 }}>Arc Testnet</div>
            </div>
            <div className="pf-card">
              <div className="pf-card-label">Chain ID</div>
              <div className="pf-card-val" style={{ fontSize: 14 }}>5042002</div>
            </div>
          </div>

          <div className="pf-balance-box">
            <span className="pf-balance-label">Connected Wallet</span>
            <span className="pf-balance-val" style={{ fontSize: 13, fontFamily: 'DM Mono, monospace' }}>{address}</span>
          </div>

          <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--s1)', borderRadius: 12, border: '0.5px solid var(--border)', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>View all transactions on ArcScan</p>
            <a
              href={`https://testnet.arcscan.app/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mkt-trade-btn"
              style={{ display: 'inline-block', padding: '8px 20px' }}
            >
              Open ArcScan
            </a>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text3)' }}>
          <p style={{ fontSize: 15 }}>Connect your wallet to view portfolio</p>
        </div>
      )}
    </div>
  )
}
