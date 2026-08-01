# AnchorFX — Institutional FX & Yield Protocol on Arc

**Live: [arcfx-app.vercel.app](https://arcfx-app.vercel.app)**

AnchorFX is a decentralized foreign exchange (FX) and agentic-commerce protocol built on **Arc Network** (Testnet, chainId 5042002). It showcases Arc's unique capabilities: sub-second deterministic finality, stablecoin-native gas (USDC), CCTP cross-chain interoperability, on-chain price oracles, and ERC-8183 agentic escrow.

---

## Features

| Feature | Tab | What it demonstrates |
|---------|-----|----------------------|
| **Finality Monitor** | Markets | Live block-time chart showing Arc's `<1s` deterministic finality |
| **Multi-asset Swap** | Swap | USDC / EURC / USYC swaps against a real on-chain router with Pyth oracle pricing |
| **Router Liquidity** | Swap | Deposit USDC/EURC/USYC into the router to enable swaps (auto-refresh) |
| **CCTP Bridge** | Bridge | Cross-chain USDC: Ethereum Sepolia / Base Sepolia → Arc (domain 26) |
| **AI Agents (ERC-8183)** | Agents | Agentic escrow: create job → set budget → fund → submit → complete with USDC settlement |
| **Portfolio** | Portfolio | Real balances of USDC / EURC / USYC + total value in USD |
| **Trade History** | History | On-chain confirmed swaps with ArcScan links |

---

## Demo Walkthrough

### 1. Connect wallet

1. Open [arcfx-app.vercel.app](https://arcfx-app.vercel.app)
2. Click **Connect** → pick MetaMask / OKX / WalletConnect
3. Accept the network switch to **Arc Testnet** (chainId 5042002, RPC auto-configured via Vercel proxy)
4. Get testnet USDC + EURC from [faucet.circle.com](https://faucet.circle.com) (select **Arc Testnet**)

> ⚠️ If your wallet already has "Arc Testnet" from another source, delete that network first and reconnect — the app adds the correct RPC (`https://arcfx-app.vercel.app/api/rpc`) automatically.

### 2. Swap (USDC ↔ EURC ↔ USYC)

1. Go to **Swap** tab
2. Pick token pair (default USDC → EURC). Rate comes from the **Pyth oracle** (● Pyth Oracle indicator)
3. Enter amount. Set slippage (0.1–3%)
4. First time: click **Approve USDC** → confirm in wallet
5. Click **Swap USDC → EURC** → confirm
6. Green toast **"Swap Confirmed"** = transaction settled on-chain (sub-second finality)
7. Verify: **Portfolio** balances updated, **History** shows the trade, **ArcScan** link opens

> If the router lacks liquidity for your pair, use the **Router Liquidity** panel to deposit the output token first, then swap.

### 3. Bridge USDC to Arc (CCTP)

1. Get USDC on **Ethereum Sepolia** ([Circle faucet](https://faucet.circle.com), network = Ethereum Sepolia) + a bit of **Sepolia ETH** for gas (e.g. [Alchemy Sepolia faucet](https://sepoliafaucet.com))
2. Open **Bridge** tab
3. Select **Ethereum Sepolia** (or Base Sepolia)
4. Enter USDC amount → click **Switch to Ethereum Sepolia** → confirm in wallet
5. Click **Approve USDC** → confirm
6. Click **Bridge → Arc** → confirm
7. CCTP burns USDC on Sepolia, mints it on Arc after attestation (typically <1 min)
8. Check your USDC balance on **Portfolio** (Arc tab / switch back to Arc)

### 4. AI Agents (ERC-8183 escrow)

Flow: **Create Job → Set Budget → Approve + Fund → Submit → Complete**

1. Go to **Agents** tab
2. In "Provider address" put a second wallet address (you'll need it for the submit step)
3. Click **Create Job** → confirm → note the **Job ID** from ArcScan (or type a known ID)
4. Enter **Budget USDC** → **Set Budget**
5. **Approve USDC** (for escrow) → then **Fund Escrow**
6. Switch wallet to the provider role → **Submit** (deliverable string is hashed on-chain)
7. Switch back to client/evaluator → **Complete** → escrow settles to provider

The job status card shows the ERC-8183 state: `Open → Funded → Submitted → Completed`.

---

## Architecture

```
User Wallet (MetaMask/OKX)
    │
    ▼
WagmiProvider + QueryClientProvider + RainbowKitProvider
    │
    ▼
AppProvider (useAppState: tabs, notifications, selectedPair)
    │
    ▼
Page → Navbar + ErrorBoundary + Views + Toasts + Footer

Views:
  Markets   → Binance 24h prices + TradingView + FinalityMonitor (block times)
  Swap      → Pyth oracle rate + AnchorFXRouter.swapFX + Router Liquidity panel
  Bridge    → CCTP TokenMessenger.depositForBurn (Sepolia/Base → Arc, domain 26)
  Agents    → ERC-8183 AgenticCommerce contract (0x0747...e4583)
  Portfolio → useTokenBalance polling (USDC/EURC/USYC)
  History   → localStorage trades (only after receipt.status === 'success')

Data paths:
  Read   → Vercel proxy /api/rpc → rpc.drpc.testnet.arc.io
  Write  → wallet connector (RPC from chain config = https://arcfx-app.vercel.app/api/rpc)
  Rates  → Pyth Hermes API (EUR/USD feed)
```

### Key files

- `contracts/AnchorFXRouter.sol` — FX swap router (pool-style: takes tokenIn, pays tokenOut from its balance)
- `src/config.js` — chains (Arc/Sepolia/Base), token & CCTP addresses, wagmi config
- `src/abis.js` — ERC-20, AnchorFXRouter, TokenMessenger, AgenticCommerce ABIs
- `scripts/deploy.mjs` — compile + deploy AnchorFXRouter via solc + viem
- `scripts/fund.mjs` — send USDC/EURC to the router (liquidity)
- `src/hooks/useTokenBalance.js` — polling balance hook (5s + refresh event)
- `src/hooks/usePythRate.js` — Pyth Hermes oracle rate (EUR/USD)
- `src/components/views/FinalityMonitor.jsx` — Arc finality visualization

---

## Deployed Contracts (Arc Testnet)

| Contract | Address |
|----------|---------|
| **AnchorFXRouter** | `0x9fd6e3907450fbaa2e18be85f8ce8400e45fb087` |
| USDC (native precompile, ERC-20 view 6 dec) | `0x3600000000000000000000000000000000000000` |
| EURC (ERC-20, 6 dec) | `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a` |
| USYC (ERC-20, 6 dec) | `0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C` |
| AgenticCommerce (ERC-8183 ref impl) | `0x0747EEf0706327138c69792bF28Cd525089e4583` |
| CCTP TokenMessengerV2 (Arc) | `0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA` |
| Pyth (Arc Testnet) | `0x2880aB155794e7179c9eE2e38200202908C17B43` |

**Router liquidity** (needed for swaps): `10 USDC + 10 EURC` at time of writing.

---

## Arc Testnet Specifics

- **Native token = USDC** (18 dec at EVM level, 6 dec ERC-20 view at `0x3600...0000`)
- USDC native balance and ERC-20 `balanceOf` are the **same pool** — never double-count
- **Gas is paid in USDC**; `maxFeePerGas >= 20 gwei` required
- `estimateGas` can fail on the USDC precompile → always pass explicit `gas`
- **CORS**: Arc RPCs block browser calls → proxied via `vercel.json` (`/api/rpc` → dRPC)
- Wallet RPC must be an absolute URL the wallet can reach → chain config points to `https://arcfx-app.vercel.app/api/rpc`

---

## Local Development

```bash
git clone https://github.com/wabrent/AnchorFX.git
cd AnchorFX
npm install --legacy-peer-deps

# dev server (proxies /api/rpc to dRPC via vite.config.js)
npm run dev

# production build + preview
npm run build
npm run preview
```

### Environment

Copy `.env.example` → `.env`:

```bash
# WalletConnect (required for WalletConnect/QR login)
VITE_WALLETCONNECT_PROJECT_ID=your_project_id

# Vercel deployment URL (used as the wallet-facing RPC endpoint)
VITE_VERCEL_URL=https://arcfx-app.vercel.app
```

### Deploying / funding the router

```bash
# Deploy AnchorFXRouter (reads PRIVATE_KEY from .env)
npm run deploy:router

# Send liquidity to the router: node scripts/fund.mjs <amount> [usdc|eurc]
node scripts/fund.mjs 10        # 10 USDC
node scripts/fund.mjs 10 eurc   # 10 EURC
```

### Autonomous AI agent demo

```bash
# Runs a full ERC-8183 job lifecycle with zero human clicks:
# client funds provider -> createJob -> setBudget -> approve+fund -> submit -> complete
npm run agent
```

The agent generates a throwaway provider wallet, funds it with USDC, posts a job,
and settles it — everything signed by code, settled in USDC on Arc.

### Circle Agent Stack alignment

AnchorFX is built to sit alongside Circle's Agent Stack — the agent-facing layer
for autonomous USDC flows:

- **Agent Wallets** — our `npm run agent` demo is a minimal agent wallet: a
  throwaway keypair that holds USDC, funds escrow and settles, with a spending
  cap (the job budget). Replace the raw key with a Circle Agent Wallet for
  gasless, policy-controlled spending.
- **Circle CLI / Skills** — build the agent flows here with the same primitives
  (`circle skill add`, agent-nanopayments) that give AI agents wallets and
  payments. See [developers.circle.com/agent-stack](https://developers.circle.com/agent-stack).
- **Nanopayments (x402)** — the natural next step: let the agent pay per
  request to x402-compatible APIs, gasless, in USDC.
- **ERC-8183** — job escrow is the contract layer beneath the stack, so an
  agent can contract and settle without a human.

Upgrade path: point the agent at a Circle Agent Wallet (with spending policy),
then add x402 nanopayments for service calls — both are drop-in on top of the
existing swap router and CCTP bridge.

---

## Hackathon Submission (Build on Arc)

**Tracks:** DeFi + Agentic Economy (both met).

| Requirement (final checkpoint) | Status |
|--------------------------------|--------|
| Functional MVP deployed on Arc | ✅ `arcfx-app.vercel.app` (AnchorFXRouter live at `0x9fd6...087`) |
| Public code repo | ✅ [github.com/wabrent/AnchorFX](https://github.com/wabrent/AnchorFX) |
| Deck | ✅ `public/slides.html` + `PRESENTATION.md` |
| 3-min video pitch + demo | ✅ Script in `VIDEO_SCRIPT.md` |
| Meaningful Arc + USDC use | ✅ USDC as gas, sub-second finality, CCTP |
| DeFi: swap / FX / liquidity / CCTP | ✅ Router + Pyth oracle + bridge |
| Agentic: agents pay/settle in USDC | ✅ ERC-8183 escrow + autonomous `npm run agent` |

**Useful links**
- App: `https://arcfx-app.vercel.app`
- Deck: `https://arcfx-app.vercel.app/slides.html`
- Connection test: `https://arcfx-app.vercel.app/connect-test.html`
- Contracts: AnchorFXRouter `0x9fd6e3907450fbaa2e18be85f8ce8400e45fb087`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8 |
| Web3 | wagmi v2, viem v2, RainbowKit v2 |
| Oracle | Pyth Hermes (EUR/USD pull) |
| Cross-chain | CCTP (TokenMessenger, domain 26) |
| Agentic | ERC-8183 (AgenticCommerce) |
| Smart Contracts | Solidity 0.8.20 (solc via npm) |
| RPC Proxy | Vercel rewrites (`vercel.json`) |
| Deploy | Vercel (auto from GitHub `master`) |

---

*AnchorFX is an independent product built on Arc Network. All tokens are testnet — no real value.*
