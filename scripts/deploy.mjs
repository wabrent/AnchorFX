import { readFileSync, existsSync } from 'node:fs'
import { createWalletClient, createPublicClient, http, defineChain } from 'viem'
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
if (!pk) {
  console.error('ERROR: Set PRIVATE_KEY in .env (the wallet that holds USDC for gas)')
  process.exit(1)
}

const source = readFileSync(new URL('../contracts/AnchorFXRouter.sol', import.meta.url), 'utf8')

const solc = (await import('solc')).default
const input = {
  language: 'Solidity',
  sources: { 'AnchorFXRouter.sol': { content: source } },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object'] } },
  },
}

const output = JSON.parse(solc.compile(JSON.stringify(input)))
if (output.errors) {
  const fatal = output.errors.filter(e => e.severity === 'error')
  if (fatal.length) {
    console.error('Compilation errors:', fatal.map(e => e.formattedMessage).join('\n'))
    process.exit(1)
  }
}

const artifact = output.contracts['AnchorFXRouter.sol'].AnchorFXRouter
const bytecode = artifact.evm.bytecode.object
const abi = artifact.abi

const account = privateKeyToAccount(pk)
const walletClient = createWalletClient({ account, chain: arcTestnet, transport: http(RPC) })
const publicClient = createPublicClient({ chain: arcTestnet, transport: http(RPC) })

console.log('Deploying AnchorFXRouter from', account.address)
const hash = await walletClient.deployContract({
  abi,
  bytecode: `0x${bytecode}`,
  args: [],
  gas: 2000000n,
  maxFeePerGas: 20000000000n,
  maxPriorityFeePerGas: 1000000000n,
})
console.log('Deploy tx:', hash)

const receipt = await publicClient.waitForTransactionReceipt({ hash })
console.log('Router deployed at:', receipt.contractAddress)
console.log('Update ANCHOR_FX_ROUTER_ADDRESS in src/config.js to this address.')
