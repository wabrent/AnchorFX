import { createConfig, http } from 'wagmi'
import { injected, coinbaseWallet, walletConnect } from 'wagmi/connectors'

// Arc Testnet (Circle / Arc Network)
export const arcTestnet = {
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 6 },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.arc.network'] },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' },
  },
  testnet: true,
}

// On Arc Testnet, USDC is the *native* gas token (used for `useBalance({ address })`
// with no token arg) — it also exposes an optional ERC-20 interface at this address
// for tooling that expects a standard ERC-20 (same underlying balance, see Arc docs).
export const USDC_ADDRESS = '0x3600000000000000000000000000000000000000'

// EURC is a regular ERC-20 on Arc Testnet.
export const EURC_ADDRESS = '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a'

// Optional: only needed if you want WalletConnect (mobile QR) support.
// Get a free project id at https://cloud.walletconnect.com and put it in .env as VITE_WALLETCONNECT_PROJECT_ID
const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

const connectors = [
  injected(), // MetaMask and any other browser-injected wallet
  coinbaseWallet({ appName: 'ArcFX' }),
  ...(walletConnectProjectId
    ? [walletConnect({ projectId: walletConnectProjectId, showQrModal: true })]
    : []),
]

export const config = createConfig({
  chains: [arcTestnet],
  connectors,
  transports: {
    [arcTestnet.id]: http(),
  },
})
