# AnchorFX — Institutional FX & Yield Protocol

AnchorFX is a decentralized foreign exchange (FX) and liquidity protocol built on **Arc Network** (Testnet, chainId 5042002). It provides sub-second stablecoin swaps (USDC ↔ EURC) with deterministic finality.

## Architecture

```
arcfx-app/
├── contracts/              # Solidity smart contracts
│   ├── AnchorFXRouter.sol  # FX swap router (deployed)
│   └── ArcPerpVault.sol    # Perpetuals vault (WIP)
├── src/
│   ├── abis.js             # All contract ABIs
│   ├── config.js           # Wagmi/RainbowKit config, chain, token addresses
│   ├── main.jsx            # Entry point
│   ├── App.jsx             # Root: providers, error boundary, notifications, routing
│   ├── index.css           # All styles (~700 lines)
│   ├── components/
│   │   ├── ErrorBoundary.jsx  # React error boundary with fallback UI
│   │   ├── Skeleton.jsx       # Loading skeleton components
│   │   ├── Navbar.jsx         # Top navigation + RainbowKit ConnectButton
│   │   ├── Footer.jsx         # Footer
│   │   └── views/
│   │       ├── MarketsView.jsx       # Live Binance prices + TradingView chart
│   │       ├── SwapView.jsx          # Bi-directional USDC↔EURC swap with slippage
│   │       ├── PortfolioView.jsx     # Real USDC/EURC balances + ArcScan link
│   │       └── HistoryView.jsx       # Local swap history + ArcScan tx links
│   ├── context/
│   │   └── useAppState.jsx    # Tab navigation, selected pair, notifications
│   └── hooks/
│       ├── useUsdcBalance.js  # USDC balance via balanceOf + getBalance
│       ├── useEurcBalance.js  # EURC balance via balanceOf (ERC-20, 18 decimals)
│       └── useRate.js         # Rate fetching hook
└── public/                 # Static assets (favicon, bg image)
```

### Data Flow

```
User Wallet (MetaMask)
    │
    ▼
WagmiProvider + RainbowKitProvider
    │
    ▼
AppProvider (useAppState: activeTab, notifications, selectedPair)
    │
    ▼
Page → Navbar + ErrorBoundary + Views + Notifications + Footer
    │
    ▼
Views read data via:
  - useUsdcBalance / useEurcBalance  → Arc RPC (via Vercel proxy /api/rpc)
  - Binance API                       → Live EUR/USD rate
  - TradingView widget                → Embedded chart
  - localStorage                      → Trade/order history (client-side)
    │
    ▼
Views write data via:
  - useWriteContract                  → On-chain swap/approve transactions
  - localStorage                      → Trade records after on-chain confirmation
```

### Swap Flow

1. User enters amount + selects direction (USDC→EURC or EURC→USDC)
2. Rate fetched from Binance API (refreshes every 15s)
3. Slippage tolerance applied (0.1% / 0.5% / 1% / 3%)
4. User clicks **Approve** → ERC-20 `approve(router, maxUint256)` on-chain
5. After approval confirmed, user clicks **Swap**
6. `AnchorFXRouter.swapFX(tokenIn, tokenOut, amountIn, minAmountOut, exchangeRate)` executes:
   - Deducts 0.05% protocol fee
   - Calls `IERC20(tokenIn).transferFrom(user, router, amountIn)`
   - Calls `IERC20(tokenOut).transfer(user, amountOut)`
7. Trade saved to localStorage + ArcScan link shown

## Deployed Contracts

| Contract | Network | Address |
|----------|---------|---------|
| AnchorFXRouter | Arc Testnet (5042002) | `0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8` |
| USDC (native precompile) | Arc Testnet | `0x3600000000000000000000000000000000000000` |
| EURC (ERC-20) | Arc Testnet | `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a` |

### AnchorFXRouter.sol

- **swapFX(tokenIn, tokenOut, amountIn, minAmountOut, exchangeRate)** — Executes atomic stablecoin swap with:
  - 0.05% protocol fee (configurable by owner, max 0.5%)
  - Slippage protection via `minAmountOut`
  - Events: `AnchorSwapped`, `LiquidityAdded`
- **setFee(_feeBps)** — Owner-only fee adjustment

## Arc Testnet Specifics

- **Native token = USDC** (6 decimals in UI, 18 decimals at EVM level via `eth_getBalance`)
- **USDC precompile** at `0x3600...0000` provides ERC-20 interface (`balanceOf`, `transferFrom`, `approve`)
- **EURC** is a standard ERC-20 at `0x89B5...D72a` with 6 decimals
- **Gas** is paid in USDC (native token)
- **CORS**: Arc RPC blocks browser requests from Vercel. Solved via `vercel.json` proxy (`/api/rpc` → `rpc.drpc.testnet.arc.io`)

## Quick Start

### Prerequisites

- Node.js 18+
- MetaMask browser extension
- USDC on Arc Testnet ([faucet](https://testnet.arc.network))

### Install & Run

```bash
git clone https://github.com/wabrent/AnchorFX.git
cd AnchorFX

# Install dependencies (RainbowKit needs --legacy-peer-deps)
npm install --legacy-peer-deps

# Start dev server
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env`:
```bash
# Required for WalletConnect (QR code login)
VITE_WALLETCONNECT_PROJECT_ID=your_project_id

# Optional: override Arc RPC URL
VITE_ARC_RPC_URL=https://rpc.drpc.testnet.arc.io
```

### Build & Deploy

```bash
npm run build    # Vite production build → dist/
npm run preview  # Preview production build locally
```

The project deploys automatically to Vercel from the `master` branch.

## Deploying Contracts

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Deploy to Arc Testnet
forge create contracts/AnchorFXRouter.sol:AnchorFXRouter \
  --rpc-url https://rpc.drpc.testnet.arc.io \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --legacy

# Verify on ArcScan
forge verify-contract \
  --rpc-url https://rpc.drpc.testnet.arc.io \
  --verifier blockscout \
  --verifier-url https://testnet.arcscan.app/api \
  0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8 \
  contracts/AnchorFXRouter.sol:AnchorFXRouter
```

## Testing

```bash
# Lint
npm run lint

# Build check
npm run build

# Manual test flow:
# 1. Connect MetaMask to Arc Testnet (chainId 5042002)
# 2. Get USDC from faucet
# 3. Go to Swap tab → Enter amount → Approve → Swap
# 4. Check Portfolio for updated balances
# 5. Check History for transaction records
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8 |
| Web3 | wagmi v3, viem v2, RainbowKit v2 |
| Styling | CSS (no framework) |
| Oracles | Binance API (rate), on-chain (`balanceOf`) |
| RPC Proxy | Vercel rewrites (`vercel.json`) |
| Smart Contracts | Solidity 0.8.20, Foundry |

## Live Demo

**[anchor-fx-self.vercel.app](https://anchor-fx-self.vercel.app)**

---

*Disclaimer: AnchorFX is an independent product built on Arc Network in accordance with Circle Brand Guidelines.*
