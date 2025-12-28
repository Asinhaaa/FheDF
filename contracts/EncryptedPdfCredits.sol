// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

/**
 * Encrypted PDF Usage Credits
 * Zama FHEVM – Sepolia
 */

import "@fhevm/solidity/lib/TFHE.sol";
import "@fhevm/solidity/config/ZamaEthereumConfig.sol";

contract EncryptedPdfCredits is ZamaEthereumConfig {
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
     * Initialize credits for a user (one-time)
     * Example: give 10 encrypted credits
     */
    function initializeCredits(address user, uint32 plainCredits) external {
        require(!initialized[user], "Already initialized");

        encryptedCredits[user] = TFHE.asEuint32(plainCredits);
        initialized[user] = true;

        // Allow user to decrypt their own credits
        TFHE.allow(encryptedCredits[user], user);
    }

    /**
     * Consume 1 encrypted credit
     * Called when user performs a PDF operation
     */
    function consumeCredit() external {
        require(initialized[msg.sender], "Credits not initialized");

        euint32 credits = encryptedCredits[msg.sender];

        // Require credits > 0 (encrypted check)
        TFHE.req(TFHE.gt(credits, TFHE.asEuint32(0)));

        // credits = credits - 1 (encrypted subtraction)
        encryptedCredits[msg.sender] = TFHE.sub(
            credits,
            TFHE.asEuint32(1)
        );

        // Allow user to decrypt updated value
        TFHE.allow(encryptedCredits[msg.sender], msg.sender);
    }

    /**
     * Check if user has at least 1 credit
     * Returns encrypted boolean
     */
    function hasCredits(address user) external view returns (ebool) {
        require(initialized[user], "Credits not initialized");

        ebool result = TFHE.gt(
            encryptedCredits[user],
            TFHE.asEuint32(0)
        );

        TFHE.allow(result, user);
        return result;
    }

    /**
     * Get encrypted credit balance
     * Only decryptable by owner
     */
    function getEncryptedCredits(address user) external view returns (euint32) {
        require(initialized[user], "Credits not initialized");

        euint32 credits = encryptedCredits[user];
        TFHE.allow(credits, user);
        return credits;
    }
}
