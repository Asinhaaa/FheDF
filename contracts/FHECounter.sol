// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/gateway/GatewayCaller.sol";

/**
 * @title FHECounter
 * @dev A simple counter contract using Zama's Fully Homomorphic Encryption
 * @notice This contract demonstrates FHE operations on encrypted integers
 * @author @ramx_ai - Built for Zama FHE Developer Grant
 */
contract FHECounter is GatewayCaller {
    // Encrypted counter value (euint32)
    euint32 private counter;
    
    // Owner of the contract
    address public owner;
    
    // Event emitted when counter is incremented
    event CounterIncremented(address indexed user);
    
    // Event emitted when counter is incremented by encrypted amount
    event CounterIncrementedBy(address indexed user, bytes encryptedAmount);
    
    // Event emitted when decryption is requested
    event DecryptionRequested(uint256 requestId, address indexed requester);

    constructor() {
        owner = msg.sender;
        // Initialize counter to encrypted zero
        counter = TFHE.asEuint32(0);
        TFHE.allow(counter, address(this));
    }

    /**
     * @dev Increment the counter by 1
     */
    function increment() external {
        // Add encrypted 1 to the counter
        counter = TFHE.add(counter, TFHE.asEuint32(1));
        TFHE.allow(counter, address(this));
        
        emit CounterIncremented(msg.sender);
    }

    /**
     * @dev Increment the counter by an encrypted amount
     * @param encryptedAmount The encrypted amount to add (euint32)
     * @param inputProof Proof for the encrypted input
     */
    function incrementBy(
        einput encryptedAmount,
        bytes calldata inputProof
    ) external {
        // Convert input to euint32 with proof verification
        euint32 amount = TFHE.asEuint32(encryptedAmount, inputProof);
        
        // Add encrypted amount to counter
        counter = TFHE.add(counter, amount);
        TFHE.allow(counter, address(this));
        
        emit CounterIncrementedBy(msg.sender, inputProof);
    }

    /**
     * @dev Get the encrypted counter value
     * @return The encrypted counter (can only be decrypted by authorized parties)
     */
    function getCounter() external view returns (euint32) {
        return counter;
    }

    /**
     * @dev Request decryption of the counter value
     * @notice Only the owner can request decryption
     * @return requestId The ID of the decryption request
     */
    function requestDecryption() external returns (uint256) {
        require(msg.sender == owner, "Only owner can request decryption");
        
        // Request decryption through the gateway
        uint256[] memory cts = new uint256[](1);
        cts[0] = Gateway.toUint256(counter);
        
        uint256 requestId = Gateway.requestDecryption(
            cts,
            this.decryptionCallback.selector,
            0, // No additional data
            block.timestamp + 100, // Deadline
            false // Not passthrough
        );
        
        emit DecryptionRequested(requestId, msg.sender);
        return requestId;
    }

    /**
     * @dev Callback function for decryption result
     * @param requestId The ID of the decryption request
     * @param decryptedValue The decrypted counter value
     */
    function decryptionCallback(
        uint256 requestId,
        uint32 decryptedValue
    ) external onlyGateway returns (uint32) {
        // In production, you would store or emit this value
        return decryptedValue;
    }

    /**
     * @dev Reset the counter to zero (owner only)
     */
    function reset() external {
        require(msg.sender == owner, "Only owner can reset");
        counter = TFHE.asEuint32(0);
        TFHE.allow(counter, address(this));
    }

    /**
     * @dev Allow an address to access the encrypted counter
     * @param allowedAddress The address to grant access
     */
    function allowAccess(address allowedAddress) external {
        require(msg.sender == owner, "Only owner can grant access");
        TFHE.allow(counter, allowedAddress);
    }
}
