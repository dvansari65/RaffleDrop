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

🏗️flowchart TD

A[User / Buyer / Seller] --> B[Next.js Web App]

B -->|Wallet Connect / Create Raffle / Buy Ticket| C[Anchor Smart Contract]

C -->|Create Raffle PDA| D[Escrow Vault PDA]
C -->|Collect Tickets (SOL/USDC)| D
C -->|Trigger VRF Request| E[Switchboard VRF]
E -->|Return Random Winner| C
C -->|Payout Seller + Assign Winner| D

C -->|Store Item Metadata| F[Arweave / IPFS]

🪙 Payment Flow
flowchart TD

A[User Buys Ticket] --> B[Transfer Funds to Raffle PDA Vault]

B --> C{Tickets >= Minimum Threshold?}

C -->|Yes| D[Trigger Switchboard VRF Draw]
D --> E[Winner Randomly Selected]
E --> F[Seller Paid from PDA Vault]
F --> G[Item / Escrow Released to Winner]

C -->|No (Deadline Passed)| H[Refund Buyers Automatically]
H --> I[Seller Deposit / NFT Returned]

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

