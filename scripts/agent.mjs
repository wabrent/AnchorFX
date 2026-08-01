import { readFileSync, existsSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import {
  createWalletClient,
  createPublicClient,
  http,
  defineChain,
  parseUnits,
  keccak256,
  stringToHex,
  zeroAddress,
} from 'viem'
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

const AGENTIC = '0x0747EEf0706327138c69792bF28Cd525089e4583'
const USDC = '0x3600000000000000000000000000000000000000'
const JOB_BUDGET = parseUnits('2', 6)

const erc20 = [
  { type: 'function', name: 'approve', inputs: [{ name: 's', type: 'address' }, { name: 'a', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'transfer', inputs: [{ name: 'to', type: 'address' }, { name: 'a', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'nonpayable' },
]
const agenticAbi = [
  { type: 'function', name: 'createJob', stateMutability: 'nonpayable', inputs: [
    { name: 'provider', type: 'address' }, { name: 'evaluator', type: 'address' },
    { name: 'expiredAt', type: 'uint256' }, { name: 'description', type: 'string' }, { name: 'hook', type: 'address' }],
    outputs: [{ name: 'jobId', type: 'uint256' }] },
  { type: 'function', name: 'setBudget', stateMutability: 'nonpayable', inputs: [
    { name: 'jobId', type: 'uint256' }, { name: 'amount', type: 'uint256' }, { name: 'optParams', type: 'bytes' }], outputs: [] },
  { type: 'function', name: 'fund', stateMutability: 'nonpayable', inputs: [
    { name: 'jobId', type: 'uint256' }, { name: 'optParams', type: 'bytes' }], outputs: [] },
  { type: 'function', name: 'submit', stateMutability: 'nonpayable', inputs: [
    { name: 'jobId', type: 'uint256' }, { name: 'deliverable', type: 'bytes32' }, { name: 'optParams', type: 'bytes' }], outputs: [] },
  { type: 'function', name: 'complete', stateMutability: 'nonpayable', inputs: [
    { name: 'jobId', type: 'uint256' }, { name: 'reason', type: 'bytes32' }, { name: 'optParams', type: 'bytes' }], outputs: [] },
  { type: 'function', name: 'getJob', stateMutability: 'view', inputs: [{ name: 'jobId', type: 'uint256' }], outputs: [{
    type: 'tuple', components: [
      { name: 'id', type: 'uint256' }, { name: 'client', type: 'address' }, { name: 'provider', type: 'address' },
      { name: 'evaluator', type: 'address' }, { name: 'description', type: 'string' }, { name: 'budget', type: 'uint256' },
      { name: 'expiredAt', type: 'uint256' }, { name: 'status', type: 'uint8' }, { name: 'hook', type: 'address' }] }] },
]
const STATUS = ['Open', 'Funded', 'Submitted', 'Completed', 'Rejected', 'Expired']

const publicClient = createPublicClient({ chain: arcTestnet, transport: http(RPC) })
const clientAcc = privateKeyToAccount(pk)
const clientWallet = createWalletClient({ account: clientAcc, chain: arcTestnet, transport: http(RPC) })

async function send(tag, w, config) {
  const h = await w.writeContract({ chain: arcTestnet, gas: 300000n, maxFeePerGas: 20000000000n, maxPriorityFeePerGas: 1000000000n, ...config })
  const r = await publicClient.waitForTransactionReceipt({ hash: h })
  if (r.status !== 'success') throw new Error(tag + ' reverted')
  console.log(`  ${tag} ok ${h}`)
  return r
}

async function main() {
  console.log('== AI Agent: autonomous ERC-8183 job lifecycle ==\n')

  const providerPk = '0x' + randomBytes(32).toString('hex')
  const providerAcc = privateKeyToAccount(providerPk)
  const providerWallet = createWalletClient({ account: providerAcc, chain: arcTestnet, transport: http(RPC) })
  console.log('Agent (client/evaluator):', clientAcc.address)
  console.log('Provider agent:', providerAcc.address)

  console.log('\n1) Client agent funds provider (1 USDC for gas)')
  await send('transfer', clientWallet, { address: USDC, abi: erc20, functionName: 'transfer', args: [providerAcc.address, parseUnits('1', 6)] })

  const block = await publicClient.getBlock()
  const expiredAt = block.timestamp + 3600n
  const description = 'Autonomous task from AnchorFX AI agent'

  console.log('\n2) createJob() - client agent posts the task')
  const createR = await send('createJob', clientWallet, { address: AGENTIC, abi: agenticAbi, functionName: 'createJob', args: [providerAcc.address, clientAcc.address, expiredAt, description, zeroAddress] })
  const jobLog = createR.logs.find(l => {
    const sig = '0x' + keccak256(stringToHex('JobCreated(uint256,address,address,address,uint256,address)')).slice(2)
    return l.topics[0] === sig
  })
  const jobId = jobLog ? BigInt(jobLog.topics[1]) : 1n
  console.log('  Job ID:', jobId.toString())

  console.log('\n3) setBudget() - provider agent sets the price')
  await send('setBudget', providerWallet, { address: AGENTIC, abi: agenticAbi, functionName: 'setBudget', args: [jobId, JOB_BUDGET, '0x'] })

  console.log('\n4) approve() + fund() - client agent funds the escrow')
  await send('approve', clientWallet, { address: USDC, abi: erc20, functionName: 'approve', args: [AGENTIC, JOB_BUDGET] })
  await send('fund', clientWallet, { address: AGENTIC, abi: agenticAbi, functionName: 'fund', args: [jobId, '0x'] })

  console.log('\n5) submit() - provider agent delivers the work')
  const deliverable = keccak256(stringToHex('anchorfx-agent-deliverable'))
  await send('submit', providerWallet, { address: AGENTIC, abi: agenticAbi, functionName: 'submit', args: [jobId, deliverable, '0x'] })

  console.log('\n6) complete() - client/evaluator agent approves and settles')
  const reason = keccak256(stringToHex('deliverable-approved'))
  await send('complete', clientWallet, { address: AGENTIC, abi: agenticAbi, functionName: 'complete', args: [jobId, reason, '0x'] })

  console.log('\n7) Final job state:')
  const job = await publicClient.readContract({ address: AGENTIC, abi: agenticAbi, functionName: 'getJob', args: [jobId] })
  console.log('  Job ID:', job.id.toString())
  console.log('  Status:', STATUS[Number(job.status)])
  console.log('  Budget:', Number(job.budget) / 1e6, 'USDC')
  console.log('  Description:', job.description)
  console.log('\n== Agent finished the job autonomously. All settled in USDC. ==')
}

main().catch(e => { console.error('Agent error:', e.message || e); process.exit(1) })
