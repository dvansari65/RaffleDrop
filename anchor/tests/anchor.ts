import * as anchor from "@coral-xyz/anchor";
import { Program, BN, web3 } from "@coral-xyz/anchor";
import { Raffle } from "../target/types/Raffle"
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccount,
  createMint,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import { assert } from "chai";
import { Keypair, PublicKey, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";

describe("raffle", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Raffle as Program<Raffle>;
  let payer: anchor.web3.Keypair;
  let paymentMint: anchor.web3.PublicKey
  let counterPda: PublicKey;
  let sellerTokenAccount: PublicKey;
  let rafflePda: web3.PublicKey;
  let escrowPaymentAccountPda: web3.PublicKey;
  let seller: PublicKey;

  const connection = provider.connection

  seller = anchor.getProvider().wallet.publicKey as PublicKey;
  before(async () => {
    payer = Keypair.generate();
    const airdropSignature = await connection.requestAirdrop(
      payer.publicKey,
      2 * web3.LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropSignature);

    [counterPda] = web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("global-counter")
      ],
      program.programId
    )
    paymentMint = await createMint(
      connection,
      payer,
      payer.publicKey,
      null,
      6
    )
    const sellerTokenAccountObj = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      paymentMint,
      seller
    )
    sellerTokenAccount = (sellerTokenAccountObj).address
  })

  it("should initialise the counter:", async () => {
    const tx = await program.methods
      .initialiseCounter()
      .accounts({
        counter: counterPda,
        signer: anchor.getProvider().wallet?.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc()
    const accountInfo = await program.account.counter.fetch(counterPda)
    assert.equal(accountInfo.counter.toNumber(), 0, "Counter should be 0")
  })
  it("should create raffle:", async () => {

    const itemName = "skdcbeiv"
    const itemDescription = "skbcdkv"
    const itemImageUri = "shjbciev"
    const sellingPrice = new BN(500)
    const ticketPrice = new BN(10)

    const now = new Date()
    const tommorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const unixTimeStamp = Math.floor(tommorrow.getTime() / 1000)
    const deadline = new BN(unixTimeStamp)

    const accountInfo = await program.account.counter.fetch(counterPda)

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
        deadline
      )
      .accounts({
        seller: anchor.getProvider().wallet?.publicKey,
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
    console.log("tx:", tx)
    const raffleAccountInfo = await program.account.raffleAccount.fetch(rafflePda)

    assert.equal(raffleAccountInfo.deadline.toNumber(), deadline.toNumber(), `deadline should be ${deadline.toNumber()}`)
    assert.equal(raffleAccountInfo.sellingPrice.toNumber(), sellingPrice.toNumber() * 1000000, `selling price should be 500 `)
    assert.equal(raffleAccountInfo.ticketPrice.toNumber(), Number(ticketPrice) * 1000000, "ticket price should be 10000000")
    assert.equal(raffleAccountInfo.maxTickets, 40, "max tickets should be 40")
  })
  it("should buy ticket:", async () => {
    const numTickets = 5;
    const buyer = Keypair.generate()
    assert(buyer, "Buyer keypair should be defined");
    const airdropSignature = await connection.requestAirdrop(
      buyer?.publicKey,
      2 * web3.LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropSignature);

   const tokenAccountObj = await getOrCreateAssociatedTokenAccount(connection,buyer,paymentMint,buyer.publicKey)
    await mintTo(
      connection,
      payer,
      paymentMint,
      tokenAccountObj?.address,
      payer,
      100 * 1000000
    )
    const totalCollected = 10*1000000*5
    const tx = await program.methods
      .buyTickets(
        numTickets
      )
      .accounts({
        buyer: buyer?.publicKey,
        buyerTokenAccont: tokenAccountObj?.address,
        raffleAccount: rafflePda,
        escrowPaymentAccount: escrowPaymentAccountPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .signers([buyer])
      .rpc()
      const raffleAccount = await program.account.raffleAccount.fetch(rafflePda)
      console.log("total participants:",(raffleAccount.participants.length))
      console.log("total entries:",raffleAccount.totalEntries.toNumber())
      assert.equal(raffleAccount.totalEntries.toNumber(),5,"total entries should be 5")
      assert.equal(raffleAccount.participants.length,1,"total participants should be 1")
      assert.equal(raffleAccount.totalCollected.toNumber(),totalCollected,"total collected should be 50000000")
      assert.equal(raffleAccount.progress,12,"Progress should be 12%")
      console.log("progress:",raffleAccount.progress)
    console.log("buy ticket:", tx)
  })
})