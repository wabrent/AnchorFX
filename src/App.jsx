import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { config, arcTestnet } from './config'
import { AppProvider, useAppState } from './context/useAppState'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import MarketsView from './components/views/MarketsView'
import PortfolioView from './components/views/PortfolioView'
import HistoryView from './components/views/HistoryView'
import SwapView from './components/views/SwapView'
import TradingViewWidget from './components/views/TradingViewWidget'

import { ErrorBoundary } from './components/ErrorBoundary'

const queryClient = new QueryClient()

function Notifications() {
  const { notifications, dismissNotification } = useAppState()
  if (!notifications.length) return null
  return (
    <div className="toast-container">
      {notifications.map(n => (
        <div key={n.id} className={`toast toast-${n.type}`} onClick={() => dismissNotification(n.id)}>
          <div className="toast-head">
            <span className="toast-title">{n.title}</span>
            <span className="toast-time">{n.time}</span>
          </div>
          <span className="toast-msg">{n.message}</span>
        </div>
      ))}
    </div>
  )
}

function Page() {
  const { activeTab } = useAppState()

  return (
    <div className="page">
      <Navbar />
      <div className="page-body">
        <ErrorBoundary>
          {activeTab === 'Markets' && (
            <div className="tab-layout">
              <MarketsView />
              <div className="tv-panel">
                <TradingViewWidget />
              </div>
            </div>
          )}
          {activeTab === 'Swap' && <SwapView />}
          {activeTab === 'Portfolio' && <PortfolioView />}
          {activeTab === 'History' && <HistoryView />}
        </ErrorBoundary>
      </div>
      <Notifications />
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider initialChain={arcTestnet}>
          <AppProvider>
            <Page />
          </AppProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
