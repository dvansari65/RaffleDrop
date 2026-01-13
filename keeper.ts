import { Connection, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor';
import * as anchor from '@coral-xyz/anchor';
import cron from 'node-cron';
import { sleep } from '@switchboard-xyz/common';
import * as dotenv from "dotenv"
import idl from "./src/idl/Raffle.json"

dotenv.config()
console.log("Keeper started.....")
// Configuration
const RPC_ENDPOINT = process.env.RPC_URL || 'http://127.0.0.1:8899'; // Base58 encoded private key
const PROGRAM_ID = new PublicKey('5CmMWJpHYhPjmhCXaaLU2WskBBB5HJ4yzDv6JzXEiDnz');

// Switchboard OnDemand feed (devnet example)
const SWITCHBOARD_FEED = new PublicKey('GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR'); // Devnet example

// Initialize connection
const connection = new Connection(RPC_ENDPOINT, 'confirmed');

// Create wallet from private key
const wallet = new Wallet(
  anchor.web3.Keypair.fromSecretKey(
    Buffer.from(
      JSON.parse(require('fs').readFileSync('./keeper-wallet.json', 'utf-8'))
    )
  )
);
console.log("wallet:",wallet)
// Create provider
const provider = new AnchorProvider(connection, wallet, {
  commitment: 'confirmed',
});

// Initialize program
const program = new Program(idl, provider);

// Keeper function to draw winner for a specific raffle
         
async function drawWinnerForRaffle(rafflePDA: PublicKey, counter: number,seller:PublicKey,paymentMint:PublicKey) {
  try {
    // Get current time
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Fetch raffle account
    const raffleAccount = await (program.account as any).raffleAccount.fetch(rafflePDA);
    
    // Check conditions
    if (
      !raffleAccount.claimed &&
      raffleAccount.status.active &&
      raffleAccount.participants.length > 0 &&
      currentTime > raffleAccount.deadline.toNumber()
    ) {
      console.log(`Drawing winner for raffle: ${rafflePDA.toString()}`);
      
      // Find counter PDA
      const [counterPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('global-counter')],
        PROGRAM_ID
      );

      // Find escrow PDA
      const [escrowPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('escrow_payment'),
          raffleAccount.seller.toBuffer(),
          new anchor.BN(counter).toArrayLike(Buffer, 'le', 8)
        ],
        PROGRAM_ID
      )
      // Create transaction
      const tx = await program.methods
        .drawWinner()
        .accounts({
          randomnessAccountData: SWITCHBOARD_FEED,
          selller: seller, // This should be the seller
        })
        .transaction();

      // Send transaction
      const signature = await sendAndConfirmTransaction(connection, tx, [wallet.payer]);
      console.log(`Success! Transaction signature: ${signature}`);
      
      return signature;
    } else {
      console.log(`Raffle ${rafflePDA.toString()} not ready for drawing:`);
      console.log(`- Claimed: ${raffleAccount.claimed}`);
      console.log(`- Status: ${JSON.stringify(raffleAccount.status)}`);
      console.log(`- Participants: ${raffleAccount.participants.length}`);
      console.log(`- Deadline passed: ${currentTime > raffleAccount.deadline.toNumber()}`);
      return null;
    }
  } catch (error) {
    console.error(`Error drawing winner for ${rafflePDA.toString()}:`, error);
    return null;
  }
}

// Main keeper function to scan all raffles
async function scanAndDrawWinners() {
  try {
    console.log(`[${new Date().toISOString()}] Scanning for raffles...`);
    
    // Fetch all raffle accounts (you might want to use a more efficient method)
    const allRaffles = await ( program.account as any).raffleAccount.all();
    
    // Filter for active raffles past deadline
    const currentTime = Math.floor(Date.now() / 1000);
    
    for (const raffle of allRaffles) {
      const raffleData = raffle.account ;
      
      if (
        raffleData.status.active &&
        !raffleData.claimed &&
        raffleData.participants.length > 0 &&
        currentTime > raffleData.deadline.toNumber()
      ) {
        console.log(`Processing raffle: ${raffle.publicKey.toString()}`);
        
        // You need to know the counter value for this raffle
        // Assuming it's stored in the account or you can derive it
        // For now, let's try with the raffle ID if you have it
        
        await drawWinnerForRaffle(raffle.publicKey, raffleData.raffleId?.toNumber(),raffle.account.seller,raffle.account.paymentMint);
        
        // Small delay to avoid rate limiting
        await sleep(2000);
      }
    }
    
    console.log(`[${new Date().toISOString()}] Scan completed.`);
  } catch (error) {
    console.error('Error scanning raffles:', error);
  }
}

// Run keeper every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  console.log('Running raffle keeper check...');
  await scanAndDrawWinners();
});

// Or run once immediately for testing
async function main() {
  console.log('Starting raffle keeper...');
  
  // Initial scan
  await scanAndDrawWinners();
  
  // Keep process alive
  setInterval(() => {
    // Keep-alive
  }, 1000 * 60 * 60); // 1 hour
}

// Start the keeper
if (require.main === module) {
  main().catch(console.error);
}

export { scanAndDrawWinners, drawWinnerForRaffle };