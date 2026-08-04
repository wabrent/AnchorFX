import { readFileSync, existsSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import {
  createWalletClient,
  createPublicClient,
  http,
  defineChain,
  keccak256,
  stringToHex,
  parseUnits,
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

const IDENTITY = '0x8004A818BFB912233c491871b3d84c89A494BD9e'
const REPUTATION = '0x8004B663056A597Dffe9eCcC1965A193B7388713'
const VALIDATION = '0x8004Cb1BF31DAf7788923b405b754f57acEB4272'
const USDC = '0x3600000000000000000000000000000000000000'
const METADATA_URI = process.env.AGENT_METADATA_URI || 'ipfs://bafkreibdi6623n3xpf7ymk62ckb4bo75o3qemwkpfvp5i25j66itxvsoei'

const erc20 = [
  { type: 'function', name: 'transfer', inputs: [{ name: 'to', type: 'address' }, { name: 'a', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'nonpayable' },
]
const idAbi = [
  { type: 'function', name: 'register', stateMutability: 'nonpayable', inputs: [{ name: 'metadataURI', type: 'string' }], outputs: [] },
  { type: 'function', name: 'ownerOf', stateMutability: 'view', inputs: [{ name: 'tokenId', type: 'uint256' }], outputs: [{ name: '', type: 'address' }] },
  { type: 'function', name: 'tokenURI', stateMutability: 'view', inputs: [{ name: 'tokenId', type: 'uint256' }], outputs: [{ name: '', type: 'string' }] },
]
const repAbi = [{
  type: 'function', name: 'giveFeedback', stateMutability: 'nonpayable', inputs: [
    { name: 'agentId', type: 'uint256' }, { name: 'score', type: 'int128' }, { name: 'vertical', type: 'uint8' },
    { name: 'tag', type: 'string' }, { name: 'schema', type: 'string' }, { name: 'reference', type: 'string' },
    { name: 'metadata', type: 'string' }, { name: 'feedbackHash', type: 'bytes32' }], outputs: [] }]
const valAbi = [
  { type: 'function', name: 'validationRequest', stateMutability: 'nonpayable', inputs: [
    { name: 'validator', type: 'address' }, { name: 'agentId', type: 'uint256' },
    { name: 'requestURI', type: 'string' }, { name: 'requestHash', type: 'bytes32' }], outputs: [] },
  { type: 'function', name: 'validationResponse', stateMutability: 'nonpayable', inputs: [
    { name: 'requestHash', type: 'bytes32' }, { name: 'response', type: 'uint8' },
    { name: 'schema', type: 'string' }, { name: 'responseHash', type: 'bytes32' }, { name: 'tag', type: 'string' }], outputs: [] },
  { type: 'function', name: 'getValidationStatus', stateMutability: 'view', inputs: [{ name: 'requestHash', type: 'bytes32' }], outputs: [
    { name: 'validatorAddress', type: 'address' }, { name: 'agentId', type: 'uint256' }, { name: 'response', type: 'uint8' },
    { name: 'responseHash', type: 'bytes32' }, { name: 'tag', type: 'string' }, { name: 'lastUpdate', type: 'uint256' }] },
]

const publicClient = createPublicClient({ chain: arcTestnet, transport: http(RPC) })
const ownerAcc = privateKeyToAccount(pk)
const ownerWallet = createWalletClient({ account: ownerAcc, chain: arcTestnet, transport: http(RPC) })

async function send(tag, w, config) {
  const h = await w.writeContract({ chain: arcTestnet, gas: 300000n, maxFeePerGas: 20000000000n, maxPriorityFeePerGas: 1000000000n, ...config })
  const r = await publicClient.waitForTransactionReceipt({ hash: h })
  if (r.status !== 'success') throw new Error(tag + ' reverted')
  console.log(`  ${tag} ok ${h}`)
  return r
}

async function main() {
  console.log('== AI Agent Identity (ERC-8004) ==\n')
  console.log('Owner wallet:', ownerAcc.address)

  const valPk = '0x' + randomBytes(32).toString('hex')
  const valAcc = privateKeyToAccount(valPk)
  const valWallet = createWalletClient({ account: valAcc, chain: arcTestnet, transport: http(RPC) })
  console.log('Validator wallet:', valAcc.address)

  console.log('\n1) Fund validator (1 USDC for gas)')
  await send('transfer', ownerWallet, { address: USDC, abi: erc20, functionName: 'transfer', args: [valAcc.address, parseUnits('1', 6)] })

  console.log('\n2) register() - mint agent identity NFT')
  const regR = await send('register', ownerWallet, { address: IDENTITY, abi: idAbi, functionName: 'register', args: [METADATA_URI] })

  const transferTopic = keccak256(stringToHex('Transfer(address,address,uint256)'))
  const tLog = regR.logs.find(l => l.topics[0] === transferTopic)
  if (!tLog) throw new Error('No Transfer event in register receipt')
  const agentId = BigInt(tLog.topics[3])
  console.log('  Agent ID:', agentId.toString())

  const uri = await publicClient.readContract({ address: IDENTITY, abi: idAbi, functionName: 'tokenURI', args: [agentId] })
  console.log('  Metadata URI:', uri)

  console.log('\n3) giveFeedback() - validator records reputation (score 95)')
  const tag = 'successful_trade'
  const feedbackHash = keccak256(stringToHex(tag))
  await send('giveFeedback', valWallet, { address: REPUTATION, abi: repAbi, functionName: 'giveFeedback', args: [agentId, 95n, 0, tag, '', '', '', feedbackHash] })

  console.log('\n4) validationRequest() - owner asks validator for verification')
  const requestHash = keccak256(stringToHex('kyc_verification_request_agent_' + agentId))
  await send('validationRequest', ownerWallet, { address: VALIDATION, abi: valAbi, functionName: 'validationRequest', args: [valAcc.address, agentId, 'ipfs://bafkreiexamplevalidationrequest', requestHash] })

  console.log('\n5) validationResponse() - validator passes (100)')
  await send('validationResponse', valWallet, { address: VALIDATION, abi: valAbi, functionName: 'validationResponse', args: [requestHash, 100, '', '0x' + '0'.repeat(64), 'kyc_verified'] })

  console.log('\n6) Verify on-chain:')
  const status = await publicClient.readContract({ address: VALIDATION, abi: valAbi, functionName: 'getValidationStatus', args: [requestHash] })
  console.log('  Validator:', status[0])
  console.log('  Agent ID:', status[1].toString())
  console.log('  Response:', status[2].toString(), '(100 = passed)')
  console.log('  Tag:', status[4])

  console.log('\n== Agent identity registered, reputation recorded, validation verified ==')
}

main().catch(e => { console.error('Error:', e.message || e); process.exit(1) })
