import { readFileSync, existsSync } from 'node:fs'
import { createWalletClient, createPublicClient, http, defineChain, parseUnits } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

const RPC = 'https://rpc.drpc.testnet.arc.io'
const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: { default: { http: [RPC] } },
  testnet: true,
})

if (existsSync('.env')) {
  for (const line of readFileSync('.env', 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/)
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}

const pk = process.env.PRIVATE_KEY
if (!pk) { console.error('No PRIVATE_KEY in .env'); process.exit(1) }

const USDC = '0x3600000000000000000000000000000000000000'
const ROUTER = '0x9fd6e3907450fbaa2e18be85f8ce8400e45fb087'
const AMOUNT = process.argv[2] || '10'

const account = privateKeyToAccount(pk)
const walletClient = createWalletClient({ account, chain: arcTestnet, transport: http(RPC) })
const publicClient = createPublicClient({ chain: arcTestnet, transport: http(RPC) })

console.log('Sending', AMOUNT, 'USDC from', account.address, 'to router', ROUTER)
const hash = await walletClient.writeContract({
  address: USDC,
  abi: [{ type: 'function', name: 'transfer', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'nonpayable' }],
  functionName: 'transfer',
  args: [ROUTER, parseUnits(AMOUNT, 6)],
  gas: 200000n,
  maxFeePerGas: 20000000000n,
  maxPriorityFeePerGas: 1000000000n,
})
console.log('Tx:', hash)
const receipt = await publicClient.waitForTransactionReceipt({ hash })
console.log('Status:', receipt.status)
