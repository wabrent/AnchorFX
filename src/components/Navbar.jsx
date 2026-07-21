import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useAppState } from '../context/useAppState'
import { useState } from 'react'

export default function Navbar() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { activeTab, setActiveTab, tabs } = useAppState()
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <header className="nav-header">
        <div className="nav-left">
          <span className="nav-logo">Anchor<span className="nav-logo-accent">FX</span></span>
          <span className="nav-badge">Arc Testnet</span>
        </div>

        <nav className="nav-tabs">
          {tabs.map(tab => (
            <button
              key={tab}
              className={`nav-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>

        <div className="nav-right">
          {isConnected ? (
            <div className="nav-wallet">
              <span className="nav-dot" />
              <span className="nav-addr">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
              <button className="nav-disconnect" onClick={() => disconnect()}>✕</button>
            </div>
          ) : (
            <button className="nav-connect" onClick={() => setShowModal(true)}>Connect Wallet</button>
          )}
        </div>
      </header>

      {showModal && !isConnected && (
        <div className="modal-wrap">
          <div className="modal-backdrop" onClick={() => setShowModal(false)} />
          <div className="modal-card">
            <div className="modal-head">
              <h3>Connect Wallet</h3>
              <button className="modal-x" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {connectors.map(c => (
                <button key={c.id} className="modal-opt" onClick={() => { connect({ connector: c, chainId: 5042002 }); setShowModal(false) }}>
                  <span className="modal-opt-icon">{c.icon || (c.id === 'injected' ? '🦊' : c.id === 'coinbaseWallet' ? '🔵' : '📱')}</span>
                  <div>
                    <div className="modal-opt-name">{c.name}</div>
                    <div className="modal-opt-desc">
                      {c.id === 'injected' ? 'Browser wallet' : c.id === 'coinbaseWallet' ? 'Coinbase Wallet' : 'QR / Mobile'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
