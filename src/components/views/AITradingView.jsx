import { useState } from 'react'

const STRATEGIES = [
  { id: 'trend', name: 'Trend Following', description: 'Follows market momentum using EMA crossovers and RSI', icon: '📈', risk: 'Medium', winRate: 62, pairs: ['BTC/USD', 'ETH/USD', 'EUR/USD'], status: 'active' },
  { id: 'meanRev', name: 'Mean Reversion', description: 'Trades price reversions to Bollinger Band extremes', icon: '🔄', risk: 'Low', winRate: 58, pairs: ['EUR/USD', 'GBP/USD'], status: 'active' },
  { id: 'breakout', name: 'Breakout Trading', description: 'Enters on high-volume breakouts from consolidation', icon: '🚀', risk: 'High', winRate: 45, pairs: ['BTC/USD', 'ETH/USD'], status: 'paused' },
  { id: 'grid', name: 'Grid Trading', description: 'Places orders at intervals to capture range movements', icon: '📐', risk: 'Low', winRate: 72, pairs: ['USDC/EURC'], status: 'active' },
  { id: 'arbitrage', name: 'Cross-Chain Arbitrage', description: 'Exploits price differences across chains', icon: '⚡', risk: 'Medium', winRate: 85, pairs: ['USDC/EURC'], status: 'active' },
  { id: 'sentiment', name: 'Sentiment Analysis', description: 'Trades based on news and social sentiment', icon: '🧠', risk: 'High', winRate: 55, pairs: ['BTC/USD', 'ETH/USD', 'SOL/USD'], status: 'paused' },
]

const SIGNALS = [
  { pair: 'BTC/USD', signal: 'BUY', confidence: 78, strategy: 'Trend Following', time: '2m ago', price: '$66,465' },
  { pair: 'EUR/USD', signal: 'SELL', confidence: 82, strategy: 'Mean Reversion', time: '5m ago', price: '$0.9247' },
  { pair: 'ETH/USD', signal: 'BUY', confidence: 65, strategy: 'Breakout Trading', time: '8m ago', price: '$1,941' },
  { pair: 'USDC/EURC', signal: 'BUY', confidence: 91, strategy: 'Grid Trading', time: '12m ago', price: '$0.9247' },
  { pair: 'SOL/USD', signal: 'SELL', confidence: 72, strategy: 'Trend Following', time: '15m ago', price: '$78.43' },
]

const PERFORMANCE = {
  totalTrades: 342,
  winRate: 67.8,
  profitFactor: 2.14,
  sharpeRatio: 1.89,
  maxDrawdown: -8.2,
  avgWin: 2.4,
  avgLoss: -1.1,
  totalReturn: 42.6,
}

