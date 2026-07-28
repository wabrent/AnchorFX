import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { http } from 'wagmi'
import { arcTestnet as _arcTestnet } from 'viem/chains'

const VERCEL_URL = import.meta.env.VITE_VERCEL_URL || 'https://arcfx-app.vercel.app'

export const arcTestnet = {
  ..._arcTestnet,
  rpcUrls: {
    ..._arcTestnet.rpcUrls,
    default: { http: [`${VERCEL_URL}/api/rpc`] },
  },
}

export const USDC_ADDRESS = '0x3600000000000000000000000000000000000000'
export const EURC_ADDRESS = '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a'

import { ANCHOR_FX_ROUTER_ABI } from './abis'

export const ANCHOR_FX_ROUTER_ADDRESS = '0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8'
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
