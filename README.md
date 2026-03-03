# 🎮 Party Land - Based Arcade for Farcaster

Party Land is a social arcade platform built on **Base** and integrated directly into **Farcaster**. It combines high-speed arcade gameplay with real on-chain incentives, featuring a dual-currency system (off-chain tokens + on-chain USDC).

## 🟦 Why Base?
Party Land leverages Base to provide a seamless, low-cost transaction experience for players. Every skin purchase and airdrop entry is recorded on-chain, contributing to the growing Base builder ecosystem.

- **Fast Transactions:** Gas-efficient interactions for a buttery-smooth game experience.
- **On-chain Rewards:** Real USDC prizes distributed via automated weekly airdrops.
- **Identity:** Direct integration with Farcaster profiles (Warpcast/Base App).

## 🚀 Key Features
- **Dynamic Shop:** Unlock exclusive skins and themes using USDC on Base.
- **Weekly Airdrops:** Join the pool with game tokens + a small USDC entry fee to win a share of the community pot.
- **Profile System:** Track your stats, referrals, and on-chain holdings.
- **Referral Loop:** Earn tokens by inviting friends from the Farcaster feed.

## 🛠 Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Chain:** Base Mainnet
- **Protocol:** Farcaster Mini-Apps (Frames v2)
- **Wallet Integration:** Wagmi / Viem
- **Backend:** Supabase

## 💰 Integrated Tokens
- **USDC (Base):** `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- **Party Tokens:** In-game currency for airdrop qualification.

## 📦 Getting Started (Local Development)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup environment variables:**
   Create a `.env.local` using the project template (Supabase, Neynar API keys).

3. **Run the development server:**
   ```bash
   npm run dev
   ```

---
*Built with ❤️ for the Based Community.*
