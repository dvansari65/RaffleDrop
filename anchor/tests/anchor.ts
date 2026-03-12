import * as anchor from "@coral-xyz/anchor";
import { Program, BN, web3 } from "@coral-xyz/anchor";
import { Raffle } from "../target/types/Raffle"
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccount,
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import { assert } from "chai";
import { Keypair, PublicKey, SYSVAR_RENT_PUBKEY, SYSVAR_CLOCK_PUBKEY } from "@solana/web3.js";


describe("raffle", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Raffle as Program<Raffle>;
  const payer = provider.wallet as anchor.Wallet;
  
  let paymentMint: PublicKey;
  let counterPda: PublicKey;
  let sellerTokenAccount: PublicKey;
  let rafflePda: web3.PublicKey;
  let escrowPaymentAccountPda: web3.PublicKey;
  let seller: PublicKey;
  let buyer: Keypair;
  let buyerTokenAccount: PublicKey;
  let raffleDeadline: BN; // on-chain-consistent deadline used across tests

  const connection = provider.connection;

  before(async () => {
    buyer = Keypair.generate();
    seller = payer.publicKey;

    [counterPda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("global-counter")],
      program.programId
    );

    // Create mint with payer as authority
    paymentMint = await createMint(
      connection,
      payer.payer,
      payer.publicKey,
      null,
      6
    );

    // Create buyer's token account and mint tokens
    buyerTokenAccount = await createAssociatedTokenAccount(
      connection,
      payer.payer,
      paymentMint,
      buyer.publicKey
    );

    await mintTo(
      connection,
      payer.payer,
      paymentMint,
      buyerTokenAccount,
      payer.payer,
      1000000000  // 1000 tokens
    );

    // Create seller's token account
    const sellerATA = await getOrCreateAssociatedTokenAccount(
      connection,
      payer.payer,
      paymentMint,
      seller
    );
    sellerTokenAccount = sellerATA.address;

    console.log("Setup complete:");
    console.log("  Payment Mint:", paymentMint.toString());
    console.log("  Buyer:", buyer.publicKey.toString());
    console.log("  Buyer Token:", buyerTokenAccount.toString());
    console.log("  Seller Token:", sellerTokenAccount.toString());
  });

  it("should initialise the counter:", async () => {
    try {
      const tx = await program.methods
        .initialiseCounter()
        .accounts({
          counter: counterPda,
          signer: payer.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      console.log("Counter initialized:", tx);
    } catch (e: any) {
      // If account already exists, that's fine – we just reuse it
      if (
        e.toString().includes("already in use") ||
        e.toString().includes("custom program error: 0x0")
      ) {
        console.log("Counter already initialized, skipping...");
      } else {
        throw e;
      }
    }

    const accountInfo = await program.account.counter.fetch(counterPda);
    const value = accountInfo.counter.toNumber();
    console.log("Counter value:", value);
    // Counter may be > 0 if tests were run before; just ensure it's a valid non‑negative number
    assert.isAtLeast(value, 0, "Counter should be non‑negative");
  });

  it("should create raffle:", async () => {
    const itemName = "skdcbeiv";
    const itemDescription = "skbcdkv";
    const itemImageUri = "shjbciev";
    const sellingPrice = new BN(500);
    const ticketPrice = new BN(10);

    // Use on-chain block time so it matches the program's Clock::get() value.
    const currentSlot = await connection.getSlot();
    const currentTs = await connection.getBlockTime(currentSlot);
    if (currentTs === null) {
      throw new Error("Unable to fetch current block time");
    }
    // Store raffle deadline so later tests can wait until it's passed.
    raffleDeadline = new BN(currentTs + 10);

    const accountInfo = await program.account.counter.fetch(counterPda);

    const counterBuffer = Buffer.alloc(8);
    counterBuffer.writeBigUInt64LE(BigInt(accountInfo.counter.toNumber()));

    [rafflePda] = web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("raffle"),
        seller.toBuffer(),
        counterBuffer
      ],
      program.programId
    );

    [escrowPaymentAccountPda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("escrow_payment"), seller.toBuffer(), counterBuffer],
      program.programId
    );

    const tx = await program.methods
      .createRaffle(
        itemName,
        itemDescription,
        itemImageUri,
        sellingPrice,
        ticketPrice,
        10,
        40,
        raffleDeadline
      )
      .accounts({
        seller: payer.publicKey,
        counter: counterPda,
        paymentMint: paymentMint,
        sellerTokenAccount: sellerTokenAccount,
        raffleAccount: rafflePda,
        escrowPaymentAccount: escrowPaymentAccountPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY
      })
      .rpc()
      
    console.log("payment mint :", paymentMint.toString())
    console.log("tx:", tx)
    
    const raffleAccountInfo = await program.account.raffleAccount.fetch(rafflePda);

    assert.equal(
      raffleAccountInfo.deadline.toNumber(),
      raffleDeadline.toNumber(),
      `deadline should be ${raffleDeadline.toNumber()}`
    );
    assert.equal(
      raffleAccountInfo.sellingPrice.toNumber(),
      sellingPrice.toNumber() * 1000000,
      `selling price should be 500 `
    );
    assert.equal(
      raffleAccountInfo.ticketPrice.toNumber(),
      Number(ticketPrice) * 1000000,
      "ticket price should be 10000000"
    );
    assert.equal(raffleAccountInfo.maxTickets, 40, "max tickets should be 40");
  });

  it("should buy ticket:", async () => {
    const numTickets = 5;
    
    // Airdrop SOL to buyer for transaction fees
    const airdropSignature = await connection.requestAirdrop(
      buyer.publicKey,
      2 * web3.LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropSignature);

    const totalCollected = 10 * 1000000 * 5
    
    const tx = await program.methods
      .buyTickets(numTickets)
      .accounts({
        buyer: buyer.publicKey,
        buyerTokenAccont: buyerTokenAccount,
        raffleAccount: rafflePda,
        escrowPaymentAccount: escrowPaymentAccountPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .signers([buyer])
      .rpc()
      
    const raffleAccount = await program.account.raffleAccount.fetch(rafflePda)
    console.log("total participants:", raffleAccount.participants.length)
    console.log("total entries:", raffleAccount.totalEntries.toNumber())
    
    assert.equal(raffleAccount.totalEntries.toNumber(), 5, "total entries should be 5")
    assert.equal(raffleAccount.participants.length, 1, "total participants should be 1")
    assert.equal(raffleAccount.totalCollected.toNumber(), totalCollected, "total collected should be 50000000")
    assert.equal(raffleAccount.progress, 12, "Progress should be 12%")
    console.log("progress:", raffleAccount.progress)
    console.log("buy ticket:", tx)
  });

  it("should draw winner:", async () => {
    // Add a second buyer so status can move to Drawing
    const secondBuyer = Keypair.generate();

    // Create second buyer's token account and mint tokens
    const secondBuyerTokenAccount = await createAssociatedTokenAccount(
      connection,
      payer.payer,
      paymentMint,
      secondBuyer.publicKey
    );

    await mintTo(
      connection,
      payer.payer,
      paymentMint,
      secondBuyerTokenAccount,
      payer.payer,
      1000000000 // 1000 tokens
    );

    // Airdrop SOL to second buyer for fees
    const airdropSig2 = await connection.requestAirdrop(
      secondBuyer.publicKey,
      2 * web3.LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropSig2);

    // Second buyer buys 1 ticket – this will push participants.len() >= 2
    await program.methods
      .buyTickets(1)
      .accounts({
        buyer: secondBuyer.publicKey,
        buyerTokenAccont: secondBuyerTokenAccount,
        raffleAccount: rafflePda,
        escrowPaymentAccount: escrowPaymentAccountPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([secondBuyer])
      .rpc();

    // Wait until on-chain time (Clock) has actually passed the stored deadline.
    // This avoids DeadlineNotReached even if local wall-clock and validator time differ.
    // Poll block time instead of a blind timeout.
    while (true) {
      const slot = await connection.getSlot();
      const ts = await connection.getBlockTime(slot);
      if (ts !== null && ts > raffleDeadline.toNumber()) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Get raffle account before drawing
    const raffleBefore = await program.account.raffleAccount.fetch(rafflePda);

    // Store participants for verification
    const participants = raffleBefore.participants;
    console.log(
      "Participants before draw:",
      participants.map((p) => p.toString())
    );

    // Call draw_winner
    const tx = await program.methods
      .drawWinner()
      .accounts({
        raffleAccount: rafflePda,
        signer: payer.publicKey,
        clock: SYSVAR_CLOCK_PUBKEY,
      })
      .rpc();

    console.log("Draw winner transaction:", tx);

    // Fetch raffle account after drawing
    const raffleAfter = await program.account.raffleAccount.fetch(rafflePda);

    // Verify status is Completed (enum variant)
    // @ts-ignore - Anchor enums are represented as tagged objects
    assert.property(raffleAfter.status, "completed", "Status should be Completed");

    // Verify claimed is true
    assert.equal(raffleAfter.claimed, true, "Claimed should be true");

    // Verify winner is set
    assert.isNotNull(raffleAfter.winner, "Winner should be set");

    // Verify winner is one of the participants
    const winnerKey = raffleAfter.winner.toString();
    const participantKeys = participants.map((p) => p.toString());
    assert.include(
      participantKeys,
      winnerKey,
      "Winner must be one of the participants"
    );

    console.log("Winner public key:", winnerKey);
    console.log("Winner is valid participant: ✅");
    console.log("Raffle status: Completed");
    console.log("Claimed: true");
  });

  // Optional: Mint to browser wallet for local development
  it("mint to browser wallet", async () => {
    const browserWallet = new PublicKey("HJtkUQEQY49UBELYJYm4wC1nHpghbziAfKaTEmEFApj6");
    
    const browserATA = await getOrCreateAssociatedTokenAccount(
      connection,
      payer.payer,
      paymentMint,
      browserWallet
    );
    
    await mintTo(
      connection,
      payer.payer,
      paymentMint,
      browserATA.address,
      payer.payer,
      10000000000  // 10,000 tokens
    );
    
    console.log("Minted to browser wallet:", browserATA.address.toString());
    
    const balance = await connection.getTokenAccountBalance(browserATA.address);
    console.log("Browser wallet balance:", balance.value.uiAmount);
  });
});