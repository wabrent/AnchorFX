# AnchorFX — Hackathon Presentation (Google Slides / PowerPoint)

## Slide 1 — Title
- Title: **AnchorFX**
- Subtitle: Institutional FX & Agentic Commerce on Arc Network
- Arc Testnet (chainId 5042002) · USDC native gas · Sub-second finality
- Tracks: DeFi + Agentic Economy
- Link: arcfx-app.vercel.app (in description)

## Slide 2 — Problem
- FX and payment flows are locked to bank T+2 and centralized intermediaries
- AI agents cannot contract and settle on their own without a human in the loop
- Stablecoins exist, but there is no single native layer for FX + agentic commerce
- Bullets: slow, expensive, not composable

## Slide 3 — Solution
- AnchorFX is a single layer for stablecoin FX and agent settlement on Arc
- USDC/EURC swaps on an on-chain router priced by the Pyth oracle
- Cross-chain USDC via CCTP (domain 26)
- Escrow for AI agents using the ERC-8183 standard
- Everything in USDC: gas, pricing, settlement

## Slide 4 — Why Arc
- USDC as native gas - predictable dollar-denominated fees
- Deterministic finality in under a second
- Native CCTP integration and Circle ecosystem access
- Stablecoin-native design: no volatile gas token

## Slide 5 — DeFi: FX Swap
- AnchorFXRouter (live on testnet: 0x9fd6...087)
- USDC <-> EURC, slippage protection, 0.05% protocol fee, deadline
- Prices from a Pyth pull oracle (not a centralized API)
- Liquidity: deposit panel built into the app
- Live Finality Monitor shows settlement under 1 second

## Slide 6 — DeFi: CCTP Bridge
- USDC bridge: Ethereum Sepolia / Base Sepolia -> Arc via Circle TokenMessenger
- Real burn-and-mint on domain 26
- Approve -> Bridge flow, status after attestation
- Showcases Arc cross-chain interoperability

## Slide 7 — Agentic Economy: ERC-8183
- Escrow for AI agents on Circle's deployed reference contract (0x0747...4583)
- Flow: create job -> set budget -> approve + fund escrow -> submit deliverable -> complete -> settle in USDC
- Agent = provider, client = evaluator
- Full lifecycle without a human in the middle

## Slide 8 — Architecture
- Frontend: React 19, wagmi v3, viem v2, RainbowKit
- Smart contracts: Solidity 0.8.20 (solc)
- Oracle: Pyth Hermes (pull)
- Cross-chain: CCTP TokenMessenger
- Deploy: Vercel + /api/rpc proxy (CORS bypass)

## Slide 9 — Demo (live)
1. Connect wallet to Arc
2. Swap USDC -> EURC (Pyth rate, green "Confirmed" toast)
3. Finality Monitor - blocks under 1 second
4. Bridge Sepolia -> Arc (real tokens)
5. Agents - create and close an ERC-8183 job
6. News - live network stats

## Slide 10 — Roadmap
- Now: USDC/EURC swap, CCTP bridge, ERC-8183 escrow
- Next: USYC as a yield asset, deeper agent hooks, limit orders
- Mainnet readiness: in-contract oracle, signed rates, audit

## Slide 11 — Thank You / Contacts
- Thank you for watching
- Project link (in description/bio)
- Open to feedback from the Arc community

---

### Style tips
- Dark background, green->blue gradient accents (same as the site)
- Minimal text per slide, more visuals (screenshots of Swap / Bridge / Agents tabs)
- Slides 5-9 - show a live demo instead of static images
- Emphasize: "contracts are really deployed, not mockups"
