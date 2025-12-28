// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

/**
 * Encrypted PDF Usage Credits
 * Zama FHEVM – Sepolia
 */

import "fhevm/lib/TFHE.sol";
import "fhevm/config/ZamaFHEVMConfig.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EncryptedPdfCredits is ZamaFHEVMConfig, Ownable {
    /**
     * Encrypted PDF credits per user
     * Credits are NEVER stored in plaintext
     */
    mapping(address => euint32) private encryptedCredits;

    /**
     * Track initialization to avoid re-assigning credits
     */
    mapping(address => bool) private initialized;

    /**
     * Event emitted when credits are initialized
     */
    event CreditsInitialized(address indexed user);

    /**
     * Event emitted when a credit is consumed
     */
    event CreditConsumed(address indexed user);

    constructor() Ownable(msg.sender) {}

    /**
     * Initialize credits for a user (one-time)
     * Only the owner (contract admin) can initialize credits
     */
    function initializeCredits(address user, uint32 plainCredits) external onlyOwner {
        require(!initialized[user], "Already initialized");

        encryptedCredits[user] = TFHE.asEuint32(plainCredits);
        initialized[user] = true;

        // Allow user to decrypt their own credits
        TFHE.allow(encryptedCredits[user], user);
        // Allow contract to perform operations on these credits
        TFHE.allow(encryptedCredits[user], address(this));

        emit CreditsInitialized(user);
    }

    /**
     * Add more credits to an existing user
     */
    function addCredits(address user, uint32 plainCredits) external onlyOwner {
        require(initialized[user], "User not initialized");

        euint32 currentCredits = encryptedCredits[user];
        euint32 additionalCredits = TFHE.asEuint32(plainCredits);
        
        encryptedCredits[user] = TFHE.add(currentCredits, additionalCredits);

        // Re-allow user and contract
        TFHE.allow(encryptedCredits[user], user);
        TFHE.allow(encryptedCredits[user], address(this));
    }

    /**
     * Consume 1 encrypted credit
     * Called when user performs a PDF operation
     */
    function consumeCredit() external {
        require(initialized[msg.sender], "Credits not initialized");

        euint32 credits = encryptedCredits[msg.sender];

        // Require credits > 0 (encrypted check)
        // TFHE.req ensures the transaction reverts if the condition is false
        TFHE.req(TFHE.gt(credits, TFHE.asEuint32(0)));

        // credits = credits - 1 (encrypted subtraction)
        encryptedCredits[msg.sender] = TFHE.sub(
            credits,
            TFHE.asEuint32(1)
        );

        // Allow user to decrypt updated value
        TFHE.allow(encryptedCredits[msg.sender], msg.sender);
        // Allow contract to continue managing these credits
        TFHE.allow(encryptedCredits[msg.sender], address(this));

        emit CreditConsumed(msg.sender);
    }

    /**
     * Check if user has at least 1 credit
     * Returns encrypted boolean (ebool)
     */
    function hasCredits(address user) external view returns (ebool) {
        require(initialized[user], "Credits not initialized");

        ebool result = TFHE.gt(
            encryptedCredits[user],
            TFHE.asEuint32(0)
        );

        // Allow user to see the result
        TFHE.allow(result, user);
        return result;
    }

    /**
     * Get encrypted credit balance
     * Only decryptable by owner of the credits
     */
    function getEncryptedCredits(address user) external view returns (euint32) {
        require(initialized[user], "Credits not initialized");
        
        // In FHEVM, we return the euint32 handle. 
        // The user must use their private key to decrypt this via a gateway or local decryption.
        euint32 credits = encryptedCredits[user];
        
        // Ensure the user is allowed to view their handle
        TFHE.allow(credits, user);
        return credits;
    }
}
