// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

/**
 * @title X402Validator
 * @notice Validates x402 micropayments for Agentic Market services on the Arc Blockchain.
 * It transfers USDC from the caller to a designated fee collector (our Agent Wallet)
 * and emits a verifiable event.
 */
interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract X402Validator {
    address public owner;
    address public feeCollector;
    address public usdcToken;

    event X402Payment(
        address indexed sender,
        string serviceId,
        uint256 amount,
        uint256 timestamp
    );

    event FeeCollectorChanged(address indexed oldCollector, address indexed newCollector);
    event OwnerChanged(address indexed oldOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _usdcToken, address _feeCollector) {
        require(_usdcToken != address(0), "Invalid USDC token address");
        require(_feeCollector != address(0), "Invalid fee collector address");
        owner = msg.sender;
        usdcToken = _usdcToken;
        feeCollector = _feeCollector;
    }

    function setFeeCollector(address _feeCollector) external onlyOwner {
        require(_feeCollector != address(0), "Invalid collector address");
        emit FeeCollectorChanged(feeCollector, _feeCollector);
        feeCollector = _feeCollector;
    }

    function setOwner(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid owner address");
        emit OwnerChanged(owner, _newOwner);
        owner = _newOwner;
    }

    /**
     * @notice Pay for a specific AI service.
     * @param serviceId The identifier of the service being called (e.g. "exa-ai", "openai").
     * @param amount The cost of the service in USDC (6 decimals).
     */
    function payForService(string calldata serviceId, uint256 amount) external returns (bool) {
        require(amount > 0, "Amount must be greater than zero");
        
        // Execute the USDC transfer from sender directly to our fee collector (Agent Wallet)
        bool success = IERC20(usdcToken).transferFrom(msg.sender, feeCollector, amount);
        require(success, "USDC transfer failed");

        emit X402Payment(msg.sender, serviceId, amount, block.timestamp);
        return true;
    }
}
