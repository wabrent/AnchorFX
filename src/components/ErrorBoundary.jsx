import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: 300, padding: '2rem', textAlign: 'center',
        }}>
          <span style={{ fontSize: 48, marginBottom: '1rem' }}>⚠</span>
          <h2 style={{ color: 'var(--text)', marginBottom: '0.5rem' }}>Something went wrong</h2>
          <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: '1rem', maxWidth: 400 }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="anchor-swap-btn"
            style={{ width: 'auto', padding: '10px 24px' }}
          >
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