export default function AITradingView() {
  const [activeTab, setActiveTab] = useState('signals')
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Welcome to AnchorFX AI Trading Demo.\n\nThis is a simulated AI assistant. The signals and strategies shown are for demonstration purposes only.\n\nFor real trading, use the Swap or Orders tabs.' },
  ])

  function handleSendMessage() {
    if (!chatInput.trim()) return
    const userMsg = { role: 'user', content: chatInput }
    setChatMessages(prev => [...prev, userMsg])
    setChatInput('')

    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `This is a demo AI assistant. For real trading decisions, please:\n\n1. Use the Markets tab for live prices\n2. Use the Swap tab for on-chain swaps\n3. Use the Orders tab for limit/stop orders\n\nThe AI Trading features are under development.`
      }])
    }, 500)
  }

  return (
    <div className="view-section ai-view">
      <div className="view-head">
        <h2>AI Trading</h2>
        <span className="view-sub">Demo - simulated trading signals and strategies</span>
      </div>

      <div style={{ padding: '1rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, marginBottom: '1.5rem', fontSize: 13, color: '#f59e0b' }}>
        AI Trading is a demo feature. Signals are simulated. Use Swap and Orders tabs for real trading.
      </div>

      <div className="ai-tabs">
        <button className={`ai-tab ${activeTab === 'signals' ? 'active' : ''}`} onClick={() => setActiveTab('signals')}>Signals</button>
        <button className={`ai-tab ${activeTab === 'strategies' ? 'active' : ''}`} onClick={() => setActiveTab('strategies')}>Strategies</button>
        <button className={`ai-tab ${activeTab === 'performance' ? 'active' : ''}`} onClick={() => setActiveTab('performance')}>Performance</button>
        <button className={`ai-tab ${activeTab === 'assistant' ? 'active' : ''}`} onClick={() => setActiveTab('assistant')}>AI Assistant</button>
      </div>

      {activeTab === 'signals' && (
        <div className="ai-signals">
          {SIGNALS.map((signal, i) => (
            <div key={i} className="ai-signal-card" style={{ opacity: 0.7 }}>
              <div className="ai-signal-pair">
                <span className="ai-signal-pair-name">{signal.pair}</span>
                <span className="ai-signal-price">{signal.price}</span>
              </div>
              <div className={`ai-signal-action ${signal.signal.toLowerCase()}`}>{signal.signal}</div>
              <div className="ai-signal-details">
                <div className="ai-signal-detail"><span>Confidence</span><span>{signal.confidence}%</span></div>
                <div className="ai-signal-detail"><span>Strategy</span><span>{signal.strategy}</span></div>
                <div className="ai-signal-detail"><span>Time</span><span>{signal.time}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'strategies' && (
        <div className="ai-strategies">
          {STRATEGIES.map(strategy => (
            <div key={strategy.id} className="ai-strategy-card" style={{ opacity: 0.7 }}>
              <div className="ai-strategy-header">
                <span className="ai-strategy-icon">{strategy.icon}</span>
                <div className="ai-strategy-info">
                  <h3 className="ai-strategy-name">{strategy.name}</h3>
                  <p className="ai-strategy-desc">{strategy.description}</p>
                </div>
                <span className="vault-risk risk-medium">Demo</span>
              </div>
              <div className="ai-strategy-stats">
                <div className="ai-strategy-stat"><span>Win Rate</span><span className="green">{strategy.winRate}%</span></div>
                <div className="ai-strategy-stat"><span>Risk</span><span>{strategy.risk}</span></div>
                <div className="ai-strategy-stat"><span>Pairs</span><span>{strategy.pairs.join(', ')}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="ai-performance">
          <div className="ai-perf-grid">
            <div className="ai-perf-card"><span className="ai-perf-label">Total Return</span><span className="ai-perf-val green">+{PERFORMANCE.totalReturn}%</span></div>
            <div className="ai-perf-card"><span className="ai-perf-label">Win Rate</span><span className="ai-perf-val">{PERFORMANCE.winRate}%</span></div>
            <div className="ai-perf-card"><span className="ai-perf-label">Profit Factor</span><span className="ai-perf-val green">{PERFORMANCE.profitFactor}x</span></div>
            <div className="ai-perf-card"><span className="ai-perf-label">Sharpe Ratio</span><span className="ai-perf-val">{PERFORMANCE.sharpeRatio}</span></div>
            <div className="ai-perf-card"><span className="ai-perf-label">Max Drawdown</span><span className="ai-perf-val red">{PERFORMANCE.maxDrawdown}%</span></div>
            <div className="ai-perf-card"><span className="ai-perf-label">Total Trades</span><span className="ai-perf-val">{PERFORMANCE.totalTrades}</span></div>
          </div>
          <p style={{ marginTop: '1rem', fontSize: 12, color: 'var(--text3)', textAlign: 'center' }}>Simulated performance data for demo purposes</p>
        </div>
      )}

      {activeTab === 'assistant' && (
        <div className="ai-assistant">
          <div className="ai-chat-messages">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`ai-chat-msg ${msg.role}`}>
                <div className="ai-chat-avatar">{msg.role === 'assistant' ? '🤖' : '👤'}</div>
                <div className="ai-chat-content">
                  <pre className="ai-chat-text">{msg.content}</pre>
                </div>
              </div>
            ))}
          </div>
          <div className="ai-chat-input">
            <input
              type="text"
              placeholder="Ask about the demo..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
            />
            <button onClick={handleSendMessage} disabled={!chatInput.trim()}>Send</button>
          </div>
        </div>
      )}
    </div>
  )
}
