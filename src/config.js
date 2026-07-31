import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { http } from 'wagmi'

export const arcTestnet = {
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://arcfx-app.vercel.app/api/rpc'] },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' },
  },
  testnet: true,
}

export const USDC_ADDRESS = '0x3600000000000000000000000000000000000000'
export const EURC_ADDRESS = '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a'
export const USYC_ADDRESS = '0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C'

import { ANCHOR_FX_ROUTER_ABI } from './abis'

export const ANCHOR_FX_ROUTER_ADDRESS = '0x9fd6e3907450fbaa2e18be85f8ce8400e45fb087'
export { ANCHOR_FX_ROUTER_ABI }

const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

export const config = getDefaultConfig({
  appName: 'AnchorFX',
  projectId: walletConnectProjectId || '00000000000000000000000000000000',
  chains: [arcTestnet],
  transports: {
    [arcTestnet.id]: http('/api/rpc'),
  },
})
