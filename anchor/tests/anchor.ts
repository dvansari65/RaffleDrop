import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { 
  PublicKey, 
  Keypair, 
  LAMPORTS_PER_SOL, 
  SystemProgram, 
  SYSVAR_RENT_PUBKEY 
} from "@solana/web3.js";
import { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMint,
  createAssociatedTokenAccount,
  mintTo,
  getAccount
} from "@solana/spl-token";
import { Raffle } from "../target/types/Raffle";
import { expect } from "chai";

// =============================================
// TEST UTILITIES
// =============================================

const DEFAULT_WAIT_MS = 500;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function airdropWithRetry(
  connection: anchor.web3.Connection,
  publicKey: PublicKey,
  lamports: number,
  maxRetries = 5
): Promise<string> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const airdropSig = await connection.requestAirdrop(publicKey, lamports);
      
      const latestBlockhash = await connection.getLatestBlockhash("finalized");
      await connection.confirmTransaction({
        signature: airdropSig,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
      }, "finalized");
      
      await wait(DEFAULT_WAIT_MS);
      const balance = await connection.getBalance(publicKey);
      
      if (balance >= lamports) {
        return airdropSig;
      }
      
      throw new Error(`Airdrop incomplete: Expected ${lamports}, got ${balance}`);
      
    } catch (error: any) {
      console.warn(`Airdrop attempt ${attempt + 1}/${maxRetries} failed:`, error.message);
      
      if (attempt === maxRetries - 1) {
        throw new Error(`Airdrop failed after ${maxRetries} attempts: ${error.message}`);
      }
      
      const backoff = 1000 * Math.pow(2, attempt);
      await wait(backoff + Math.random() * 100);
    }
  }
  throw new Error("Unexpected airdrop failure");
}

// =============================================
// TEST SUITE: RAFFLE PROGRAM
// =============================================

