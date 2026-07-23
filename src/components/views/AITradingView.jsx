import { useState, useEffect } from 'react'
import { useAppState } from '../../context/useAppState'

const STRATEGIES = [
  {
    id: 'trend',
    name: 'Trend Following',
    description: 'Follows market momentum using EMA crossovers and RSI',
    icon: '📈',
    risk: 'Medium',
    winRate: 62,
    pairs: ['BTC/USD', 'ETH/USD', 'EUR/USD'],
    status: 'active',
  },
  {
    id: 'meanRev',
    name: 'Mean Reversion',
    description: 'Trades price reversions to Bollinger Band extremes',
    icon: '🔄',
    risk: 'Low',
    winRate: 58,
    pairs: ['EUR/USD', 'GBP/USD'],
    status: 'active',
  },
  {
    id: 'breakout',
    name: 'Breakout Trading',
    description: 'Enters on high-volume breakouts from consolidation',
    icon: '🚀',
    risk: 'High',
    winRate: 45,
    pairs: ['BTC/USD', 'ETH/USD'],
    status: 'paused',
  },
  {
    id: 'grid',
    name: 'Grid Trading',
    description: 'Places orders at intervals to capture range movements',
    icon: '📐',
    risk: 'Low',
    winRate: 72,
    pairs: ['USDC/EURC'],
    status: 'active',
  },
  {
    id: 'arbitrage',
    name: 'Cross-Chain Arbitrage',
    description: 'Exploits price differences across chains',
    icon: '⚡',
    risk: 'Medium',
    winRate: 85,
    pairs: ['USDC/EURC'],
    status: 'active',
  },
  {
    id: 'sentiment',
    name: 'Sentiment Analysis',
    description: 'Trades based on news and social sentiment',
    icon: '🧠',
    risk: 'High',
    winRate: 55,
    pairs: ['BTC/USD', 'ETH/USD', 'SOL/USD'],
    status: 'paused',
  },
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
  const { notify } = useAppState()
  const [selectedStrategy, setSelectedStrategy] = useState(null)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Welcome to AnchorFX AI Trading Assistant. I can help you with:\n\n- Analyzing market conditions\n- Setting up trading strategies\n- Monitoring open positions\n- Risk management advice\n\nHow can I assist you today?' },
  ])
  const [activeTab, setActiveTab] = useState('signals')

  function handleSendMessage() {
    if (!chatInput.trim()) return

    const userMsg = { role: 'user', content: chatInput }
    setChatMessages(prev => [...prev, userMsg])
    setChatInput('')

    setTimeout(() => {
      let response = ''
      const input = chatInput.toLowerCase()

      if (input.includes('buy') || input.includes('long')) {
        response = 'Based on current analysis:\n\n- BTC/USD shows bullish momentum (RSI: 62)\n- EUR/USD is at support level (0.9245)\n- Recommended position size: 2-5% of portfolio\n\nWould you like me to execute a trade?'
      } else if (input.includes('sell') || input.includes('short')) {
        response = 'Current short opportunities:\n\n- ETH/USD showing bearish divergence\n- SOL/USD breaking below support\n- Recommended: Use stop-loss at 2% above entry\n\nShall I set up a sell order?'
      } else if (input.includes('risk') || input.includes('portfolio')) {
        response = `Portfolio Risk Analysis:\n\n- Total exposure: $12,450\n- Max drawdown: -8.2%\n- Sharpe ratio: 1.89\n- Diversification: Good (4/6 pairs)\n\nRecommendation: Reduce BTC exposure by 15%`
      } else if (input.includes('market') || input.includes('analysis')) {
        response = 'Market Analysis Summary:\n\n- BTC: Bullish trend, targeting $70k\n- ETH: Consolidating, watch $2000 resistance\n- EUR/USD: Range-bound 0.92-0.93\n- Overall sentiment: Cautiously bullish\n\nKey levels to watch provided in chart.'
      } else if (input.includes('strategy') || input.includes('strategy')) {
        response = 'Available AI Strategies:\n\n1. Trend Following (62% win rate)\n2. Mean Reversion (58% win rate)\n3. Grid Trading (72% win rate)\n\nRecommendation: Grid Trading for current range-bound market.'
      } else {
        response = `I understand you're asking about "${chatInput}". Let me analyze the current market conditions and provide you with actionable insights. Based on our AI models:\n\n- Current market volatility: Medium\n- Trend direction: Mixed\n- Recommended action: Hold and monitor\n\nWould you like more specific analysis on any particular asset?`
      }

      setChatMessages(prev => [...prev, { role: 'assistant', content: response }])
    }, 800)
  }

  function toggleStrategy(strategy) {
    const updated = STRATEGIES.map(s =>
      s.id === strategy.id ? { ...s, status: s.status === 'active' ? 'paused' : 'active' } : s
    )
    const newStatus = strategy.status === 'active' ? 'paused' : 'active'
    notify('Strategy Updated', `${strategy.name} ${newStatus}`, 'info')
  }

  return (
    <div className="view-section ai-view">
      <div className="view-head">
        <h2>AI Trading</h2>
        <span className="view-sub">Intelligent trading strategies on Arc Network</span>
      </div>

      <div className="ai-tabs">
        <button className={`ai-tab ${activeTab === 'signals' ? 'active' : ''}`} onClick={() => setActiveTab('signals')}>
          Live Signals
        </button>
        <button className={`ai-tab ${activeTab === 'strategies' ? 'active' : ''}`} onClick={() => setActiveTab('strategies')}>
          Strategies
        </button>
        <button className={`ai-tab ${activeTab === 'performance' ? 'active' : ''}`} onClick={() => setActiveTab('performance')}>
          Performance
        </button>
        <button className={`ai-tab ${activeTab === 'assistant' ? 'active' : ''}`} onClick={() => setActiveTab('assistant')}>
          AI Assistant
        </button>
      </div>

      {activeTab === 'signals' && (
        <div className="ai-signals">
          <div className="ai-signals-header">
            <h3>Live Trading Signals</h3>
            <span className="ai-signals-count">{SIGNALS.length} active signals</span>
          </div>
          {SIGNALS.map((signal, i) => (
            <div key={i} className="ai-signal-card">
              <div className="ai-signal-pair">
                <span className="ai-signal-pair-name">{signal.pair}</span>
                <span className="ai-signal-price">{signal.price}</span>
              </div>
              <div className={`ai-signal-action ${signal.signal.toLowerCase()}`}>
                {signal.signal}
              </div>
              <div className="ai-signal-details">
                <div className="ai-signal-detail">
                  <span>Confidence</span>
                  <span className="ai-confidence">
                    <span className="ai-confidence-bar" style={{ width: signal.confidence + '%' }} />
                    {signal.confidence}%
                  </span>
                </div>
                <div className="ai-signal-detail">
                  <span>Strategy</span>
                  <span>{signal.strategy}</span>
                </div>
                <div className="ai-signal-detail">
                  <span>Time</span>
                  <span>{signal.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'strategies' && (
        <div className="ai-strategies">
          {STRATEGIES.map(strategy => (
            <div key={strategy.id} className="ai-strategy-card">
              <div className="ai-strategy-header">
                <span className="ai-strategy-icon">{strategy.icon}</span>
                <div className="ai-strategy-info">
                  <h3 className="ai-strategy-name">{strategy.name}</h3>
                  <p className="ai-strategy-desc">{strategy.description}</p>
                </div>
                <div className="ai-strategy-toggle">
                  <button
                    className={`ai-toggle-btn ${strategy.status === 'active' ? 'active' : ''}`}
                    onClick={() => toggleStrategy(strategy)}
                  >
                    {strategy.status === 'active' ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
              <div className="ai-strategy-stats">
                <div className="ai-strategy-stat">
                  <span>Win Rate</span>
                  <span className="green">{strategy.winRate}%</span>
                </div>
                <div className="ai-strategy-stat">
                  <span>Risk</span>
                  <span className={`risk-${strategy.risk.toLowerCase()}`}>{strategy.risk}</span>
                </div>
                <div className="ai-strategy-stat">
                  <span>Pairs</span>
                  <span>{strategy.pairs.join(', ')}</span>
                </div>
                <div className="ai-strategy-stat">
                  <span>Status</span>
                  <span className={strategy.status === 'active' ? 'green' : 'red'}>{strategy.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="ai-performance">
          <div className="ai-perf-grid">
            <div className="ai-perf-card">
              <span className="ai-perf-label">Total Return</span>
              <span className="ai-perf-val green">+{PERFORMANCE.totalReturn}%</span>
            </div>
            <div className="ai-perf-card">
              <span className="ai-perf-label">Win Rate</span>
              <span className="ai-perf-val">{PERFORMANCE.winRate}%</span>
            </div>
            <div className="ai-perf-card">
              <span className="ai-perf-label">Profit Factor</span>
              <span className="ai-perf-val green">{PERFORMANCE.profitFactor}x</span>
            </div>
            <div className="ai-perf-card">
              <span className="ai-perf-label">Sharpe Ratio</span>
              <span className="ai-perf-val">{PERFORMANCE.sharpeRatio}</span>
            </div>
            <div className="ai-perf-card">
              <span className="ai-perf-label">Max Drawdown</span>
              <span className="ai-perf-val red">{PERFORMANCE.maxDrawdown}%</span>
            </div>
            <div className="ai-perf-card">
              <span className="ai-perf-label">Total Trades</span>
              <span className="ai-perf-val">{PERFORMANCE.totalTrades}</span>
            </div>
            <div className="ai-perf-card">
              <span className="ai-perf-label">Avg Win</span>
              <span className="ai-perf-val green">+{PERFORMANCE.avgWin}%</span>
            </div>
            <div className="ai-perf-card">
              <span className="ai-perf-label">Avg Loss</span>
              <span className="ai-perf-val red">{PERFORMANCE.avgLoss}%</span>
            </div>
          </div>
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
              placeholder="Ask AI about market conditions, strategies, risk..."
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
