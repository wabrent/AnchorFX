import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useBalance, useReadContract } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { useAppState } from '../../context/useAppState'

const VAULTS = [
  {
    id: 'usdc-stable',
    name: 'USDC Stable Pool',
    token: 'USDC',
    apy: 8.42,
    tvl: '12.4M',
    strategy: 'Lending + LP Fees',
    risk: 'Low',
    color: '#00e5a0',
    icon: '💎',
    description: 'Low-risk stablecoin yield through lending protocols and LP fees',
  },
  {
    id: 'eurc-stable',
    name: 'EURC Stable Pool',
    token: 'EURC',
    apy: 7.85,
    tvl: '8.2M',
    strategy: 'FX Arbitrage + Lending',
    risk: 'Low',
    color: '#6B8BFF',
    icon: '🏦',
    description: 'Euro stablecoin yield via FX arbitrage and lending',
  },
  {
    id: 'mixed-stable',
    name: 'Mixed Stable Pool',
    token: 'USDC/EURC',
    apy: 12.34,
    tvl: '24.6M',
    strategy: 'Multi-Asset LP',
    risk: 'Medium',
    color: '#f59e0b',
    icon: '⚡',
    description: 'Diversified stablecoin yield with multi-asset LP positions',
  },
  {
    id: 'high-yield',
    name: 'High Yield Pool',
    token: 'USDC/EURC/ARB',
    apy: 18.67,
    tvl: '5.8M',
    strategy: 'Concentrated LP',
    risk: 'High',
    color: '#ef4444',
    icon: '🔥',
    description: 'High yield through concentrated liquidity provision',
  },
]

const VAULT_ABI = [
  { type: 'function', name: 'deposit', inputs: [{ name: 'assets', type: 'uint256' }], outputs: [{ name: 'shares', type: 'uint256' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'withdraw', inputs: [{ name: 'shares', type: 'uint256' }], outputs: [{ name: 'assets', type: 'uint256' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'balanceOf', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'totalAssets', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
]

const ERC20_ABI = [
  { type: 'function', name: 'approve', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'allowance', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
]

const V0_ADDRESSES = {
  'usdc-stable': '0x0000000000000000000000000000000000000001',
  'eurc-stable': '0x0000000000000000000000000000000000000002',
  'mixed-stable': '0x0000000000000000000000000000000000000003',
  'high-yield': '0x0000000000000000000000000000000000000004',
}

const USDC_ADDRESS = '0x3600000000000000000000000000000000000000'

export default function VaultsView() {
  const { address } = useAccount()
  const { notify } = useAppState()
  const [selectedVault, setSelectedVault] = useState(null)
  const [depositAmount, setDepositAmount] = useState('')
  const [vaultData, setVaultData] = useState({})

  const { data: balanceData } = useBalance({ address })
  const { writeContract, isPending, isSuccess, error } = useWriteContract()

  useEffect(() => {
    const data = {}
    VAULTS.forEach(v => {
      data[v.id] = {
        userShares: Math.random() * 1000,
        userValue: Math.random() * 5000,
        totalDeposited: Math.random() * 10000,
      }
    })
    setVaultData(data)
  }, [])

  useEffect(() => {
    if (isSuccess && selectedVault) {
      notify('Vault Deposit', `Deposited ${depositAmount} USDC into ${selectedVault.name}`, 'success')
      setDepositAmount('')
    }
  }, [isSuccess])

  function handleDeposit(vault) {
    if (!depositAmount || !address) return
    writeContract({
      address: USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [V0_ADDRESSES[vault.id], parseUnits(depositAmount, 6)],
    })
  }

  function handleWithdraw(vault) {
    notify('Withdraw', `Withdrawing from ${vault.name}...`, 'info')
  }

  const totalValue = Object.values(vaultData).reduce((sum, v) => sum + (v.userValue || 0), 0)
  const totalYield = Object.values(vaultData).reduce((sum, v) => sum + (v.userValue || 0) * 0.08, 0)

  return (
    <div className="view-section vaults-view">
      <div className="view-head">
        <h2>Yield Vaults</h2>
        <span className="view-sub">ERC-4626 compliant vaults on Arc Network</span>
      </div>

      <div className="vaults-stats">
        <div className="vaults-stat-card">
          <span className="vaults-stat-label">Total Value</span>
          <span className="vaults-stat-val">${totalValue.toFixed(2)}</span>
        </div>
        <div className="vaults-stat-card">
          <span className="vaults-stat-label">Est. Annual Yield</span>
          <span className="vaults-stat-val green">${totalYield.toFixed(2)}</span>
        </div>
        <div className="vaults-stat-card">
          <span className="vaults-stat-label">Active Vaults</span>
          <span className="vaults-stat-val">{VAULTS.length}</span>
        </div>
        <div className="vaults-stat-card">
          <span className="vaults-stat-label">Network</span>
          <span className="vaults-stat-val" style={{ fontSize: 13 }}>Arc Testnet</span>
        </div>
      </div>

      <div className="vaults-grid">
        {VAULTS.map(vault => {
          const userVaultData = vaultData[vault.id] || {}
          const isSelected = selectedVault?.id === vault.id

          return (
            <div
              key={vault.id}
              className={`vault-card ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedVault(isSelected ? null : vault)}
            >
              <div className="vault-card-header">
                <div className="vault-icon" style={{ background: vault.color + '20', color: vault.color }}>
                  {vault.icon}
                </div>
                <div className="vault-info">
                  <h3 className="vault-name">{vault.name}</h3>
                  <span className="vault-token">{vault.token}</span>
                </div>
                <span className={`vault-risk risk-${vault.risk.toLowerCase()}`}>{vault.risk}</span>
              </div>

              <div className="vault-metrics">
                <div className="vault-metric">
                  <span className="vault-metric-label">APY</span>
                  <span className="vault-metric-val green">{vault.apy}%</span>
                </div>
                <div className="vault-metric">
                  <span className="vault-metric-label">TVL</span>
                  <span className="vault-metric-val">${vault.tvl}</span>
                </div>
                <div className="vault-metric">
                  <span className="vault-metric-label">Strategy</span>
                  <span className="vault-metric-val" style={{ fontSize: 11 }}>{vault.strategy}</span>
                </div>
              </div>

              <p className="vault-desc">{vault.description}</p>

              {userVaultData.userShares > 0 && (
                <div className="vault-user-position">
                  <div className="vault-position-row">
                    <span>Your Shares</span>
                    <span>{userVaultData.userShares.toFixed(2)}</span>
                  </div>
                  <div className="vault-position-row">
                    <span>Your Value</span>
                    <span>${userVaultData.userValue.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {isSelected && (
                <div className="vault-actions">
                  <div className="anchor-input-box">
                    <span className="anchor-input-label">Deposit Amount</span>
                    <input
                      className="anchor-input"
                      type="number"
                      placeholder="0.0"
                      value={depositAmount}
                      onChange={e => setDepositAmount(e.target.value)}
                      onClick={e => e.stopPropagation()}
                    />
                    <span className="anchor-input-hint">USDC</span>
                  </div>

                  <div className="vault-action-btns">
                    <button
                      className="vault-deposit-btn"
                      onClick={(e) => { e.stopPropagation(); handleDeposit(vault) }}
                      disabled={!address || isPending || !depositAmount}
                    >
                      {isPending ? 'Depositing...' : 'Deposit'}
                    </button>
                    {userVaultData.userShares > 0 && (
                      <button
                        className="vault-withdraw-btn"
                        onClick={(e) => { e.stopPropagation(); handleWithdraw(vault) }}
                      >
                        Withdraw All
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
