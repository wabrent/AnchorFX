import { useAccount, useBalance } from 'wagmi'
import { EURC_ADDRESS } from '../../config'

export default function PortfolioView() {
  const { address } = useAccount()
  const { data: usdcBalance } = useBalance({ address })
  const { data: eurcBalance } = useBalance({ address, token: EURC_ADDRESS })

  const usdc = usdcBalance ? parseFloat(usdcBalance.formatted) : 0
  const eurc = eurcBalance ? parseFloat(eurcBalance.formatted) : 0

  return (
    <div className="view-section">
      <div className="view-head">
        <h2>Portfolio</h2>
        <span className="view-sub">Real balances from Arc Network</span>
      </div>

      {address ? (
        <>
          <div className="pf-stats">
            <div className="pf-card">
              <div className="pf-card-label">USDC Balance</div>
              <div className="pf-card-val">{usdc.toFixed(4)}</div>
            </div>
            <div className="pf-card">
              <div className="pf-card-label">EURC Balance</div>
              <div className="pf-card-val">{eurc.toFixed(4)}</div>
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
              Open ArcScan ↗
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
