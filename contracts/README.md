# FHE Smart Contracts

This directory contains Solidity smart contracts for the FHEPdf project, utilizing Zama's Fully Homomorphic Encryption (FHE) on the fhEVM.

## FHECounter.sol

A demonstration contract showing how to use encrypted integers (euint32) for privacy-preserving computations.

### Features

- **Encrypted Counter**: Stores a counter value as an encrypted integer
- **Increment**: Add 1 to the counter (on encrypted data)
- **IncrementBy**: Add an encrypted amount to the counter
- **Decryption**: Request decryption through Zama's gateway

### Deployment

#### Prerequisites

1. Install Foundry or Hardhat
2. Get testnet tokens from Zama faucet
3. Configure your wallet with Zama fhEVM network

#### Using Hardhat

```bash
# Install dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install fhevm

# Configure hardhat.config.js
module.exports = {
  solidity: "0.8.24",
  networks: {
    zamaDevnet: {
      url: "https://devnet.zama.ai",
      chainId: 9000,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};

# Deploy
npx hardhat run scripts/deploy.js --network zamaDevnet
```

#### Using Foundry

```bash
# Install fhevm
forge install zama-ai/fhevm

# Deploy
forge create --rpc-url https://devnet.zama.ai \
  --private-key $PRIVATE_KEY \
  src/FHECounter.sol:FHECounter
```

### Contract Addresses

After deployment, update the contract address in:
- `client/src/lib/web3Config.ts` - `CONTRACT_ADDRESSES.fheCounter`

### Network Configuration

| Network | Chain ID | RPC URL |
|---------|----------|---------|
| Zama fhEVM Devnet | 9000 | https://devnet.zama.ai |
| Zama fhEVM Testnet | 8009 | https://devnet.zama.ai |

### Resources

- [Zama fhEVM Documentation](https://docs.zama.ai/fhevm)
- [Concrete Library](https://docs.zama.ai/concrete)
- [fhEVM Examples](https://github.com/zama-ai/fhevm)

## License

MIT - Built by [@ramx_ai](https://x.com/ramx_ai) for the Zama FHE Developer Grant
