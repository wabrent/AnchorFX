// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title AnchorFXRouter
 * @dev Institutional FX Swap Router built for Arc Network
 */
contract AnchorFXRouter {
    address public owner;
    uint256 public feeBps = 5; // 0.05% комиссия протокола

    event AnchorSwapped(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint256 timestamp
    );

    event LiquidityAdded(address indexed provider, address indexed token, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "AnchorFX: Unauthorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice On-chain исполнение обмена стейблкоинов USDC / EURC
     */
    function swapFX(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        uint256 exchangeRate
    ) external returns (uint256 amountOut) {
        require(amountIn > 0, "AnchorFX: Zero input amount");
        require(tokenIn != tokenOut, "AnchorFX: Identical tokens");

        uint256 fee = (amountIn * feeBps) / 10000;
        uint256 netInput = amountIn - fee;

        amountOut = (netInput * exchangeRate) / 1e18;
        require(amountOut >= minAmountOut, "AnchorFX: Slippage limit exceeded");

        require(
            IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn),
            "AnchorFX: TransferIn failed"
        );

        require(
            IERC20(tokenOut).transfer(msg.sender, amountOut),
            "AnchorFX: TransferOut failed"
        );

        emit AnchorSwapped(msg.sender, tokenIn, tokenOut, amountIn, amountOut, block.timestamp);
    }

    function setFee(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= 50, "AnchorFX: Fee too high");
        feeBps = _feeBps;
    }
}
