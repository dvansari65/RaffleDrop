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
// ENHANCED TEST UTILITIES
// =============================================

const DEFAULT_WAIT_MS = 500;
const EXPONENTIAL_BACKOFF_BASE = 1000;

/**
 * Exponential backoff with jitter for robust test execution
 */
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Resilient airdrop with retry logic and confirmation verification
 */
async function airdropWithRetry(
  connection: anchor.web3.Connection,
  publicKey: PublicKey,
  lamports: number,
  maxRetries = 5
): Promise<string> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const airdropSig = await connection.requestAirdrop(publicKey, lamports);
      
      // Use finalized commitment for maximum confirmation
      const latestBlockhash = await connection.getLatestBlockhash("finalized");
      await connection.confirmTransaction({
        signature: airdropSig,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
      }, "finalized");
      
      // Post-confirmation validation
      await wait(DEFAULT_WAIT_MS);
      const balance = await connection.getBalance(publicKey);
      
      if (balance >= lamports) {
        return airdropSig;
      }
      
      throw new Error(`Airdrop incomplete: Expected ${lamports}, got ${balance}`);
      
    } catch (error) {
      console.warn(`Airdrop attempt ${attempt + 1}/${maxRetries} failed:`, error.message);
      
      if (attempt === maxRetries - 1) {
        throw new Error(`Airdrop failed after ${maxRetries} attempts: ${error.message}`);
      }
      
      // Exponential backoff with jitter
      const backoff = EXPONENTIAL_BACKOFF_BASE * Math.pow(2, attempt);
      await wait(backoff + Math.random() * 100);
    }
  }
  throw new Error("Unexpected airdrop failure");
}

// =============================================
// TEST SUITE: RAFFLE PROGRAM
// =============================================

