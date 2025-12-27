import { http, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';

// Define Zama fhEVM Devnet as a custom chain
export const zamaDevnet = defineChain({
  id: 9000,
  name: 'Zama fhEVM Devnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ZAMA',
    symbol: 'ZAMA',
  },
  rpcUrls: {
    default: {
      http: ['https://devnet.zama.ai'],
    },
    public: {
      http: ['https://devnet.zama.ai'],
    },
  },
  blockExplorers: {
    default: { name: 'Zama Explorer', url: 'https://explorer.devnet.zama.ai' },
  },
  testnet: true,
});

// Zama fhEVM Testnet (alternative)
export const zamaTestnet = defineChain({
  id: 8009,
  name: 'Zama fhEVM Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ZAMA',
    symbol: 'ZAMA',
  },
  rpcUrls: {
    default: {
      http: ['https://devnet.zama.ai'],
    },
    public: {
      http: ['https://devnet.zama.ai'],
    },
  },
  blockExplorers: {
    default: { name: 'Zama Explorer', url: 'https://explorer.zama.ai' },
  },
  testnet: true,
});

// RainbowKit + Wagmi configuration
export const config = getDefaultConfig({
  appName: 'FHEPdf',
  projectId: 'fhepdf-zama-grant', // WalletConnect project ID (get from cloud.walletconnect.com)
  chains: [zamaDevnet, sepolia, mainnet],
  transports: {
    [zamaDevnet.id]: http('https://devnet.zama.ai'),
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
});

// Contract addresses (to be updated after deployment)
export const CONTRACT_ADDRESSES = {
  fheCounter: '0x0000000000000000000000000000000000000000', // Update after deployment
};

// ABI for the FHE Counter contract
export const FHE_COUNTER_ABI = [
  {
    inputs: [],
    name: 'increment',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'encryptedAmount',
        type: 'bytes',
      },
    ],
    name: 'incrementBy',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getCounter',
    outputs: [
      {
        internalType: 'euint32',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'publicKey',
        type: 'bytes32',
      },
      {
        internalType: 'bytes',
        name: 'signature',
        type: 'bytes',
      },
    ],
    name: 'getCounterDecrypted',
    outputs: [
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