describe("Raffle Program Integration Tests", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Raffle as Program<Raffle>;
  
  const RAFFLE_SEED = "raffle";
  const ESCROW_SEED = "escrow_payment";
  const COUNTER_SEED = "global-counter";
  
  const TEST_ITEM = {
    name: "Epic Test NFT",
    description: "A rare digital collectible for testing",
    imageUri: "https://arweave.net/test-image"
  };
  
  // Helper to ensure counter exists
  async function ensureCounterExists(): Promise<PublicKey> {
    const [counterPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from(COUNTER_SEED)],
      program.programId
    );
    
    try {
      await program.account.counter.fetch(counterPDA);
      return counterPDA;
    } catch {
      const signer = Keypair.generate();
      await airdropWithRetry(provider.connection, signer.publicKey, LAMPORTS_PER_SOL);
      
      await program.methods
        .initialiseCounter()
        .accounts({
          counter: counterPDA,
          signer: signer.publicKey,
          systemProgram: SystemProgram.programId
        })
        .signers([signer])
        .rpc();
      
      return counterPDA;
    }
  }
  
  // =============================================
  // TEST: INITIALIZE COUNTER (IDEMPOTENT)
  // =============================================
  
  it("should handle counter initialization (idempotent)", async () => {
    console.group("🔢 Testing: counter initialization");
    
    const signer = Keypair.generate();
    await airdropWithRetry(provider.connection, signer.publicKey, LAMPORTS_PER_SOL);
    
    const [counterPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from(COUNTER_SEED)],
      program.programId
    );
    
    console.log(`   Counter PDA: ${counterPDA.toString()}`);
    
    try {
      // Try to initialize - might fail if already exists
      const txSignature = await program.methods
        .initialiseCounter()
        .accounts({
          counter: counterPDA,
          signer: signer.publicKey,
          systemProgram: SystemProgram.programId
        })
        .signers([signer])
        .rpc({
          skipPreflight: false,
          commitment: "confirmed"
        });
      
      console.log(`   Transaction: ${txSignature}`);
      console.log("✅ Counter initialized or already exists");
      
    } catch (error: any) {
      // If it fails because account already exists, that's OK
      if (error.message.includes("already in use") || 
          error.logs?.some((log: string) => log.includes("already in use"))) {
        console.log("✅ Counter already exists (as expected)");
      } else {
        console.error("❌ Unexpected error:", error);
        throw error;
      }
    }
    
    // Verify counter exists and has value
    const counterAccount = await program.account.counter.fetch(counterPDA);
    console.log(`   Counter value: ${counterAccount.counter.toString()}`);
    console.groupEnd();
  });
  
  // =============================================
  // TEST: CREATE RAFFLE (SUCCESS CASE)
  // =============================================
  
  it("should successfully create a raffle with valid parameters", async () => {
    console.group("🎟️ Testing: create_raffle (success)");
    
    // Use SMALLER values for testing
    const sellingPrice = new BN(1); // 1 USDC
    const ticketPrice = new BN(100_000); // 0.1 USDC in smallest units
    const minTickets = 2;
    const maxTickets = 10;
    const deadline = new BN(Math.floor(Date.now() / 1000) + 86400);
    
    const seller = Keypair.generate();
    console.log(`   Seller: ${seller.publicKey.toString()}`);
    
    await airdropWithRetry(
      provider.connection,
      seller.publicKey,
      3 * LAMPORTS_PER_SOL
    );
    
    // Create payment mint
    const paymentMint = await createMint(
      provider.connection,
      seller,
      seller.publicKey,
      null,
      6
    );
    console.log(`   Mint: ${paymentMint.toString()}`);
    
    // Create seller token account
    const sellerTokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      seller,
      paymentMint,
      seller.publicKey
    );
    
    // Fund seller with tokens - MORE tokens for testing
    const tokensToMint = 1000 * 10 ** 6; // 1000 USDC
    await mintTo(
      provider.connection,
      seller,
      paymentMint,
      sellerTokenAccount,
      seller,
      tokensToMint
    );
    
    // Get counter
    const counterPDA = await ensureCounterExists();
    const counterAccount = await program.account.counter.fetch(counterPDA);
    const currentCounter = counterAccount.counter;
    
    console.log(`   Current counter: ${currentCounter.toString()}`);
    
    // Generate raffle PDA with current counter
    const [rafflePDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from(RAFFLE_SEED),
        seller.publicKey.toBuffer(),
        currentCounter.toArrayLike(Buffer, "le", 8)
      ],
      program.programId
    );
    
    // Generate escrow PDA with seller key
    const [escrowPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from(ESCROW_SEED),
        seller.publicKey.toBuffer(),
        currentCounter.toArrayLike(Buffer, "le", 8)
      ],
      program.programId
    );
    
    console.log(`   Raffle PDA: ${rafflePDA.toString()}`);
    console.log(`   Escrow PDA: ${escrowPDA.toString()}`);
    
    try {
      console.log("   Creating raffle...");
      
      const txSignature = await program.methods
        .createRaffle(
          TEST_ITEM.name,
          TEST_ITEM.description,
          TEST_ITEM.imageUri,
          sellingPrice, // 1 USDC
          ticketPrice,  // 0.1 USDC (will be multiplied by 1,000,000 in program)
          minTickets,
          maxTickets,
          deadline
        )
        .accounts({
          seller: seller.publicKey,
          counter: counterPDA,
          paymentMint: paymentMint,
          sellerTokenAccount: sellerTokenAccount,
          raffleAccount: rafflePDA,
          escrowPaymentAccount: escrowPDA,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY
        })
        .signers([seller])
        .rpc({
          skipPreflight: false,
          commitment: "confirmed"
        });
      
      console.log(`   Transaction: ${txSignature}`);
      
      await wait(1000);
      
      // Verify raffle account state
      const raffleAccount = await program.account.raffleAccount.fetch(rafflePDA);
      
      // Core assertions
      expect(raffleAccount.seller.toString()).to.equal(seller.publicKey.toString());
      expect(raffleAccount.paymentMint.toString()).to.equal(paymentMint.toString());
      expect(raffleAccount.itemName).to.equal(TEST_ITEM.name);
      
      // Program multiplies sellingPrice by 1,000,000
      const expectedSellingPrice = sellingPrice.mul(new BN(1_000_000));
      expect(raffleAccount.sellingPrice.toString()).to.equal(expectedSellingPrice.toString());
      
      // Ticket price is also multiplied by 1,000,000 in program
      const expectedTicketPrice = ticketPrice.mul(new BN(1_000_000));
      expect(raffleAccount.ticketPrice.toString()).to.equal(expectedTicketPrice.toString());
      
      console.log(`   Expected ticket price: ${expectedTicketPrice.toString()}`);
      console.log(`   Actual ticket price: ${raffleAccount.ticketPrice.toString()}`);
      
      expect(raffleAccount.minTickets).to.equal(minTickets);
      expect(raffleAccount.maxTickets).to.equal(maxTickets);
      expect(raffleAccount.totalCollected.toString()).to.equal("0");
      
      // Verify counter was incremented
      const updatedCounter = await program.account.counter.fetch(counterPDA);
      expect(updatedCounter.counter.toString()).to.equal(currentCounter.add(new BN(1)).toString());
      
      console.log("✅ Raffle created successfully");
      console.log(`   Selling Price: ${raffleAccount.sellingPrice.toString()}`);
      console.log(`   Ticket Price: ${raffleAccount.ticketPrice.toString()}`);
      console.log(`   Counter: ${updatedCounter.counter.toString()}`);
      console.groupEnd();
      
    } catch (error: any) {
      console.error("❌ Raffle creation failed:", error);
      if (error.logs) {
        error.logs.forEach((log: string) => console.error(`   ${log}`));
      }
      throw error;
    }
  });
  
  // =============================================
  // TEST: BUY TICKETS
  // =============================================
  
  it("should allow buying tickets", async () => {
    console.group("🎫 Testing: buy_tickets");
    
    // Create seller
    const seller = Keypair.generate();
    await airdropWithRetry(provider.connection, seller.publicKey, 3 * LAMPORTS_PER_SOL);
    
    // Create payment mint
    const paymentMint = await createMint(
      provider.connection,
      seller,
      seller.publicKey,
      null,
      6
    );
    
    // Create seller token account
    const sellerTokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      seller,
      paymentMint,
      seller.publicKey
    );
    
    // Fund seller generously
    await mintTo(
      provider.connection,
      seller,
      paymentMint,
      sellerTokenAccount,
      seller,
      10000 * 10 ** 6 // 10,000 USDC
    );
    
    // Get counter
    const counterPDA = await ensureCounterExists();
    const counterAccount = await program.account.counter.fetch(counterPDA);
    const currentCounter = counterAccount.counter;
    
    // Generate PDAs
    const [rafflePDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from(RAFFLE_SEED),
        seller.publicKey.toBuffer(),
        currentCounter.toArrayLike(Buffer, "le", 8)
      ],
      program.programId
    );
    
    const [escrowPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from(ESCROW_SEED),
        seller.publicKey.toBuffer(),
        currentCounter.toArrayLike(Buffer, "le", 8)
      ],
      program.programId
    );
    
    // Use MUCH SMALLER prices for testing
    const sellingPrice = new BN(1); // 1 USDC
    const ticketPrice = new BN(10_000); // 0.01 USDC (tiny amount for testing)
    const minTickets = 2;
    const maxTickets = 100;
    const deadline = new BN(Math.floor(Date.now() / 1000) + 86400);
    
    // Create raffle
    await program.methods
      .createRaffle(
        TEST_ITEM.name,
        TEST_ITEM.description,
        TEST_ITEM.imageUri,
        sellingPrice,
        ticketPrice,
        minTickets,
        maxTickets,
        deadline
      )
      .accounts({
        seller: seller.publicKey,
        counter: counterPDA,
        paymentMint: paymentMint,
        sellerTokenAccount: sellerTokenAccount,
        raffleAccount: rafflePDA,
        escrowPaymentAccount: escrowPDA,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY
      })
      .signers([seller])
      .rpc();
    
    await wait(1000);
    
    // Get actual ticket price from raffle account
    const raffleAccount = await program.account.raffleAccount.fetch(rafflePDA);
    const actualTicketPrice = raffleAccount.ticketPrice;
    console.log(`   Actual ticket price from raffle: ${actualTicketPrice.toString()}`);
    
    // Create buyer
    const buyer = Keypair.generate();
    await airdropWithRetry(provider.connection, buyer.publicKey, LAMPORTS_PER_SOL);
    
    // Create buyer token account
    const buyerTokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      buyer,
      paymentMint,
      buyer.publicKey
    );
    
    // Fund buyer with EXACTLY enough tokens for the test
    const numTickets = 3;
    const totalPrice = actualTicketPrice.mul(new BN(numTickets));
    console.log(`   Total price for ${numTickets} tickets: ${totalPrice.toString()}`);
    
    // Convert to decimal units for mintTo
    const totalPriceInDecimal = totalPrice.div(new BN(10 ** 6)); // Convert from smallest units
    console.log(`   Total price in decimal: ${totalPriceInDecimal.toString()}`);
    
    await mintTo(
      provider.connection,
      seller,
      paymentMint,
      buyerTokenAccount,
      seller,
      totalPrice.toNumber() // Use the exact amount needed
    );
    
    // Verify buyer has enough tokens
    const buyerBalance = await getAccount(provider.connection, buyerTokenAccount);
    console.log(`   Buyer token balance: ${buyerBalance.amount.toString()}`);
    console.log(`   Required amount: ${totalPrice.toString()}`);
    
    try {
      console.log(`   Buying ${numTickets} tickets...`);
      
      const txSignature = await program.methods
        .buyTickets(numTickets)
        .accounts({
          buyer: buyer.publicKey,
          buyerTokenAccont: buyerTokenAccount,
          raffleAccount: rafflePDA,
          counter: counterPDA,
          escrowPaymentAccount: escrowPDA,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId
        })
        .signers([buyer])
        .rpc({
          skipPreflight: false,
          commitment: "confirmed"
        });
      
      console.log(`   Transaction: ${txSignature}`);
      
      await wait(1000);
      
      // Verify raffle state
      const updatedRaffle = await program.account.raffleAccount.fetch(rafflePDA);
      
      expect(updatedRaffle.totalCollected.toString()).to.equal(totalPrice.toString());
      expect(updatedRaffle.participants.length).to.equal(numTickets);
      expect(updatedRaffle.participants[0].toString()).to.equal(buyer.publicKey.toString());
      
      console.log("✅ Tickets bought successfully");
      console.log(`   Total collected: ${updatedRaffle.totalCollected.toString()}`);
      console.log(`   Participants: ${updatedRaffle.participants.length}`);
      console.groupEnd();
      
    } catch (error: any) {
      console.error("❌ Ticket purchase failed:", error);
      if (error.logs) {
        error.logs.forEach((log: string) => console.error(`   ${log}`));
      }
      throw error;
    }
  });
  
  // =============================================
  // TEST: CREATE RAFFLE VALIDATION ERRORS
  // =============================================
  
  describe("create_raffle validation errors", () => {
    const baseParams = {
      name: TEST_ITEM.name,
      description: TEST_ITEM.description,
      imageUri: TEST_ITEM.imageUri,
      minTickets: 10,
      maxTickets: 100,
      deadline: new BN(Math.floor(Date.now() / 1000) + 86400)
    };
    
    it("should reject zero selling price", async () => {
      console.group("🧪 Testing: zero selling price rejection");
      
      const seller = Keypair.generate();
      await airdropWithRetry(provider.connection, seller.publicKey, LAMPORTS_PER_SOL);
      
      const paymentMint = await createMint(
        provider.connection,
        seller,
        seller.publicKey,
        null,
        6
      );
      
      const sellerTokenAccount = await createAssociatedTokenAccount(
        provider.connection,
        seller,
        paymentMint,
        seller.publicKey
      );
      
      const counterPDA = await ensureCounterExists();
      const counterAccount = await program.account.counter.fetch(counterPDA);
      const currentCounter = counterAccount.counter;
      
      const [rafflePDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(RAFFLE_SEED),
          seller.publicKey.toBuffer(),
          currentCounter.toArrayLike(Buffer, "le", 8)
        ],
        program.programId
      );
      
      const [escrowPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(ESCROW_SEED),
          seller.publicKey.toBuffer(),
          currentCounter.toArrayLike(Buffer, "le", 8)
        ],
        program.programId
      );
      
      try {
        await program.methods
          .createRaffle(
            baseParams.name,
            baseParams.description,
            baseParams.imageUri,
            new BN(0),
            new BN(100_000),
            baseParams.minTickets,
            baseParams.maxTickets,
            baseParams.deadline
          )
          .accounts({
            seller: seller.publicKey,
            counter: counterPDA,
            paymentMint: paymentMint,
            sellerTokenAccount: sellerTokenAccount,
            raffleAccount: rafflePDA,
            escrowPaymentAccount: escrowPDA,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY
          })
          .signers([seller])
          .rpc();
        
        throw new Error("Expected transaction to fail");
        
      } catch (error: any) {
        const errorString = JSON.stringify(error);
        expect(
          errorString.includes("InvalidPrice") ||
          errorString.includes("0x1770") || // 6000 in hex
          error.logs?.some((log: string) => log.includes("InvalidPrice"))
        ).to.be.true;
        
        console.log("✅ Correctly rejected zero selling price");
        console.groupEnd();
      }
    });
    
    // Add other validation tests similarly...
  });
  
  // =============================================
  // CLEANUP
  // =============================================
  
  after(async () => {
    console.log("\n" + "=".repeat(50));
    console.log("🧹 Test suite completed");
    console.log("=".repeat(50));
    
    try {
      const [counterPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from(COUNTER_SEED)],
        program.programId
      );
      
      const counter = await program.account.counter.fetch(counterPDA);
      console.log(`Final counter value: ${counter.counter.toString()}`);
    } catch {
      console.log("Counter account not accessible");
    }
  });
});