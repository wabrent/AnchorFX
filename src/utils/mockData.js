export const MARKETS = [
  { pair: 'USDC/EURC', price: 0.9247, change: 0.12, volume: '12.4M' },
  { pair: 'BTC/USD', price: 67245.80, change: -1.34, volume: '2.1B' },
  { pair: 'ETH/USD', price: 3456.20, change: 2.15, volume: '980M' },
  { pair: 'SOL/USD', price: 145.30, change: 5.67, volume: '450M' },
  { pair: 'ARB/USD', price: 1.84, change: -0.45, volume: '120M' },
  { pair: 'OP/USD', price: 3.22, change: 1.89, volume: '85M' },
]

export const MOCK_POSITIONS = [
  { pair: 'BTC/USD', side: 'Long', size: 0.5, entry: 65400, mark: 67245, pnl: 922.50, leverage: 10 },
  { pair: 'ETH/USD', side: 'Short', size: 5, entry: 3500, mark: 3456, pnl: 220.00, leverage: 5 },
]

export const MOCK_HISTORY = [
  { time: '2026-07-21 14:22', pair: 'BTC/USD', side: 'Buy', type: 'Market', size: 0.1, price: 67100, fee: 3.50, status: 'Filled' },
  { time: '2026-07-21 13:15', pair: 'ETH/USD', side: 'Sell', type: 'Limit', size: 2, price: 3480, fee: 1.20, status: 'Filled' },
  { time: '2026-07-21 11:00', pair: 'SOL/USD', side: 'Buy', type: 'Market', size: 10, price: 143.50, fee: 0.80, status: 'Filled' },
]
