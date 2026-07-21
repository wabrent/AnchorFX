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

// FXSwap contract — deploy via contracts/FXSwap.sol then paste the address here
export const FXSWAP_ADDRESS = '0x...' // TODO: replace after deployment

// ArcFXRouter — deploy contracts/ArcFXRouter.sol then paste the address here
export const ARC_FX_ROUTER_ADDRESS = '0x1234567890123456789012345678901234567890' // TODO: replace

export const ARC_FX_ROUTER_ABI = [
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
  {
    type: 'function',
    name: 'addLiquidity',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
]

export const FXSWAP_ABI = [
  {
    name: 'swapUsdcToEurc',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'usdcAmount', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'swapEurcToUsdc',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'eurcAmount', type: 'uint256' }],
    outputs: [],
  },
]

export const config = createConfig({
  chains: [arcTestnet],
  connectors,
  transports: {
    [arcTestnet.id]: http(),
  },
})
