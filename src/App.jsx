import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { config } from './config'
import { AppProvider, useAppState } from './context/useAppState'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import MarketsView from './components/views/MarketsView'
import PortfolioView from './components/views/PortfolioView'
import HistoryView from './components/views/HistoryView'
import SwapView from './components/views/SwapView'
import TradingViewWidget from './components/views/TradingViewWidget'

const queryClient = new QueryClient()

function Page() {
  const { activeTab } = useAppState()

  return (
    <div className="page">
      <Navbar />
      <div className="page-body">
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
      </div>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <AppProvider>
            <Page />
          </AppProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
