import { Connection, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor';
import * as anchor from '@coral-xyz/anchor';
import cron from 'node-cron';
import { sleep } from '@switchboard-xyz/common';
import * as dotenv from "dotenv";
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';


// Handle __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load IDL using fs (more reliable than import assertion)
const idl = JSON.parse(
  readFileSync(join(__dirname, './src/idl/Raffle.json'), 'utf-8')
);

dotenv.config();
console.log("Keeper started.....");

// Configuration
const RPC_ENDPOINT = process.env.RPC_URL || 'http://127.0.0.1:8899';
const PROGRAM_ID = new PublicKey('5CmMWJpHYhPjmhCXaaLU2WskBBB5HJ4yzDv6JzXEiDnz');

// Switchboard OnDemand feed (devnet example)
const SWITCHBOARD_FEED = new PublicKey('GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR');

// Initialize connection
const connection = new Connection(RPC_ENDPOINT, 'confirmed');

// Create wallet from private key
const walletKeypair = anchor.web3.Keypair.fromSecretKey(
  Buffer.from(
    JSON.parse(readFileSync(join(__dirname, './keeper-wallet.json'), 'utf-8'))
  )
);

const wallet = new Wallet(walletKeypair);
console.log("Wallet loaded:", wallet.publicKey.toString());

// Create provider
const provider = new AnchorProvider(connection, wallet, {
  commitment: 'confirmed',
});

// Initialize program
const program = new Program(idl as any, provider);

// Keeper function to draw winner for a specific raffle
async function drawWinnerForRaffle(
  rafflePda:PublicKey,
  counter: number,
  seller: PublicKey,
  paymentMint: PublicKey
) {
 
  try {
    // Get current time
    const currentTime = Math.floor(Date.now() / 1000);

    // Fetch raffle account
    const raffleAccount = await (program.account as any).raffleAccount.fetch(rafflePda);

    // Check conditions
    if (
      !raffleAccount.claimed &&
      raffleAccount.status.active &&
      raffleAccount.participants.length > 0 &&
      currentTime > raffleAccount.deadline.toNumber()
    ) {

      console.log(`- Counter: ${counter}`);
      console.log(`- Seller: ${seller.toString()}`);
      console.log(`- Payment Mint: ${paymentMint.toString()}`);

      // Find counter PDA
      const [counterPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('global-counter')],
        PROGRAM_ID
      );

      // Find escrow PDA
      const [escrowPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('escrow_payment'),
          seller.toBuffer(),
          new anchor.BN(counter).toArrayLike(Buffer, 'le', 8)
        ],
        PROGRAM_ID
      );

      console.log(`- Counter PDA: ${counterPDA.toString()}`);
      console.log(`- Escrow PDA: ${escrowPDA.toString()}`);
      console.log("keeper address:",wallet.payer.publicKey.toString())
      // Create transaction
      const tx = await program.methods
        .drawWinner()
        .accounts({
          randomnessAccountData: SWITCHBOARD_FEED,
          raffleAccount: rafflePda,
          counter: counterPDA,
          escrowPaymentAccount: escrowPDA,
          keeper: wallet.payer.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId
        })
        .transaction();

      // Send transaction
      const signature = await sendAndConfirmTransaction(
        connection,
        tx,
        [wallet.payer],
        {
          commitment: 'confirmed',
          skipPreflight: false,
        }
      );

      console.log(`✅ Success! Transaction signature: ${signature}`);

      return signature;
    } else {
      console.log(`⏳ Raffle ${rafflePda.toString()} not ready for drawing:`);
      console.log(`   - Claimed: ${raffleAccount.claimed}`);
      console.log(`   - Status: ${JSON.stringify(raffleAccount.status)}`);
      console.log(`   - Participants: ${raffleAccount.participants.length}`);
      console.log(`   - Current time: ${currentTime}`);
      console.log(`   - Deadline: ${raffleAccount.deadline.toNumber()}`);
      console.log(`   - Deadline passed: ${currentTime > raffleAccount.deadline.toNumber()}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error drawing winner for ${rafflePda.toString()}:`, error);
    if (error instanceof Error) {
      console.error(`   Error message: ${error.message}`);
      console.error(`   Error stack: ${error.stack}`);
    }
    return null;
  }
}

// Main keeper function to scan all raffles
async function scanAndDrawWinners() {
  try {
    console.log(`\n[${new Date().toISOString()}] 🔍 Scanning for raffles...`);

    // Fetch all raffle accounts
    const allRaffles = await (program.account as any).raffleAccount.all();

    console.log(`Found ${allRaffles.length} total raffles`);

    // Filter for active raffles past deadline
    const currentTime = Math.floor(Date.now() / 1000);
    let processedCount = 0;
    let eligibleCount = 0;

    for (const raffle of allRaffles) {
      const raffleData = raffle.account;
      console.log("current time:",currentTime)
      console.log("deadline:",raffleData.deadline.toNumber())
      if (
        raffleData.status.active &&
        !raffleData.claimed &&
        raffleData.participants.length > 0 &&
        currentTime > raffleData.deadline.toNumber()
      ) {
        eligibleCount++;
        console.log(`\n📋 Processing eligible raffle ${eligibleCount}: ${raffle.publicKey.toString()}`);
        console.log("counter:",raffleData.raffleId?.toNumber())
        console.log("seller:",raffleData.seller.toString())
        console.log("raffle key:",raffle.publicKey?.toString())
        const result = await drawWinnerForRaffle(
          raffle.publicKey,
          raffleData.raffleId?.toNumber() || 0,
          raffle.account.seller,
          raffle.account.paymentMint
        );

        if (result) {
          processedCount++;
        }

        // Small delay to avoid rate limiting
        await sleep(2000);
      }
    }

    console.log(`\n[${new Date().toISOString()}] ✅ Scan completed.`);
    console.log(`   - Total raffles: ${allRaffles.length}`);
    console.log(`   - Eligible raffles: ${eligibleCount}`);
    console.log(`   - Successfully processed: ${processedCount}`);
  } catch (error) {
    console.error('❌ Error scanning raffles:', error);
    if (error instanceof Error) {
      console.error(`   Error message: ${error.message}`);
    }
  }
}

// Run keeper every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  console.log('\n⏰ Running scheduled raffle keeper check...');
  await scanAndDrawWinners();
});

// Main function
async function main() {
  console.log('🚀 Starting raffle keeper...');
  console.log(`   - RPC Endpoint: ${RPC_ENDPOINT}`);
  console.log(`   - Program ID: ${PROGRAM_ID.toString()}`);
  console.log(`   - Wallet: ${wallet.publicKey.toString()}`);
  console.log(`   - Switchboard Feed: ${SWITCHBOARD_FEED.toString()}`);

  // Initial scan
  await scanAndDrawWinners();

  console.log('\n⏰ Cron job scheduled: every 5 minutes');
  console.log('🔄 Keeper is now running...\n');

  // Keep process alive
  setInterval(() => {
    // Keep-alive ping
    console.log(`[${new Date().toISOString()}] 💓 Keeper alive`);
  }, 1000 * 60 * 30); // Every 30 minutes
}

// Start the keeper
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

export { scanAndDrawWinners, drawWinnerForRaffle };