describe("Raffle Program Integration Tests", () => {
  // Program initialization
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Raffle as Program<Raffle>;
  
  // Constants (matching program seeds)
  const RAFFLE_SEED = "raffle";
  const ESCROW_SEED = "escrow_payment";
  const COUNTER_SEED = "global-counter";
  
  // Test metadata
  const TEST_ITEM = {
    name: "Epic Test NFT",
    description: "A rare digital collectible for testing",
    imageUri: "https://arweave.net/test-image"
  };
  
  // =============================================
  // TEST CONTEXT FACTORY
  // =============================================
  
  interface TestContext {
    seller: Keypair;
    paymentMint: PublicKey;
    sellerTokenAccount: PublicKey;
    rafflePDA: PublicKey;
    escrowPDA: PublicKey;
    counterPDA: PublicKey;
  }
  
  /**
   * Creates a comprehensive test environment with proper state isolation
   */
  async function createTestContext(
    sellingPrice: anchor.BN,
    deadline: anchor.BN
  ): Promise<TestContext> {
    console.group(`🧪 Creating test context`);
    
    try {
      // 1. Generate seller with funded wallet
      const seller = Keypair.generate();
      console.log(`   Seller: ${seller.publicKey.toString()}`);
      
      await airdropWithRetry(
        provider.connection,
        seller.publicKey,
        3 * LAMPORTS_PER_SOL // Ample SOL for multiple transactions
      );
      
      const solBalance = await provider.connection.getBalance(seller.publicKey);
      console.log(`   Balance: ${solBalance / LAMPORTS_PER_SOL} SOL`);
      expect(solBalance).to.be.greaterThan(0);
      
      // 2. Create payment mint (simulating USDC with 6 decimals)
      const paymentMint = await createMint(
        provider.connection,
        seller,
        seller.publicKey,
        null,
        6 // Standard USDC decimals
      );
      console.log(`   Mint: ${paymentMint.toString()}`);
      
      // 3. Create and fund seller's token account
      const sellerTokenAccount = await createAssociatedTokenAccount(
        provider.connection,
        seller,
        paymentMint,
        seller.publicKey
      );
      
      // Mint substantial test tokens (100 USDC equivalent)
      const tokensToMint = 100 * 10 ** 6; // 100 USDC
      await mintTo(
        provider.connection,
        seller,
        paymentMint,
        sellerTokenAccount,
        seller,
        tokensToMint
      );
      
      const tokenBalance = await getAccount(provider.connection, sellerTokenAccount);
      console.log(`   Token Balance: ${Number(tokenBalance.amount) / 10 ** 6} USDC`);
      
      // 4. Derive PDAs (note: counter-based seed as per program)
      const [counterPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from(COUNTER_SEED)],
        program.programId
      );
      
      // IMPORTANT: Program uses counter in raffle PDA, not seller price/deadline
      const [rafflePDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(RAFFLE_SEED),
          seller.publicKey.toBuffer(),
          new BN(0).toArrayLike(Buffer, "le", 8) // Initial counter value
        ],
        program.programId
      );
      
      const [escrowPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(ESCROW_SEED),
          rafflePDA.toBuffer()
        ],
        program.programId
      );
      
      console.log(`   Counter PDA: ${counterPDA.toString()}`);
      console.log(`   Raffle PDA: ${rafflePDA.toString()}`);
      console.log(`   Escrow PDA: ${escrowPDA.toString()}`);
      console.groupEnd();
      
      return {
        seller,
        paymentMint,
        sellerTokenAccount,
        rafflePDA,
        escrowPDA,
        counterPDA
      };
      
    } catch (error) {
      console.error("❌ Test context creation failed:", error);
      throw error;
    }
  }
  
  // =============================================
  // TEST: INITIALIZE COUNTER
  // =============================================
  
  it("should initialize global counter account", async () => {
    console.group("🔢 Testing: initialize_counter");
    
    const signer = Keypair.generate();
    await airdropWithRetry(provider.connection, signer.publicKey, LAMPORTS_PER_SOL);
    
    const [counterPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from(COUNTER_SEED)],
      program.programId
    );
    
    console.log(`   Counter PDA: ${counterPDA.toString()}`);
    
    try {
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
      
      // Verify account state
      const counterAccount = await program.account.counter.fetch(counterPDA);
      expect(counterAccount.counter.toString()).to.equal("0");
      
      console.log("✅ Counter initialized successfully");
      console.groupEnd();
      
    } catch (error) {
      console.error("❌ Counter initialization failed:", error);
      if (error.logs) {
        error.logs.forEach((log: string) => console.error(`   ${log}`));
      }
      throw error;
    }
  });
  
  // =============================================
  // TEST: CREATE RAFFLE (SUCCESS CASE)
  // =============================================
  
  it("should successfully create a raffle with valid parameters", async () => {
    console.group("🎟️ Testing: create_raffle (success)");
    
    // Test parameters (matching program expectations)
    const sellingPrice = new BN(1); // 1 USDC (will be multiplied by 1_000_000 in program)
    const ticketPrice = new BN(0.1 * 1_000_000); // 0.1 USDC in smallest units
    const minTickets = 10;
    const maxTickets = 100;
    const deadline = new BN(Math.floor(Date.now() / 1000) + 86400); // 24h future
    
    const context = await createTestContext(sellingPrice, deadline);
    
    try {
      // First, ensure counter exists
      try {
        await program.account.counter.fetch(context.counterPDA);
      } catch {
        // Initialize counter if it doesn't exist
        const initializer = Keypair.generate();
        await airdropWithRetry(provider.connection, initializer.publicKey, LAMPORTS_PER_SOL);
        
        await program.methods
          .initialiseCounter()
          .accounts({
            counter: context.counterPDA,
            signer: initializer.publicKey,
            systemProgram: SystemProgram.programId
          })
          .signers([initializer])
          .rpc();
      }
      
      console.log("   Creating raffle...");
      
      const txSignature = await program.methods
        .createRaffle(
          TEST_ITEM.name,
          TEST_ITEM.description,
          TEST_ITEM.imageUri,
          sellingPrice, // 1 USDC
          ticketPrice,  // Already in smallest units
          minTickets,
          maxTickets,
          deadline
        )
        .accounts({
          seller: context.seller.publicKey,
          counter: context.counterPDA,
          paymentMint: context.paymentMint,
          sellerTokenAccount: context.sellerTokenAccount,
          raffleAccount: context.rafflePDA,
          escrowPaymentAccount: context.escrowPDA,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY
        })
        .signers([context.seller])
        .rpc({
          skipPreflight: false,
          commitment: "confirmed"
        });
      
      console.log(`   Transaction: ${txSignature}`);
      
      // Wait for state propagation
      await wait(1000);
      
      // Verify raffle account state
      const raffleAccount = await program.account.raffleAccount.fetch(context.rafflePDA);
      
      // Core assertions
      expect(raffleAccount.seller.toString()).to.equal(context.seller.publicKey.toString());
      expect(raffleAccount.paymentMint.toString()).to.equal(context.paymentMint.toString());
      expect(raffleAccount.itemName).to.equal(TEST_ITEM.name);
      expect(raffleAccount.itemDescription).to.equal(TEST_ITEM.description);
      expect(raffleAccount.itemImageUri).to.equal(TEST_ITEM.imageUri);
      
      // IMPORTANT: Program multiplies sellingPrice by 1_000_000
      expect(raffleAccount.sellingPrice.toString()).to.equal(
        sellingPrice.mul(new BN(1_000_000)).toString()
      );
      
      // Ticket price already in smallest units
      expect(raffleAccount.ticketPrice.toString()).to.equal(ticketPrice.toString());
      expect(raffleAccount.minTickets).to.equal(minTickets);
      expect(raffleAccount.maxTickets).to.equal(maxTickets);
      expect(raffleAccount.deadline.toString()).to.equal(deadline.toString());
      expect(raffleAccount.totalCollected.toString()).to.equal("0");
      expect(raffleAccount.participants).to.be.empty;
      expect(raffleAccount.claimed).to.be.false;
      expect(raffleAccount.winner).to.be.null;
      
      // Verify counter was incremented
      const counterAccount = await program.account.counter.fetch(context.counterPDA);
      expect(counterAccount.counter.toString()).to.equal("1");
      
      console.log("✅ Raffle created successfully");
      console.log(`   Selling Price (with decimals): ${raffleAccount.sellingPrice.toString()}`);
      console.log(`   Ticket Price: ${raffleAccount.ticketPrice.toString()}`);
      console.log(`   Counter: ${counterAccount.counter.toString()}`);
      console.groupEnd();
      
    } catch (error) {
      console.error("❌ Raffle creation failed:", error);
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
      
      const context = await createTestContext(new BN(0), baseParams.deadline);
      
      try {
        await program.methods
          .createRaffle(
            baseParams.name,
            baseParams.description,
            baseParams.imageUri,
            new BN(0), // Invalid: zero selling price
            new BN(100_000),
            baseParams.minTickets,
            baseParams.maxTickets,
            baseParams.deadline
          )
          .accounts({
            seller: context.seller.publicKey,
            counter: context.counterPDA,
            paymentMint: context.paymentMint,
            sellerTokenAccount: context.sellerTokenAccount,
            raffleAccount: context.rafflePDA,
            escrowPaymentAccount: context.escrowPDA,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY
          })
          .signers([context.seller])
          .rpc();
        
        throw new Error("Expected transaction to fail");
        
      } catch (error: any) {
        // Verify it's the expected error
        const errorString = JSON.stringify(error);
        expect(
          errorString.includes("InvalidPrice") ||
          errorString.includes("6000") ||
          error.logs?.some((log: string) => log.includes("InvalidPrice"))
        ).to.be.true;
        
        console.log("✅ Correctly rejected zero selling price");
        console.groupEnd();
      }
    });
    
    it("should reject zero ticket price", async () => {
      console.group("🧪 Testing: zero ticket price rejection");
      
      const context = await createTestContext(new BN(1_000_000), baseParams.deadline);
      
      try {
        await program.methods
          .createRaffle(
            baseParams.name,
            baseParams.description,
            baseParams.imageUri,
            new BN(1),
            new BN(0), // Invalid: zero ticket price
            baseParams.minTickets,
            baseParams.maxTickets,
            baseParams.deadline
          )
          .accounts({
            seller: context.seller.publicKey,
            counter: context.counterPDA,
            paymentMint: context.paymentMint,
            sellerTokenAccount: context.sellerTokenAccount,
            raffleAccount: context.rafflePDA,
            escrowPaymentAccount: context.escrowPDA,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY
          })
          .signers([context.seller])
          .rpc();
        
        throw new Error("Expected transaction to fail");
        
      } catch (error: any) {
        const errorString = JSON.stringify(error);
        expect(
          errorString.includes("InvalidPrice") ||
          errorString.includes("6000")
        ).to.be.true;
        
        console.log("✅ Correctly rejected zero ticket price");
        console.groupEnd();
      }
    });
    
    it("should reject max tickets < min tickets", async () => {
      console.group("🧪 Testing: invalid ticket count rejection");
      
      const context = await createTestContext(new BN(1_000_000), baseParams.deadline);
      
      try {
        await program.methods
          .createRaffle(
            baseParams.name,
            baseParams.description,
            baseParams.imageUri,
            new BN(1),
            new BN(100_000),
            10, // minTickets
            5,  // Invalid: maxTickets < minTickets
            baseParams.deadline
          )
          .accounts({
            seller: context.seller.publicKey,
            counter: context.counterPDA,
            paymentMint: context.paymentMint,
            sellerTokenAccount: context.sellerTokenAccount,
            raffleAccount: context.rafflePDA,
            escrowPaymentAccount: context.escrowPDA,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY
          })
          .signers([context.seller])
          .rpc();
        
        throw new Error("Expected transaction to fail");
        
      } catch (error: any) {
        const errorString = JSON.stringify(error);
        expect(
          errorString.includes("InvalidTicketCount") ||
          errorString.includes("6001")
        ).to.be.true;
        
        console.log("✅ Correctly rejected invalid ticket count");
        console.groupEnd();
      }
    });
    
    it("should reject past deadline", async () => {
      console.group("🧪 Testing: past deadline rejection");
      
      const pastDeadline = new BN(Math.floor(Date.now() / 1000) - 3600);
      const context = await createTestContext(new BN(1_000_000), pastDeadline);
      
      try {
        await program.methods
          .createRaffle(
            baseParams.name,
            baseParams.description,
            baseParams.imageUri,
            new BN(1),
            new BN(100_000),
            baseParams.minTickets,
            baseParams.maxTickets,
            pastDeadline // Invalid: deadline in past
          )
          .accounts({
            seller: context.seller.publicKey,
            counter: context.counterPDA,
            paymentMint: context.paymentMint,
            sellerTokenAccount: context.sellerTokenAccount,
            raffleAccount: context.rafflePDA,
            escrowPaymentAccount: context.escrowPDA,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY
          })
          .signers([context.seller])
          .rpc();
        
        throw new Error("Expected transaction to fail");
        
      } catch (error: any) {
        const errorString = JSON.stringify(error);
        expect(
          errorString.includes("InvalidDeadline") ||
          errorString.includes("6002")
        ).to.be.true;
        
        console.log("✅ Correctly rejected past deadline");
        console.groupEnd();
      }
    });
  });
  
  // =============================================
  // CLEANUP AND FINALIZATION
  // =============================================
  
  after(async () => {
    console.log("\n" + "=".repeat(50));
    console.log("🧹 Test suite completed");
    console.log("=".repeat(50));
    
    // Optional: Log final state
    const [counterPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from(COUNTER_SEED)],
      program.programId
    );
    
    try {
      const counter = await program.account.counter.fetch(counterPDA);
      console.log(`Final counter value: ${counter.counter.toString()}`);
    } catch {
      console.log("Counter account not initialized");
    }
  });
});