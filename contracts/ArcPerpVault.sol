// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract ArcPerpVault {
    address public owner;
    IERC20 public collateralToken;

    mapping(address => uint256) public userCollateral;

    event CollateralDeposited(address indexed user, uint256 amount);
    event CollateralWithdrawn(address indexed user, uint256 amount);
    event PositionOpened(address indexed user, string symbol, bool isLong, uint256 size, uint256 entryPrice, uint256 leverage);
    event PositionClosed(address indexed user, string symbol, int256 realizedPnl);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "ArcPerpVault: caller is not the owner");
        _;
    }

    constructor(address _collateralToken) {
        owner = msg.sender;
        collateralToken = IERC20(_collateralToken);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "ArcPerpVault: new owner is zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function depositCollateral(uint256 amount) external {
        require(amount > 0, "ArcPerpVault: deposit must be greater than 0");
        require(collateralToken.transferFrom(msg.sender, address(this), amount), "ArcPerpVault: token transfer failed");
        userCollateral[msg.sender] += amount;
        emit CollateralDeposited(msg.sender, amount);
    }

    function withdrawCollateral(uint256 amount) external {
        require(amount > 0, "ArcPerpVault: withdraw must be greater than 0");
        require(userCollateral[msg.sender] >= amount, "ArcPerpVault: insufficient balance");
        userCollateral[msg.sender] -= amount;
        require(collateralToken.transfer(msg.sender, amount), "ArcPerpVault: token transfer failed");
        emit CollateralWithdrawn(msg.sender, amount);
    }

    function openPosition(string calldata symbol, bool isLong, uint256 size, uint256 entryPrice, uint256 leverage) external {
        require(userCollateral[msg.sender] > 0, "ArcPerpVault: no collateral deposited");
        emit PositionOpened(msg.sender, symbol, isLong, size, entryPrice, leverage);
    }

    function closePosition(string calldata symbol, int256 realizedPnl) external {
        emit PositionClosed(msg.sender, symbol, realizedPnl);
    }

    function emergencyWithdraw() external onlyOwner {
        uint256 balance = collateralToken.balanceOf(address(this));
        require(collateralToken.transfer(owner, balance), "ArcPerpVault: transfer failed");
    }
}
