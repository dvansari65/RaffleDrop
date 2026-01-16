import { Connection, Keypair, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor';
import * as anchor from '@coral-xyz/anchor';
import { sleep } from '@switchboard-xyz/common';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from "http"
import { Server } from "socket.io"
import * as dotenv from "dotenv"
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { withRetry } from '@/helpers/withRetry';
import cron from "node-cron"
import * as sb from "@switchboard-xyz/on-demand";


dotenv.config()

const keyPair = Keypair.generate();
// Handle __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load IDL using fs (more reliable than import assertion)
const idl = JSON.parse(
  readFileSync(join(__dirname, './src/idl/Raffle.json'), 'utf-8')
);

dotenv.config();

// Configuration
const RPC_ENDPOINT = process.env.RPC_URL || 'http://127.0.0.1:8899';
const PROGRAM_ID = new PublicKey('5CmMWJpHYhPjmhCXaaLU2WskBBB5HJ4yzDv6JzXEiDnz');

// Initialize connection
const connection = new Connection(RPC_ENDPOINT, 'confirmed');

// Create wallet from private key
const walletKeypair = anchor.web3.Keypair.fromSecretKey(
  Buffer.from(
    JSON.parse(readFileSync(join(__dirname, './keeper-wallet.json'), 'utf-8'))
  )
);

const myWallet = new Wallet(walletKeypair);

// Create provider
const provider = new AnchorProvider(connection, myWallet, {
  commitment: 'confirmed',
});

// Initialize program
const myProgram = new Program(idl as any, provider);

// Keeper function to draw winner for a specific raffle
async function drawWinnerForRaffle(
  rafflePda: PublicKey,
  counter: number,
  seller: PublicKey,
  paymentMint: PublicKey
) {
  console.clear();
  try {
    // Get current time
    const currentTime = Math.floor(Date.now() / 1000);

    // Fetch raffle account
    const raffleAccount = await (myProgram.account as any).raffleAccount.fetch(rafflePda);
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
      const {wallet} = await  sb.AnchorUtils.loadEnv()
      if(!connection){
        return;
      }
      //load sb program
      const sbProgram = await sb.AnchorUtils.loadProgramFromConnection(
        connection,
        myWallet,
        PROGRAM_ID
      );

      if(!sbProgram || !myProgram){
        throw new Error("Sb program or myProgram not found!")
      }
      // getting queue account
      const queue = await sb.getDefaultQueue(connection.rpcEndpoint)
      console.log("queue:",queue)
       // Generate randomness keypair
      const randomnessKeypair = Keypair.generate();
      
      //creating randomness account and getting its transaction
      const [randomness, createIx] = await sb.Randomness.create(sbProgram,randomnessKeypair,queue.pubkey)

      if (!randomness || !createIx) {
        throw new Error("Random account data not found!")
      }
      //send creation transaction
      const createTx = await sb.asV0Tx({
        connection,
        ixs: [createIx],
        payer: walletKeypair.publicKey,
        signers:[walletKeypair,randomnessKeypair],
        computeUnitPrice: 75_000,
        computeUnitLimitMultiple: 1.3,
      })
      //sending create transaction
      const createSig =  await connection.sendTransaction(createTx)
      await connection.confirmTransaction(createSig, "confirmed");
      // Wait a bit for account to be ready
      await sleep(2000);
      //creating the commit transaction
      const commitIx = await randomness.commitIx(queue.pubkey,randomnessKeypair.publicKey)
      
      // calling the draw instruction
      const tx = await myProgram.methods
      .drawWinner()
      .accounts({
        randomnessAccountData: randomnessKeypair.publicKey,
        raffleAccount: rafflePda,
        counter: counterPDA,
        escrowPaymentAccount: escrowPDA,
        keeper: walletKeypair.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId
      })
      .instruction();

      // bundle commitIx and draw winner 
      const commitTx = await sb.asV0Tx({
        connection,
        ixs:[commitIx,tx],
        payer:walletKeypair.publicKey,
        signers:[walletKeypair,randomnessKeypair],
        computeUnitPrice: 75_000,
        computeUnitLimitMultiple: 1.3,
      })

      // send transaction and added retry logic
      const commitSig = await withRetry(
        async ()=>{
          return await connection.sendTransaction(commitTx)
        },
        {retries:3}
      )
      // confirm transaction
      await connection.confirmTransaction(
        commitSig,
        "confirmed"
      )
      
      console.log("Committed! Transaction:", commitSig);
      console.log(`- Counter PDA: ${counterPDA.toString()}`);
      console.log(`- Escrow PDA: ${escrowPDA.toString()}`);
      console.log("keeper address:", wallet.payer.publicKey.toString())
      return commitSig;
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

// // Main keeper function to scan all raffles
async function scanAndDrawWinners() {
  try {
    console.log(`\n[${new Date().toISOString()}] 🔍 Scanning for raffles...`);

    let results: any[] = [];
    // Fetch all raffle accounts
    const allRaffles = await (myProgram.account as any).raffleAccount.all();

    console.log(`Found ${allRaffles.length} total raffles`);

    // Filter for active raffles past deadline
    const currentTime = Math.floor(Date.now() / 1000);
    let processedCount = 0;
    let eligibleCount = 0;

    for (const raffle of allRaffles) {
      const raffleData = raffle.account;
      console.log("current time:", currentTime)
      console.log("deadline:", raffleData.deadline.toNumber())
      if (
        raffleData.status.active &&
        !raffleData.claimed &&
        raffleData.participants.length > 0 &&
        currentTime > raffleData.deadline.toNumber()
      ) {
        eligibleCount++;
        console.log(`\n📋 Processing eligible raffle ${eligibleCount}: ${raffle.publicKey.toString()}`);
        console.log("counter:", raffleData.raffleId?.toNumber())
        console.log("seller:", raffleData.seller.toString())
        console.log("raffle key:", raffle.publicKey?.toString())
        
        const result = await drawWinnerForRaffle(
          raffle.publicKey,
          raffleData.raffleId?.toNumber() || 0,
          raffle.account.seller,
          raffle.account.paymentMint
        );

        if (result) {
          processedCount++;
          results.push({
            winnerPubkey: raffleData.winner?.toString(),
            claimed: raffleData.claimed,
            raffleKey: raffle.publicKey.toString(),
            signature: result
          });
        }
        // Small delay to avoid rate limiting
        await sleep(2000);
      }
    }

    console.log(`\n[${new Date().toISOString()}] ✅ Scan completed.`);
    console.log(`   - Total raffles: ${allRaffles.length}`);
    console.log(`   - Eligible raffles: ${eligibleCount}`);
    console.log(`   - Successfully processed: ${processedCount}`);
    return results;
  } catch (error) {
    console.error('❌ Error scanning raffles:', error);
    if (error instanceof Error) {
      console.error(`   Error message: ${error.message}`);
    }
    throw error
  }
}

const server = createServer()
const io = new Server(server, {
  cors: {
    methods: ["POST", "GET"],
    origin: "*"
  }
})

async function KeeperLoop() {
  try {
    const results = await scanAndDrawWinners()
    if (results && results?.length > 0) {
      io.emit("winner-selected", results)
    }
  } catch (error) {
    throw error;
  }
}
cron.schedule('* * * * *', async () => {
  console.log(`⏰ Cron triggered at ${new Date().toISOString()}`);
  console.log('⏳ Waiting 30 seconds before running keeper...');

  // Wait 30 seconds

  console.log('▶️ 30 seconds passed, running keeper now...');
  await KeeperLoop();
});

io.on("connect", async (socket) => {
  console.log("socket connected:", socket.id)
  await KeeperLoop()
  socket.on("disconnect", () => {
    console.log("socket disconnected!")
  })
})

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  console.log(`Socket server is running on ${PORT}`)
})