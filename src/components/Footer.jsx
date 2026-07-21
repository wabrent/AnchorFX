export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
            <span className="logo">Anchor<span style={{ color: '#6B8BFF' }}>FX</span></span>
            <p style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>Built on Arc Network</p>
          </div>
        <div className="footer-links">
          <a href="https://docs.arc.network" target="_blank" rel="noreferrer">Docs</a>
          <a href="https://github.com/wabrent/ARC-FX" target="_blank" rel="noreferrer">GitHub</a>
          <a href="#exchange">Exchange</a>
        </div>
        <span className="footer-note">Arc Testnet · Demo build</span>
      </div>
    </footer>
  )
}
