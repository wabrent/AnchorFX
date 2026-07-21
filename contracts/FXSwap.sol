// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract FXSwap is ReentrancyGuard {
    IERC20 public immutable usdc;
    IERC20 public immutable eurc;

    address public owner;
    uint256 public rate; // USDC -> EURC, scaled by 1e18 (e.g., 0.9247e18)
    uint256 public protocolFeeBps = 5; // 0.05%

    event Swap(
        address indexed user,
        address indexed fromToken,
        address indexed toToken,
        uint256 fromAmount,
        uint256 toAmount,
        uint256 fee
    );

    event RateUpdated(uint256 oldRate, uint256 newRate);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _usdc, address _eurc, uint256 _initialRate) {
        usdc = IERC20(_usdc);
        eurc = IERC20(_eurc);
        rate = _initialRate;
        owner = msg.sender;
    }

    // Swap USDC -> EURC
    function swapUsdcToEurc(uint256 usdcAmount) external nonReentrant {
        require(usdcAmount > 0, "Amount must be > 0");

        uint256 fee = (usdcAmount * protocolFeeBps) / 10000;
        uint256 amountAfterFee = usdcAmount - fee;
        uint256 eurcAmount = (amountAfterFee * rate) / 1e18;

        require(usdc.transferFrom(msg.sender, address(this), usdcAmount), "USDC transfer failed");
        require(eurc.transfer(msg.sender, eurcAmount), "EURC transfer failed");

        emit Swap(msg.sender, address(usdc), address(eurc), usdcAmount, eurcAmount, fee);
    }

    // Swap EURC -> USDC
    function swapEurcToUsdc(uint256 eurcAmount) external nonReentrant {
        require(eurcAmount > 0, "Amount must be > 0");

        uint256 fee = (eurcAmount * protocolFeeBps) / 10000;
        uint256 amountAfterFee = eurcAmount - fee;
        uint256 usdcAmount = (amountAfterFee * 1e18) / rate;

        require(eurc.transferFrom(msg.sender, address(this), eurcAmount), "EURC transfer failed");
        require(usdc.transfer(msg.sender, usdcAmount), "USDC transfer failed");

        emit Swap(msg.sender, address(eurc), address(usdc), eurcAmount, usdcAmount, fee);
    }

    // Admin: update rate
    function setRate(uint256 _newRate) external onlyOwner {
        uint256 oldRate = rate;
        rate = _newRate;
        emit RateUpdated(oldRate, _newRate);
    }

    // Admin: withdraw tokens (for liquidity management)
    function withdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner, amount);
    }
}
