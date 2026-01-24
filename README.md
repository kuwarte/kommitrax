# KOMMITRAX: Kill Procrastination with Blockchain

KOMMITRAX turns your study goals into a financial commitment. Stake money, do the work, and get your money back. Fail, and your stake is gone.

---

## The Anti-Procrastination Flow

1.  **Commit**
    Define your goal and lock a 0.01 ETH stake into the contract.
2.  **Choose**
    Choose your own trusted verifier to check your progress.
3.  **Execute**
    Do the work before the hard on-chain deadline.
4.  **Verify**
    Submit proof. Once a verifier approves, your stake is returned.
5.  **Reward**
    Receive a Soulbound NFT Certificate as permanent proof of your discipline.

---

## Project Roadmap

### Phase 1: Core
- [x] **Wallet Connection**
  Connect MetaMask to the DApp.
- [x] **Staking Logic**
  Lock 0.01 ETH for study commitments.
- [x] **Proof System**
  Basic text-based submission for students.
- [x] **Verification Flow**
  Approval/Rejection tools for reviewers.
- [x] **Auto-Payouts**
  Logic for splitting fees and refunds.
- [x] **Dashboards**
  Dedicated views for Students and Verifiers.

### Phase 2: NFT Rewards & Efficiency
- [ ] **Improve Payouts**
  Optimize the splitting fees relative to Gas Fees.
- [ ] **Withdrawal Vault**
  Add a "Claim" button for safer, cheaper ETH transfers.
- [ ] **Soulbound NFT**
  Automated certificates that stay in your wallet forever.
- [ ] **Study Reviewer**
  Built-in flashcard page (Next.js + LocalStorage).
- [ ] **Gas Estimator**
  Show transaction costs before the user pays.

---

## Getting Started

### Prerequisites
* Node.js & pnpm installed
* MetaMask browser extension

### Installation
```bash
pnpm install
```

### Development
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) to view the app.

---

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

---

## License

MIT
