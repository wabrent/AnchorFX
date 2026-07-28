import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { http } from 'wagmi'

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

export const USDC_ADDRESS = '0x3600000000000000000000000000000000000000'
export const EURC_ADDRESS = '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a'

export const ANCHOR_FX_ROUTER_ADDRESS = '0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8'

export const ANCHOR_FX_ROUTER_ABI = [
  {
    type: 'function',
    name: 'swapFX',
    inputs: [
      { name: 'tokenIn', type: 'address' },
      { name: 'tokenOut', type: 'address' },
      { name: 'amountIn', type: 'uint256' },
      { name: 'minAmountOut', type: 'uint256' },
      { name: 'exchangeRate', type: 'uint256' },
    ],
    outputs: [{ name: 'amountOut', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
]

const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

export const config = getDefaultConfig({
  appName: 'AnchorFX',
  projectId: walletConnectProjectId || '00000000000000000000000000000000',
  chains: [arcTestnet],
  transports: {
    [arcTestnet.id]: http('https://rpc.testnet.arc.network'),
  },
})
