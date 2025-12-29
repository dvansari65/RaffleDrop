# RaffleDrop

🎯 LuckyBid – Decentralized Raffle Marketplace (Solana • Switchboard VRF • Next.js)
LuckyBid is a decentralized raffle-style marketplace where anyone can sell a real-world or digital product, and buyers gamble for a chance to win it at a fraction of the cost.
Once the minimum funding goal (tickets sold) is met, a verifiably-random winner is selected using Switchboard VRF — ensuring fairness, transparency, and zero-trust execution.
💰 Seller is guaranteed full selling price
🎟️ Buyers pay only a small entry fee
⚖️ Winner is chosen openly & fairly, on-chain
📜 Optional Smart-Legal Contract prevents seller from listing product elsewhere

🧠 Game Concept
Role	Experience
Seller	List an item, lock NFT / deposit proof, optionally sign legally-binding contract to prevent off-platform sales
Buyers	Pay a ticket fee (₹100 / $1 / configurable) to participate in raffle
Platform	Collects fees, triggers randomness, executes payment routing

🏆 When threshold is reached → random draw → winner receives item, seller gets paid, others lose tickets like a lottery.

🏗️ High-Level Architecture

┌─────────────────────────────────────────────────────────┐
│                         LuckyBid                        │
└─────────────────────────────────────────────────────────┬┘
                                                          │
             ┌───────────────────────────────┐            │
             │         Web (Next.js)         │◀───────────┘
             │  - Connect Wallet             │
             │  - Create Raffle              │
             │  - Buy Ticket                 │
             │  - View Live Winners          │
             └───────────────────────────────┘
                          │
                          ▼
             ┌───────────────────────────────┐
             │  Smart Contract (Anchor)      │
             │ - Create Raffle PDA           │
             │ - Validate seller lock/proof  │
             │ - Collect ticket funds        │
             │ - Switchboard randomness draw │
             │ - Payout seller & assign item │
             └───────────────────────────────┘
                          │
                          ▼
            ┌────────────────────────────┐
            │ Payment Escrow (PDA Vault) │
            │ - Collect USDC / SOL       │
            │ - Min ticket logic         │
            │ - Refund if failed         │
            └────────────────────────────┘

⚙️ Tech Stack
| Component            | Technology                                     |
| -------------------- | ---------------------------------------------- |
| Frontend             | Next.js 14, TailwindCSS, Solana Wallet Adapter |
| Blockchain           | Solana, Anchor Framework, PDA escrow           |
| Randomness           | Switchboard VRF                                |
| Storage              | Arweave/IPFS for item proof & contract         |
| Optional Legal Layer | Cryptographic smart-legal contract             |

🪙 Payment Flow
User buys ticket
   │
   ▼
Funds transferred to Raffle PDA vault
   │
   ├─ If (tickets >= min) → run VRF draw → winner chosen
   │                        seller paid → item escrow released
   │
   └─ Else (deadline passed):
           refund each buyer → seller NFT/deposit returned

🚀 Getting Started
1️⃣ Installation
pnpm install

or create this template fresh:

pnpm create solana-dapp@latest \
 -t gh:solana-foundation/templates/web3js/RaffleDrop

 2️⃣ Anchor Program
Sync Program ID

Creates a deploy keypair → writes ID to config → updates declare_id! macro.
pnpm anchor keys sync

Build Program
pnpm anchor-build

Run Tests
pnpm anchor-test

Deploy to Devnet
pnpm anchor deploy --provider.cluster devnet

