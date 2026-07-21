import { useState } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './config'
import { useWallet } from './hooks/useWallet'
import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { SwapCard } from './components/SwapCard'
import { Features } from './components/Features'
import { Subscriptions } from './components/Subscriptions'
import { Footer } from './components/Footer'
import { WalletModal } from './components/WalletModal'
import ArcFXTerminal from './components/ArcFXTerminal'

const queryClient = new QueryClient()

function Site() {
  const wallet = useWallet()
  const [modalOpen, setModalOpen] = useState(false)

  if (modalOpen && wallet.isConnected) setModalOpen(false)

  return (
    <div className="page">
      <Nav wallet={wallet} onOpenModal={() => setModalOpen(true)} />
      <Hero />
      <SwapCard wallet={wallet} onOpenModal={() => setModalOpen(true)} />
      <Features />
      <ArcFXTerminal />
      <Subscriptions wallet={wallet} onOpenModal={() => setModalOpen(true)} />
      <Footer />
      {modalOpen && <WalletModal wallet={wallet} onClose={() => setModalOpen(false)} />}
    </div>
  )
}

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Site />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
