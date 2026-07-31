import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { http } from 'wagmi'
import { sepolia, baseSepolia } from 'viem/chains'

export const arcTestnet = {
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://arcfx-app.vercel.app/api/rpc'] },
    public: { http: ['https://arcfx-app.vercel.app/api/rpc'] },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' },
  },
  testnet: true,
}

export const USDC_ADDRESS = '0x3600000000000000000000000000000000000000'
export const EURC_ADDRESS = '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a'
export const USYC_ADDRESS = '0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C'

export const ARC_CCTP_DOMAIN = 26

// Source chains for CCTP bridging (USDC testnet)
export const BRIDGE_SOURCES = {
  sepolia: {
    chain: sepolia,
    name: 'Ethereum Sepolia',
    usdc: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    tokenMessenger: '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5',
    domain: 0,
    rpc: 'https://rpc.ankr.com/eth_sepolia',
  },
  baseSepolia: {
    chain: baseSepolia,
    name: 'Base Sepolia',
    usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    tokenMessenger: '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5',
    domain: 6,
    rpc: 'https://sepolia.base.org',
  },
}

import { ANCHOR_FX_ROUTER_ABI } from './abis'

export const ANCHOR_FX_ROUTER_ADDRESS = '0x9fd6e3907450fbaa2e18be85f8ce8400e45fb087'
export { ANCHOR_FX_ROUTER_ABI }

const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

const transports = {
  [arcTestnet.id]: http('/api/rpc'),
  [sepolia.id]: http('https://rpc.ankr.com/eth_sepolia'),
  [baseSepolia.id]: http('https://sepolia.base.org'),
}

export const config = getDefaultConfig({
  appName: 'AnchorFX',
  projectId: walletConnectProjectId || '00000000000000000000000000000000',
  chains: [arcTestnet, sepolia, baseSepolia],
  transports,
})
