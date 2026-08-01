# AnchorFX — Video Pitch Script (3 minutes)

Target: 3:00 total. Format: voiceover + screen recording of live app.

---

## [0:00–0:15] Hook

"Every FX trade and cross-border payment today moves through banks, waits days to settle, and costs real money. AI agents can't even pay for services without a human. AnchorFX fixes both — on Arc, where USDC is the money layer and settlement takes less than a second."

## [0:15–0:40] Problem + Solution (over app overview)

"AnchorFX is a stablecoin-native platform for two things: FX swaps and agentic commerce. Everything settles in USDC, the native gas token of Arc. No volatile token. Sub-second finality."

Show: app loading, dark UI, tabs visible (Markets, Swap, Bridge, Agents, News).

## [0:40–1:10] Demo 1 — Swap (DeFi track)

"This is the swap. USDC to EURC, priced by the Pyth on-chain oracle — not a centralized API. I set the amount, slippage protection is on. One click approve, one click swap."

Action: Connect wallet, USDC→EURC swap, show green "Swap Confirmed" toast. Point to Finality Monitor: "Settlement confirmed on-chain — watch the blocks land in under a second."

## [1:10–1:40] Demo 2 — Bridge (CCTP)

"Cross-chain is native here. This bridge moves USDC from Ethereum Sepolia or Base Sepolia straight into Arc through Circle's CCTP. Approve, bridge, and the tokens arrive on Arc after attestation. Arc becomes the settlement hub between EVM ecosystems."

Action: Bridge tab, pick Sepolia, show flow. (Optional live bridge.)

## [1:40–2:20] Demo 3 — Agents (Agentic Economy track)

"This is the part for the agentic economy. AnchorFX implements ERC-8183 — job escrow that AI agents can use without a human. Create a job, set a budget, fund it with USDC. A provider agent submits a deliverable. The evaluator — another agent, or a client — completes it. Escrow settles automatically."

Action: Agents tab, create job, show status transitions Open → Funded → Submitted → Completed. Emphasize: "The agent holds the wallet, pays, and settles entirely in USDC."

## [2:20–2:45] Architecture + why it matters

"One router contract, one oracle, one bridge, one escrow standard — deployed on Arc Testnet, code open on GitHub, front end live. The contracts are real, not mockups."

Action: quick scroll through repo / contracts / deploy script.

## [2:45–3:00] Close

"Arc is the stablecoin-native chain that makes this simple: USDC gas, deterministic finality, native CCTP. AnchorFX shows what becomes possible — FX and agents settling in dollars, onchain, in real time. Thanks for watching. Links in the description."

---

## Production notes
- Record 1080p, browser fullscreen, the app's dark UI reads well on camera
- Add subtle background music, no vocals
- Caption the key words: "sub-second finality", "Pyth oracle", "CCTP", "ERC-8183"
- Keep the Pyth Oracle indicator, green toasts, and Finality Monitor visible — they are the visual proof
- Total live-action time ~2 min, screenshots/b-roll for the rest
