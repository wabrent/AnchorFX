// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract ArcFXRouter {
    address public owner;
    uint256 public feeBps = 10; // 0.1%

    event FXSwapped(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint256 timestamp
    );

    event LiquidityAdded(address indexed provider, address indexed token, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "ArcFX: Not authorized");
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
        require(amountIn > 0, "ArcFX: Zero input amount");
        require(tokenIn != tokenOut, "ArcFX: Identical tokens");

        uint256 fee = (amountIn * feeBps) / 10000;
        uint256 netInput = amountIn - fee;

        amountOut = (netInput * exchangeRate) / 1e18;
        require(amountOut >= minAmountOut, "ArcFX: High slippage");

        require(
            IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn),
            "ArcFX: TransferIn failed"
        );

        require(
            IERC20(tokenOut).transfer(msg.sender, amountOut),
            "ArcFX: TransferOut failed"
        );

        emit FXSwapped(msg.sender, tokenIn, tokenOut, amountIn, amountOut, block.timestamp);
    }

    function addLiquidity(address token, uint256 amount) external {
        require(amount > 0, "ArcFX: Zero amount");
        require(
            IERC20(token).transferFrom(msg.sender, address(this), amount),
            "ArcFX: Liquidity deposit failed"
        );
        emit LiquidityAdded(msg.sender, token, amount);
    }

    function setFee(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= 100, "ArcFX: Fee too high");
        feeBps = _feeBps;
    }
}
