// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title AnchorFXRouter
 * @dev Institutional FX Swap Router for Arc Network
 */
contract AnchorFXRouter {
    address public owner;
    uint256 public feeBps = 10; // 0.1% fee

    event AnchorSwapped(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint256 timestamp
    );

    event AnchorLiquidityAdded(address indexed provider, address indexed token, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "AnchorFX: Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

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
        require(amountOut >= minAmountOut, "AnchorFX: Slippage tolerance exceeded");

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

    function addLiquidity(address token, uint256 amount) external {
        require(amount > 0, "AnchorFX: Zero amount");
        require(
            IERC20(token).transferFrom(msg.sender, address(this), amount),
            "AnchorFX: Deposit failed"
        );
        emit AnchorLiquidityAdded(msg.sender, token, amount);
    }
}
