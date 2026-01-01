import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
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

// Helper to wait for confirmation
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to airdrop with retry
async function airdropWithRetry(
  connection: Connection,
  publicKey: PublicKey,
  lamports: number,
  maxRetries = 5
): Promise<string> {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const airdropSig = await connection.requestAirdrop(publicKey, lamports);
      await connection.confirmTransaction(airdropSig, "confirmed");
      await wait(500); // Small delay after airdrop
      return airdropSig;
    } catch (error) {
      lastError = error;
      console.log(`Airdrop attempt ${i + 1} failed, retrying...`);
      await wait(1000 * (i + 1)); // Exponential backoff
    }
  }
  throw lastError;
}

// Helper to get fresh blockhash
async function getFreshBlockhash(connection: Connection) {
  const { blockhash } = await connection.getLatestBlockhash("confirmed");
  return blockhash;
}

describe("Raffle Program", () => {
  // Configure the client
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Raffle as Program<Raffle>;
  
  // Test data
  const RAFFLE_SEED = "raffle";
  const ESCROW_SEED = "escrow_payment";
  const itemName = "Test Item";
  const itemDescription = "A test item for raffle";
  const itemImageUri = "https://example.com/image.png";

  // Helper function to setup test environment
  async function setupTest(sellingPrice: anchor.BN, deadline: anchor.BN) {
    const seller = Keypair.generate();
    console.log(`\nSetting up test for seller: ${seller.publicKey.toString()}`);
    
    try {
      // Airdrop SOL with retry
      console.log("Requesting airdrop...");
      await airdropWithRetry(
        provider.connection,
        seller.publicKey,
        2 * LAMPORTS_PER_SOL
      );
      
      // Verify balance
      const balance = await provider.connection.getBalance(seller.publicKey);
      console.log(`Seller balance: ${balance / LAMPORTS_PER_SOL} SOL`);
      expect(balance).to.be.greaterThan(0);

      // Get fresh blockhash
      await getFreshBlockhash(provider.connection);

      // Create payment mint
      console.log("Creating payment mint...");
      const paymentMint = await createMint(
        provider.connection,
        seller,
        seller.publicKey,
        null,
        6
      );
      console.log(`Mint created: ${paymentMint.toString()}`);

      // Create seller's token account
      console.log("Creating token account...");
      const sellerTokenAccount = await createAssociatedTokenAccount(
        provider.connection,
        seller,
        paymentMint,
        seller.publicKey
      );
      console.log(`Token account: ${sellerTokenAccount.toString()}`);

      // Mint test tokens
      console.log("Minting test tokens...");
      await mintTo(
        provider.connection,
        seller,
        paymentMint,
        sellerTokenAccount,
        seller,
        10_000_000 // 10 tokens (10 * 10^6)
      );

      // Verify token balance
      const tokenAccountInfo = await getAccount(provider.connection, sellerTokenAccount);
      console.log(`Token balance: ${tokenAccountInfo.amount.toString()}`);

      // Create PDA for raffle account
      const [rafflePDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(RAFFLE_SEED),
          seller.publicKey.toBuffer(),
          sellingPrice.toArrayLike(Buffer, "le", 8),
          deadline.toArrayLike(Buffer, "le", 8)
        ],
        program.programId
      );
      console.log(`Raffle PDA: ${rafflePDA.toString()}`);

      // Derive escrow payment account PDA
      const [escrowPaymentAccount] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(ESCROW_SEED),
          rafflePDA.toBuffer()
        ],
        program.programId
      );
      console.log(`Escrow PDA: ${escrowPaymentAccount.toString()}`);

      return {
        seller,
        paymentMint,
        sellerTokenAccount,
        rafflePDA,
        escrowPaymentAccount
      };
    } catch (error) {
      console.error("Setup failed:", error);
      throw error;
    }
  }

  it("CreateRaffle: successfully creates a raffle", async () => {
    console.log("\n" + "=".repeat(50));
    console.log("Testing successful raffle creation");
    console.log("=".repeat(50));
    
    const sellingPrice = new anchor.BN(1_000_000); // 1 USDC
    const ticketPrice = new anchor.BN(100_000);    // 0.1 USDC
    const minTickets = 10;
    const maxTickets = 100;
    const deadline = new anchor.BN(Math.floor(Date.now() / 1000) + 86400); // 24 hours
    
    const {
      seller,
      paymentMint,
      sellerTokenAccount,
      rafflePDA,
      escrowPaymentAccount
    } = await setupTest(sellingPrice, deadline);

    try {
      // Get fresh blockhash before sending transaction
      await getFreshBlockhash(provider.connection);
      
      console.log("\nSending createRaffle transaction...");
      const tx = await program.methods
        .createRaffle(
          itemName,
          itemDescription,
          itemImageUri,
          sellingPrice,
          ticketPrice,
          minTickets,
          maxTickets,
          deadline
        )
        .accounts({
          seller: seller.publicKey,
          paymentMint: paymentMint,
          sellerTokenAccount: sellerTokenAccount,
          raffleAccount: rafflePDA,
          escrowPaymentAccount: escrowPaymentAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([seller])
        .rpc({
          skipPreflight: false,
          preflightCommitment: "confirmed",
          commitment: "confirmed"
        });

      console.log(`✓ Transaction sent: ${tx}`);
      
      // Wait and confirm
      console.log("Waiting for confirmation...");
      const latestBlockhash = await provider.connection.getLatestBlockhash("confirmed");
      await provider.connection.confirmTransaction({
        signature: tx,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
      }, "confirmed");
      
      console.log("✓ Transaction confirmed");

      // Small delay for account propagation
      await wait(1000);

      // Fetch and verify the created raffle
      console.log("Fetching raffle account...");
      const raffleAccount = await program.account.raffleAccount.fetch(rafflePDA);

      // Assertions
      console.log("Running assertions...");
      expect(raffleAccount.seller.toString()).to.equal(seller.publicKey.toString());
      expect(raffleAccount.paymentMint.toString()).to.equal(paymentMint.toString());
      expect(raffleAccount.itemName).to.equal(itemName);
      expect(raffleAccount.itemDescription).to.equal(itemDescription);
      expect(raffleAccount.itemImageUri).to.equal(itemImageUri);
      expect(raffleAccount.sellingPrice.toNumber()).to.equal(sellingPrice.toNumber());
      expect(raffleAccount.ticketPrice.toNumber()).to.equal(ticketPrice.toNumber());
      expect(raffleAccount.minTickets).to.equal(minTickets);
      expect(raffleAccount.maxTickets).to.equal(maxTickets);
      expect(raffleAccount.deadline.toNumber()).to.equal(deadline.toNumber());
      expect(raffleAccount.totalCollected.toNumber()).to.equal(0);
      expect(raffleAccount.participants.length).to.equal(0);
      expect(raffleAccount.claimed).to.be.false;
      expect(raffleAccount.winner).to.be.null;

      console.log("✓ All assertions passed");
      console.log("✓ Raffle created successfully!");
      
    } catch (error: any) {
      console.error("\n❌ Test failed with error:");
      
      if (error.logs) {
        console.error("Transaction logs:");
        error.logs.forEach((log: string) => console.error(`  ${log}`));
      }
      
      if (error.message) {
        console.error(`Error message: ${error.message}`);
      }
      
      if (error.stack) {
        console.error("Stack trace:", error.stack);
      }
      
      // Check for specific Anchor errors
      if (error.error && error.error.errorCode) {
        console.error(`Anchor error: ${JSON.stringify(error.error.errorCode)}`);
      }
      
      throw error;
    }
  });

  it("CreateRaffle: fails with zero selling price", async () => {
    console.log("\n" + "=".repeat(50));
    console.log("Testing zero selling price validation");
    console.log("=".repeat(50));
    
    const zeroSellingPrice = new anchor.BN(0);
    const ticketPrice = new anchor.BN(100_000);
    const minTickets = 10;
    const maxTickets = 100;
    const deadline = new anchor.BN(Math.floor(Date.now() / 1000) + 86400 + 100);
    
    const {
      seller,
      paymentMint,
      sellerTokenAccount,
      rafflePDA,
      escrowPaymentAccount
    } = await setupTest(zeroSellingPrice, deadline);

    try {
      await getFreshBlockhash(provider.connection);
      
      await program.methods
        .createRaffle(
          itemName,
          itemDescription,
          itemImageUri,
          zeroSellingPrice,
          ticketPrice,
          minTickets,
          maxTickets,
          deadline
        )
        .accounts({
          seller: seller.publicKey,
          paymentMint: paymentMint,
          sellerTokenAccount: sellerTokenAccount,
          raffleAccount: rafflePDA,
          escrowPaymentAccount: escrowPaymentAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([seller])
        .rpc({
          skipPreflight: false,
          preflightCommitment: "confirmed",
          commitment: "confirmed"
        });

      throw new Error("Should have failed with zero selling price");
    } catch (error: any) {
      // Check for validation error
      const errorString = JSON.stringify(error);
      if (
        (error.error && error.error.errorCode && error.error.errorCode.code === "InvalidPrice") ||
        errorString.includes("InvalidPrice") ||
        errorString.includes("6000") ||
        (error.logs && error.logs.some((log: string) => log.includes("InvalidPrice")))
      ) {
        console.log("✓ Correctly rejected zero selling price");
        return;
      }
      
      // Check for constraint violation
      if (errorString.includes("constraint") || errorString.includes("require!")) {
        console.log("✓ Correctly rejected zero selling price (constraint failed)");
        return;
      }
      
      console.error("Unexpected error:", error);
      throw new Error(`Expected InvalidPrice error but got: ${error.message || errorString}`);
    }
  });

  it("CreateRaffle: fails with zero ticket price", async () => {
    console.log("\n" + "=".repeat(50));
    console.log("Testing zero ticket price validation");
    console.log("=".repeat(50));
    
    const sellingPrice = new anchor.BN(2_000_000);
    const zeroTicketPrice = new anchor.BN(0);
    const minTickets = 10;
    const maxTickets = 100;
    const deadline = new anchor.BN(Math.floor(Date.now() / 1000) + 86400 + 200);
    
    const {
      seller,
      paymentMint,
      sellerTokenAccount,
      rafflePDA,
      escrowPaymentAccount
    } = await setupTest(sellingPrice, deadline);

    try {
      await getFreshBlockhash(provider.connection);
      
      await program.methods
        .createRaffle(
          itemName,
          itemDescription,
          itemImageUri,
          sellingPrice,
          zeroTicketPrice,
          minTickets,
          maxTickets,
          deadline
        )
        .accounts({
          seller: seller.publicKey,
          paymentMint: paymentMint,
          sellerTokenAccount: sellerTokenAccount,
          raffleAccount: rafflePDA,
          escrowPaymentAccount: escrowPaymentAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([seller])
        .rpc({
          skipPreflight: false,
          preflightCommitment: "confirmed",
          commitment: "confirmed"
        });

      throw new Error("Should have failed with zero ticket price");
    } catch (error: any) {
      const errorString = JSON.stringify(error);
      if (
        (error.error && error.error.errorCode && error.error.errorCode.code === "InvalidPrice") ||
        errorString.includes("InvalidPrice") ||
        errorString.includes("6000") ||
        (error.logs && error.logs.some((log: string) => log.includes("InvalidPrice")))
      ) {
        console.log("✓ Correctly rejected zero ticket price");
        return;
      }
      
      if (errorString.includes("constraint") || errorString.includes("require!")) {
        console.log("✓ Correctly rejected zero ticket price (constraint failed)");
        return;
      }
      
      console.error("Unexpected error:", error);
      throw new Error(`Expected InvalidPrice error but got: ${error.message || errorString}`);
    }
  });

  it("CreateRaffle: fails with max tickets less than min tickets", async () => {
    console.log("\n" + "=".repeat(50));
    console.log("Testing invalid ticket count validation");
    console.log("=".repeat(50));
    
    const sellingPrice = new anchor.BN(3_000_000);
    const ticketPrice = new anchor.BN(100_000);
    const minTickets = 10;
    const invalidMaxTickets = minTickets - 1;
    const deadline = new anchor.BN(Math.floor(Date.now() / 1000) + 86400 + 300);
    
    const {
      seller,
      paymentMint,
      sellerTokenAccount,
      rafflePDA,
      escrowPaymentAccount
    } = await setupTest(sellingPrice, deadline);

    try {
      await getFreshBlockhash(provider.connection);
      
      await program.methods
        .createRaffle(
          itemName,
          itemDescription,
          itemImageUri,
          sellingPrice,
          ticketPrice,
          minTickets,
          invalidMaxTickets,
          deadline
        )
        .accounts({
          seller: seller.publicKey,
          paymentMint: paymentMint,
          sellerTokenAccount: sellerTokenAccount,
          raffleAccount: rafflePDA,
          escrowPaymentAccount: escrowPaymentAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([seller])
        .rpc({
          skipPreflight: false,
          preflightCommitment: "confirmed",
          commitment: "confirmed"
        });

      throw new Error("Should have failed with invalid ticket count");
    } catch (error: any) {
      const errorString = JSON.stringify(error);
      if (
        (error.error && error.error.errorCode && error.error.errorCode.code === "InvalidTicketCount") ||
        errorString.includes("InvalidTicketCount") ||
        errorString.includes("6001") ||
        (error.logs && error.logs.some((log: string) => log.includes("InvalidTicketCount")))
      ) {
        console.log("✓ Correctly rejected invalid ticket count");
        return;
      }
      
      if (errorString.includes("constraint") || errorString.includes("require!")) {
        console.log("✓ Correctly rejected invalid ticket count (constraint failed)");
        return;
      }
      
      console.error("Unexpected error:", error);
      throw new Error(`Expected InvalidTicketCount error but got: ${error.message || errorString}`);
    }
  });

  it("CreateRaffle: fails with past deadline", async () => {
    console.log("\n" + "=".repeat(50));
    console.log("Testing past deadline validation");
    console.log("=".repeat(50));
    
    const sellingPrice = new anchor.BN(4_000_000);
    const ticketPrice = new anchor.BN(100_000);
    const minTickets = 10;
    const maxTickets = 100;
    const pastDeadline = new anchor.BN(Math.floor(Date.now() / 1000) - 3600);
    
    const {
      seller,
      paymentMint,
      sellerTokenAccount,
      rafflePDA,
      escrowPaymentAccount
    } = await setupTest(sellingPrice, pastDeadline);

    try {
      await getFreshBlockhash(provider.connection);
      
      await program.methods
        .createRaffle(
          itemName,
          itemDescription,
          itemImageUri,
          sellingPrice,
          ticketPrice,
          minTickets,
          maxTickets,
          pastDeadline
        )
        .accounts({
          seller: seller.publicKey,
          paymentMint: paymentMint,
          sellerTokenAccount: sellerTokenAccount,
          raffleAccount: rafflePDA,
          escrowPaymentAccount: escrowPaymentAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([seller])
        .rpc({
          skipPreflight: false,
          preflightCommitment: "confirmed",
          commitment: "confirmed"
        });

      throw new Error("Should have failed with past deadline");
    } catch (error: any) {
      const errorString = JSON.stringify(error);
      if (
        (error.error && error.error.errorCode && error.error.errorCode.code === "InvalidDeadline") ||
        errorString.includes("InvalidDeadline") ||
        errorString.includes("6002") ||
        (error.logs && error.logs.some((log: string) => log.includes("InvalidDeadline")))
      ) {
        console.log("✓ Correctly rejected past deadline");
        return;
      }
      
      if (errorString.includes("constraint") || errorString.includes("require!")) {
        console.log("✓ Correctly rejected past deadline (constraint failed)");
        return;
      }
      
      console.error("Unexpected error:", error);
      throw new Error(`Expected InvalidDeadline error but got: ${error.message || errorString}`);
    }
  });
});