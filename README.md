# AnchorFX — Decentralized FX & Yield Protocol

AnchorFX is an institutional-grade foreign exchange and liquidity protocol built on Arc Network.

Stablecoin FX demo on Arc Testnet (USDC <-> EURC), built with React + Vite + wagmi.

## What actually works

- Real wallet connect - MetaMask (or any injected browser wallet) and Coinbase Wallet connect for real via wagmi. WalletConnect (QR/mobile) also works once you add a free project id (see below).
- Real balances - USDC (Arc's native gas token) and EURC (ERC-20) balances are read live from Arc Testnet via useBalance.
- Real network handling - detects if you're on the wrong chain and prompts a one-click switch/add of Arc Testnet.
- Swap UI - fully interactive rate calculator with live balance display.
- AnchorFX Terminal - on-chain swap execution via the AnchorFXRouter contract.
- Analytics/ticker/subscription numbers are illustrative demo data, labeled as such.

## Getting started

    npm install
    npm run dev

Open the printed local URL. Install MetaMask (metamask.io) and get testnet USDC/EURC from the Circle faucet (faucet.circle.com, select Arc Testnet) to see real balances.

### Optional: enable WalletConnect

1. Create a free project at https://cloud.walletconnect.com
2. Copy .env.example to .env and paste your project id into VITE_WALLETCONNECT_PROJECT_ID

## Build & deploy

    npm run build

Outputs a static site in dist/ - deploy as-is to Vercel, Netlify, etc. On Vercel: framework preset "Vite", build command "npm run build", output directory "dist".

## Network details (Arc Testnet)

- Chain ID: 5042002
- RPC: https://rpc.testnet.arc.network
- Explorer: https://testnet.arcscan.app
- USDC (native gas token): 0x3600000000000000000000000000000000000000
- EURC (ERC-20): 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a

## Smart contracts

- `contracts/AnchorFXRouter.sol` — Institutional FX Swap Router
- `contracts/FXSwap.sol` — Basic USDC/EURC swap contract

## Project structure

    src/
      config.js               wagmi config: Arc Testnet chain + connectors
      hooks/useWallet.js      wallet state: connect, disconnect, balances, network switch
      hooks/useRate.js        live FX rate polling
      components/
        Nav.jsx               top bar incl. connect/disconnect
        WalletModal.jsx       MetaMask / WalletConnect / Coinbase picker
        Hero.jsx              ticker + hero + stats (demo data)
        SwapCard.jsx          interactive swap UI with real balances
        AnchorFXTerminal.jsx  on-chain swap execution terminal
        Features.jsx          feature grid + supported chains
        Subscriptions.jsx     pricing tiers (UI preview only)
        Footer.jsx
