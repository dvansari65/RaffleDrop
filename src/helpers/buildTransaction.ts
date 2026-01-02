// helpers/buildTransaction.ts
import { CreateRaffleInputs } from "@/types/raffle"
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js"
import { BN } from "@coral-xyz/anchor"

interface BuildTransactionParams {
  seller: PublicKey
  paymentMint: PublicKey
  sellerTokenAccount: PublicKey
  rafflePda: PublicKey
  escrowPda: PublicKey
  sellingPriceLamports: number
  ticketPriceLamports: number
}

const PROGRAM_ID = new PublicKey("5CmMWJpHYhPjmhCXaaLU2WskBBB5HJ4yzDv6JzXEiDnz")

export async function buildAndSendTransaction(
  program: any,
  inputs: CreateRaffleInputs,
  accounts: BuildTransactionParams,
  connection: any,
  sendTransaction: any
): Promise<string> {
  try {
    console.log("📦 Building transaction with accounts:", {
      seller: accounts.seller.toString(),
      paymentMint: accounts.paymentMint.toString(),
      sellerTokenAccount: accounts.sellerTokenAccount.toString(),
      rafflePda: accounts.rafflePda.toString(),
      escrowPda: accounts.escrowPda.toString(),
      sellingPriceLamports: accounts.sellingPriceLamports,
      ticketPriceLamports: accounts.ticketPriceLamports,
      systemProgram: SystemProgram.programId.toString(), // Log correct system program
      tokenProgram: TOKEN_PROGRAM_ID.toString(),
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID.toString(),
      rent: SYSVAR_RENT_PUBKEY.toString()
    })
    if (
        Number.isNaN(Number(inputs.minTickets)) ||
        Number.isNaN(Number(inputs.maxTickets))
      ) {
        throw new Error("minTickets / maxTickets must be valid numbers")
      }
    console.log("Program ID (Raffle):", program.programId.toString())
    console.log("System Program ID:", SystemProgram.programId.toString())

    // Build the transaction with CORRECT account references
    console.log("min ticks:",  Number(inputs.minTickets))
    const tx = await program.methods
      .createRaffle(
        inputs.itemName,
        inputs.itemDescription,
        inputs.itemImageUri,
        new BN(accounts.sellingPriceLamports),
        new BN(accounts.ticketPriceLamports),
        Number(inputs.minTickets),
       Number( inputs.maxTickets),
        new BN(inputs.deadline)
      )
      .accounts({
        seller: accounts.seller,
        paymentMint: accounts.paymentMint,
        sellerTokenAccount: accounts.sellerTokenAccount,
        raffleAccount: accounts.rafflePda,
        escrowPaymentAccount: accounts.escrowPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId, // ✅ FIXED: Correct system program
        rent: SYSVAR_RENT_PUBKEY
      })
      .transaction()

    console.log("✅ Transaction built successfully")

    // Get latest blockhash with proper commitment
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed")
    tx.feePayer = accounts.seller
    tx.recentBlockhash = blockhash

    // Simulate transaction before sending
    console.log("🔍 Simulating transaction...")
    const simulationResult = await connection.simulateTransaction(tx, {
      commitment: "confirmed",
      sigVerify: false // Skip signature verification in simulation
    })
    
    console.log("📊 Simulation result:", {
      err: simulationResult.value.err,
      logs: simulationResult.value.logs,
      unitsConsumed: simulationResult.value.unitsConsumed
    })

    if (simulationResult.value.err) {
      console.error("❌ Simulation failed with error:", simulationResult.value.err)
      console.error("📋 Program logs:", simulationResult.value.logs)
      throw new Error(`Transaction simulation failed: ${JSON.stringify(simulationResult.value.err)}`)
    }

    console.log("✅ Simulation passed!")
    console.log("🚀 Sending transaction...")
    
    // Send transaction
    const signature = await sendTransaction(tx, connection, {
      skipPreflight: false, // Keep preflight checks
      preflightCommitment: "confirmed",
      maxRetries: 3
    })

    console.log("📝 Transaction signature:", signature)
    console.log("🔄 Confirming transaction...")

    // Confirm transaction
    const confirmation = await connection.confirmTransaction(
      { 
        signature, 
        blockhash, 
        lastValidBlockHeight 
      },
      "confirmed"
    )

    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`)
    }

    console.log("✅ Transaction confirmed successfully!")
    return signature

  } catch (error: any) {
    console.error("❌ Transaction failed:", {
      name: error.name,
      message: error.message,
      logs: error.logs || [],
      stack: error.stack
    })

    // Extract detailed error information
    let errorMessage = error.message

    // Add program logs if available
    if (error.logs && error.logs.length > 0) {
      errorMessage += `\n\n📋 Program Logs:\n${error.logs.join('\n')}`
    }

    // Check for common Solana errors
    if (errorMessage.includes('InstructionError')) {
      errorMessage += '\n\n💡 This is a program instruction error. Check:'
      errorMessage += '\n  - Are all accounts correctly passed?'
      errorMessage += '\n  - Do you have enough SOL for rent?'
      errorMessage += '\n  - Are PDAs derived correctly?'
      errorMessage += '\n  - Does the wallet have required permissions?'
    }

    throw new Error(`Transaction failed: ${errorMessage}`)
  }
}