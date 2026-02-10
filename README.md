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
- [x] **Withdrawal Vault**
      Add a "Claim" button for safer, cheaper ETH transfers.
- [x] **Sample Achievements Vault**
      Create achievement vault sample with Fake NFTs.
- [x] **Soulbound NFT**
      Automated certificates that stay in your wallet forever.
- [x] **Study Reviewer**
      Built-in flashcard page (Next.js + LocalStorage).
- [ ] **Gas Estimator**
      Show transaction costs before the user pays.
- [ ] **Timers & Deadlines**
      Show on-chain timers to sense urgency.
- [ ] **Notifications**
      Push notifications and email alerts for upcoming deadlines.
- [ ] **Optimize Minting**
      Optimize the logic of Smart Contract by providing accurate and consistency minting with accurate logic

---

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

---

## Deployment

The smart contract can be deployed using **Remix IDE** for management and testing.

### Deploy with Remix IDE

1. Go to [remix.ethereum.org](https://remix.ethereum.org)
2. Upload or create your contracts in the Solidity environment
3. Compile and deploy to Sepolia testnet
4. Update contract addresses in your environment variables and copy the ABI

#### Deploy Order:

1. **AchievementNFT.sol** - Deploy first, no constructor parameters needed
2. **StudyCommitment.sol** - Deploy second, pass the AchievementNFT contract address as constructor parameter

### Environment Variables

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=your_nft_contract_address
```

### Achievement System

KOMMITRAX features a comprehensive Soulbound NFT achievement system with 4 rarity tiers:

#### 🟢 **Common Achievements** (Easy to obtain)

- **Genesis Scholar** - Complete your first commitment and get verified
- **Getting Started** - Complete 3 commitments and get verified

#### 🔵 **Rare Achievements** (Moderate difficulty)

- **Consistency King** - Maintain a 3-day study streak
- **Dedicated Learner** - Complete 10 commitments
- **Scholar** - Complete 25 commitments
- **High Roller** - Complete 3+ high-stakes commitments (≥0.05 ETH)
- **Mentor** - Verify 25+ commitments for others

#### 🟡 **Legendary Achievements** (Very challenging)

- **Week Warrior** - Complete 7 commitments in a row
- **Master Scholar** - Complete 50 commitments
- **Iron Will** - Maintain a 30-day study streak
- **Wealth of Knowledge** - Stake over 1 ETH total
- **Guardian** - Verify 100+ commitments for others

#### 🟣 **Mythic Achievements** (Extremely rare)

- **Legendary Scholar** - Complete 100 commitments
- **Century Streak** - Maintain a 100-day study streak
- **Knowledge Baron** - Stake over 10 ETH total
- **Pioneer** - Early adopter who completed 50+ commitments
- **Sage** - Verify 500+ commitments for others

All achievements are Soulbound NFTs that cannot be transferred, ensuring they represent genuine accomplishment.

---

## License

MIT
