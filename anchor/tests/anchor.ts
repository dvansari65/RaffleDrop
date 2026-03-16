import * as anchor from '@coral-xyz/anchor'
import { Program, BN, web3 } from '@coral-xyz/anchor'
import { Raffle } from '../target/types/Raffle'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccount,
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from '@solana/spl-token'
import { assert } from 'chai'
import { Keypair, PublicKey, SYSVAR_RENT_PUBKEY, SYSVAR_CLOCK_PUBKEY } from '@solana/web3.js'

// Helper: fetch block time with retries (Surfpool may return null on early slots)
async function getBlockTimeWithRetry(connection: web3.Connection, retries = 10, delayMs = 1000): Promise<number> {
  for (let i = 0; i < retries; i++) {
    const slot = await connection.getSlot()
    const ts = await connection.getBlockTime(slot)
    if (ts !== null) return ts
    await new Promise((r) => setTimeout(r, delayMs))
  }
  // Final fallback to system time
  console.warn('⚠️  Could not fetch on-chain block time, falling back to system time')
  return Math.floor(Date.now() / 1000)
}

describe('raffle', () => {
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const program = anchor.workspace.Raffle as Program<Raffle>
  const payer = provider.wallet as anchor.Wallet

  let paymentMint: PublicKey
  let counterPda: PublicKey
  let sellerTokenAccount: PublicKey
  let rafflePda: web3.PublicKey
  let escrowPaymentAccountPda: web3.PublicKey
  let seller: PublicKey
  let buyer: Keypair
  let buyerTokenAccount: PublicKey
  let raffleDeadline: BN

  const connection = provider.connection

  before(async () => {
    buyer = Keypair.generate()
    seller = payer.publicKey
    ;[counterPda] = web3.PublicKey.findProgramAddressSync([Buffer.from('global-counter')], program.programId)

    // Create mint with payer as authority
    paymentMint = await createMint(connection, payer.payer, payer.publicKey, null, 6)

    // Create buyer's token account and mint tokens
    buyerTokenAccount = await createAssociatedTokenAccount(connection, payer.payer, paymentMint, buyer.publicKey)

    await mintTo(
      connection,
      payer.payer,
      paymentMint,
      buyerTokenAccount,
      payer.payer,
      1000000000, // 1000 tokens
    )
    const keeperWallet = new PublicKey('GcV7sjkFQQTKBEAfCG2pP9uPXBumkC6A21wEzGoYx66U')

    const keeperAirdrop = await connection.requestAirdrop(keeperWallet, 5 * web3.LAMPORTS_PER_SOL)
    await connection.confirmTransaction(keeperAirdrop)

    const keeperATA = await getOrCreateAssociatedTokenAccount(connection, payer.payer, paymentMint, keeperWallet)
    await mintTo(connection, payer.payer, paymentMint, keeperATA.address, payer.payer, 10000000000)

    // Create seller's token account
    const sellerATA = await getOrCreateAssociatedTokenAccount(connection, payer.payer, paymentMint, seller)
    sellerTokenAccount = sellerATA.address

    // Initialize counter here so we can derive PDAs reliably in before()
    try {
      await program.methods
        .initialiseCounter()
        .accounts({
          counter: counterPda,
          signer: payer.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc()
    } catch (e: any) {
      if (e.toString().includes('already in use') || e.toString().includes('custom program error: 0x0')) {
        // Already initialized, fine
      } else {
        throw e
      }
    }

    // Derive PDAs here using live counter value so they're available to ALL tests
    const accountInfo = await program.account.counter.fetch(counterPda)
    const counterBuffer = Buffer.alloc(8)
    counterBuffer.writeBigUInt64LE(BigInt(accountInfo.counter.toNumber()))
    ;[rafflePda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from('raffle'), seller.toBuffer(), counterBuffer],
      program.programId,
    )
    ;[escrowPaymentAccountPda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from('escrow_payment'), seller.toBuffer(), counterBuffer],
      program.programId,
    )

    console.log('Setup complete:')
    console.log('  Payment Mint:', paymentMint.toString())
    console.log('  Buyer:', buyer.publicKey.toString())
    console.log('  Buyer Token:', buyerTokenAccount.toString())
    console.log('  Seller Token:', sellerTokenAccount.toString())
    console.log('  Counter value:', accountInfo.counter.toNumber())
    console.log('  Raffle PDA:', rafflePda.toString())
    console.log('  Escrow PDA:', escrowPaymentAccountPda.toString())
  })

  it('should initialise the counter:', async () => {
    const accountInfo = await program.account.counter.fetch(counterPda)
    const value = accountInfo.counter.toNumber()
    console.log('Counter value:', value)
    assert.isAtLeast(value, 0, 'Counter should be non-negative')
  })

  it('should create raffle:', async () => {
    const itemName = 'skdcbeiv'
    const itemDescription = 'skbcdkv'
    const itemImageUri = 'shjbciev'
    const sellingPrice = new BN(500)
    const ticketPrice = new BN(10)

    // Use retry helper — Surfpool may return null block time on early slots
    const currentTs = await getBlockTimeWithRetry(connection)
    raffleDeadline = new BN(currentTs + 10)

    const tx = await program.methods
      .createRaffle(itemName, itemDescription, itemImageUri, sellingPrice, ticketPrice, 10, 40, raffleDeadline)
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
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc()

    console.log('Payment mint:', paymentMint.toString())
    console.log('tx:', tx)

    const raffleAccountInfo = await program.account.raffleAccount.fetch(rafflePda)

    assert.equal(
      raffleAccountInfo.deadline.toNumber(),
      raffleDeadline.toNumber(),
      `deadline should be ${raffleDeadline.toNumber()}`,
    )
    assert.equal(
      raffleAccountInfo.sellingPrice.toNumber(),
      sellingPrice.toNumber() * 1000000,
      `selling price should be 500`,
    )
    assert.equal(
      raffleAccountInfo.ticketPrice.toNumber(),
      Number(ticketPrice) * 1000000,
      'ticket price should be 10000000',
    )
    assert.equal(raffleAccountInfo.maxTickets, 40, 'max tickets should be 40')
  })

  it('should buy ticket:', async () => {
    const numTickets = 5

    const airdropSignature = await connection.requestAirdrop(buyer.publicKey, 2 * web3.LAMPORTS_PER_SOL)
    await connection.confirmTransaction(airdropSignature)

    const totalCollected = 10 * 1000000 * 5

    const tx = await program.methods
      .buyTickets(numTickets)
      .accounts({
        buyer: buyer.publicKey,
        buyerTokenAccont: buyerTokenAccount,
        raffleAccount: rafflePda,
        escrowPaymentAccount: escrowPaymentAccountPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([buyer])
      .rpc()

    const raffleAccount = await program.account.raffleAccount.fetch(rafflePda)
    console.log('total participants:', raffleAccount.participants.length)
    console.log('total entries:', raffleAccount.totalEntries.toNumber())

    assert.equal(raffleAccount.totalEntries.toNumber(), 5, 'total entries should be 5')
    assert.equal(raffleAccount.participants.length, 1, 'total participants should be 1')
    assert.equal(raffleAccount.totalCollected.toNumber(), totalCollected, 'total collected should be 50000000')
    assert.equal(raffleAccount.progress, 12, 'Progress should be 12%')
    console.log('progress:', raffleAccount.progress)
    console.log('buy ticket:', tx)
  })

  it('should draw winner:', async () => {
    const secondBuyer = Keypair.generate()

    const secondBuyerTokenAccount = await createAssociatedTokenAccount(
      connection,
      payer.payer,
      paymentMint,
      secondBuyer.publicKey,
    )

    await mintTo(connection, payer.payer, paymentMint, secondBuyerTokenAccount, payer.payer, 1000000000)

    const airdropSig2 = await connection.requestAirdrop(secondBuyer.publicKey, 2 * web3.LAMPORTS_PER_SOL)
    await connection.confirmTransaction(airdropSig2)

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
      .rpc()

    // Poll until on-chain clock passes the deadline
    console.log('Waiting for deadline to pass...')
    let waited = 0
    while (true) {
      const slot = await connection.getSlot()
      const ts = (await connection.getBlockTime(slot)) ?? Math.floor(Date.now() / 1000)
      console.log(
        `on-chain ts=${ts}, deadline=${raffleDeadline.toNumber()}, diff=${raffleDeadline.toNumber() - ts}s remaining`,
      )
      if (ts > raffleDeadline.toNumber()) {
        console.log(`Deadline passed at ts=${ts}`)
        break
      }
      await new Promise((resolve) => setTimeout(resolve, 2000))
      waited += 2
      if (waited > 180) throw new Error('Timed out waiting for raffle deadline to pass')
    }

    const raffleBefore = await program.account.raffleAccount.fetch(rafflePda)
    const participants = raffleBefore.participants
    console.log(
      'Participants before draw:',
      participants.map((p) => p.toString()),
    )

    const tx = await program.methods
      .drawWinner()
      .accounts({
        raffleAccount: rafflePda,
        signer: payer.publicKey,
        clock: SYSVAR_CLOCK_PUBKEY,
      })
      .rpc()

    console.log('Draw winner transaction:', tx)

    const raffleAfter = await program.account.raffleAccount.fetch(rafflePda)

    // @ts-ignore
    assert.property(raffleAfter.status, 'completed', 'Status should be Completed')
    assert.equal(raffleAfter.claimed, true, 'Claimed should be true')
    assert.isNotNull(raffleAfter.winner, 'Winner should be set')

    const winnerKey = raffleAfter.winner.toString()
    const participantKeys = participants.map((p) => p.toString())
    assert.include(participantKeys, winnerKey, 'Winner must be one of the participants')

    console.log('Winner public key:', winnerKey)
    console.log('Winner is valid participant: ✅')
    console.log('Raffle status: Completed')
    console.log('Claimed: true')
  })

  it('mint to browser wallet', async () => {
    const browserWallet = new PublicKey('HJtkUQEQY49UBELYJYm4wC1nHpghbziAfKaTEmEFApj6')

    const browserATA = await getOrCreateAssociatedTokenAccount(connection, payer.payer, paymentMint, browserWallet)

    await mintTo(connection, payer.payer, paymentMint, browserATA.address, payer.payer, 10000000000)

    console.log('Minted to browser wallet:', browserATA.address.toString())

    const balance = await connection.getTokenAccountBalance(browserATA.address)
    console.log('Browser wallet balance:', balance.value.uiAmount)
  })
})
