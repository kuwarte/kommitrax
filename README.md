# Kommitrax

A blockchain-powered commitment tracking app built with Next.js and Ethereum smart contracts.

## About

KOMMITRAX helps users create and manage study commitments using smart contracts. Connect your MetaMask wallet to start tracking your dedication on the Sepolia testnet.

## Getting Started

### Prerequisites

- Node.js & pnpm installed
- MetaMask browser extension

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Deployment

The smart contract can be deployed using **Remix IDE** for management and testing.

### Deploy with Remix IDE

1. Go to [remix.ethereum.org](https://remix.ethereum.org)
2. Upload or create your contracts in the Solidity environment
3. Compile and deploy to Sepolia testnet
4. Update contract addresses in your environment variables and copy the ABI

### Environment Variables

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
```

## License

MIT
