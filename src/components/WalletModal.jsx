export function WalletModal({ onClose, wallet }) {
  const { connectWith, isPending, pendingConnector, error } = wallet

  const options = [
    {
      id: 'injected',
      name: 'MetaMask',
      desc: 'Connect using browser extension',
      icon: '🦊',
    },
    {
      id: 'walletConnect',
      name: 'WalletConnect',
      desc: 'Scan QR code with your phone',
      icon: '🔗',
    },
    {
      id: 'coinbaseWalletSDK',
      name: 'Coinbase Wallet',
      desc: 'Use Coinbase smart wallet',
      icon: '🔵',
    },
  ]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Connect Wallet</h2>
            <p className="modal-sub">Choose a wallet to connect to ArcFX on Arc Network</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="wallet-options">
          {options.map(opt => {
            const isThisPending = isPending && pendingConnector?.id === opt.id
            return (
              <button
                key={opt.id}
                className="wallet-option"
                disabled={isPending}
                onClick={() => connectWith(opt.id)}
              >
                <span className="wallet-option-icon">{opt.icon}</span>
                <span className="wallet-option-text">
                  <span className="wallet-option-name">{opt.name}</span>
                  <span className="wallet-option-desc">
                    {isThisPending ? 'Confirm in wallet…' : opt.desc}
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        {error && (
          <div className="error-box">
            {error.message?.toLowerCase().includes('no injected') ||
            error.message?.toLowerCase().includes('not found') ||
            error.message?.toLowerCase().includes('not detected')
              ? 'Wallet not found — make sure the extension is installed and unlocked.'
              : error.shortMessage || error.message}
          </div>
        )}

        <p className="modal-hint">Arc Testnet will be added to your wallet automatically</p>
      </div>
    </div>
  )
}
