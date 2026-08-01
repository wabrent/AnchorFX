import { createWalletClient, createPublicClient, http, defineChain, parseUnits } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

const RPC = 'https://rpc.drpc.testnet.arc.io'
const USDC = '0x3600000000000000000000000000000000000000'
const AMOUNT = process.env.FAUCET_AMOUNT || '5'

const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: { default: { http: [RPC] } },
  testnet: true,
})

// In-memory IP cooldown (per function instance)
const ipClaims = new Map()

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const body = await fetch(`https://rpc.drpc.testnet.arc.io`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{ to: USDC, data: '0x70a08231000000000000000000000000' + (process.env.FAUCET_WALLET || '').toLowerCase().replace('0x', '') }, 'latest'],
          id: 1,
        }),
      }).then(r => r.json())
      const bal = BigInt(body.result || '0x0') / 1000000n
      return res.status(200).json({ balance: bal.toString() })
    } catch {
      return res.status(200).json({ balance: '0' })
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { address } = req.body || {}
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown'

  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return res.status(400).json({ error: 'Invalid wallet address' })
  }

  const pk = process.env.PRIVATE_KEY
  if (!pk) {
    return res.status(500).json({ error: 'Faucet not configured (PRIVATE_KEY missing)' })
  }

  // IP cooldown (10 min)
  const now = Date.now()
  if (ipClaims.has(ip) && now - ipClaims.get(ip) < 600000) {
    return res.status(429).json({ error: 'Try again in a few minutes' })
  }

  const account = privateKeyToAccount(pk)
  const walletClient = createWalletClient({ account, chain: arcTestnet, transport: http(RPC) })
  const publicClient = createPublicClient({ chain: arcTestnet, transport: http(RPC) })

  // 1. Check faucet has USDC
  const faucetBal = await publicClient.readContract({
    address: USDC,
    abi: [{ type: 'function', name: 'balanceOf', inputs: [{ name: 'a', type: 'address' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' }],
    functionName: 'balanceOf',
    args: [account.address],
  })
  const needed = parseUnits(AMOUNT, 6)
  if (faucetBal < needed) {
    return res.status(503).json({ error: 'Faucet is dry. Fund it or try later.' })
  }

  // 2. Daily check via ArcScan: did this address already receive from faucet today?
  try {
    const txRes = await fetch(
      `https://testnet.arcscan.app/api?module=account&action=txlist&address=${account.address}&sort=desc&page=1&offset=5`
    ).then(r => r.json())
    const dayStart = Math.floor(Date.now() / 1000) - (Date.now() % 86400) // 00:00 UTC
    const recent = (txRes.result || []).find(
      t => Number(t.timeStamp) >= dayStart && t.to?.toLowerCase() === address.toLowerCase() && Number(t.value) > 0
    )
    if (recent) {
      return res.status(429).json({ error: 'Already claimed today. Resets at 00:00 UTC.' })
    }
  } catch {
    // if ArcScan is unavailable, skip the check (still allow)
  }

  // 3. Send USDC
  try {
    const hash = await walletClient.writeContract({
      address: USDC,
      abi: [{ type: 'function', name: 'transfer', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'nonpayable' }],
      functionName: 'transfer',
      args: [address, needed],
      gas: 200000n,
      maxFeePerGas: 20000000000n,
      maxPriorityFeePerGas: 1000000000n,
    })
    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    if (receipt.status !== 'success') {
      return res.status(500).json({ error: 'Transfer failed on-chain' })
    }
    ipClaims.set(ip, now)
    return res.status(200).json({ ok: true, hash, amount: AMOUNT })
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Send failed' })
  }
}
