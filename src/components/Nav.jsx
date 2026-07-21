import { trimAddr } from '../hooks/useWallet'

export function Nav({ wallet, onOpenModal }) {
  const { isConnected, address, disconnect, isWrongNetwork, switchChain, isSwitching } = wallet

  return (
    <nav className="nav">
      <span className="logo">arc<span>fx</span></span>
      <ul className="nav-links">
        <li><a href="#exchange">Exchange</a></li>
        <li><a href="#subscriptions">Subscriptions</a></li>
        <li><a href="https://docs.arc.network" target="_blank" rel="noreferrer">Docs ↗</a></li>
        <li><a href="#analytics">Analytics</a></li>
      </ul>

      {!isConnected ? (
        <button className="nav-btn" onClick={onOpenModal}>Connect wallet</button>
      ) : isWrongNetwork ? (
        <button className="nav-btn warn" onClick={switchChain} disabled={isSwitching}>
          {isSwitching ? 'Switching…' : 'Wrong network — switch'}
        </button>
      ) : (
        <div className="wallet-pill connected">
          <span className="dot-green" />
          <span className="addr">{trimAddr(address)}</span>
          <button className="disconnect-btn" onClick={() => disconnect()}>disconnect</button>
        </div>
      )}
    </nav>
  )
}
