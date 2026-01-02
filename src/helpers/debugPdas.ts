
import { PublicKey } from "@solana/web3.js"
import { BN } from "@coral-xyz/anchor"

export async function debugPDAs(
  programId: PublicKey,
  seller: PublicKey,
  sellingPriceLamports: number,
  deadline: number
) {
  console.log("🔍 Debugging PDA calculation...")
  
  // 1. Raffle PDA seeds
  const raffleSeeds = [
    Buffer.from("raffle"),
    seller.toBuffer(),
    new BN(sellingPriceLamports).toArrayLike(Buffer, "le", 8),
    new BN(deadline).toArrayLike(Buffer, "le", 8)
  ]
  
  console.log("Raffle seeds:", {
    seed1: "raffle",
    seed2: seller.toString(),
    seed3: sellingPriceLamports,
    seed4: deadline
  })
  
  const [rafflePda, raffleBump] = PublicKey.findProgramAddressSync(
    raffleSeeds,
    programId
  )
  
  console.log("Calculated Raffle PDA:", rafflePda.toString())
  console.log("Raffle bump:", raffleBump)
  
  // 2. Escrow PDA seeds
  const escrowSeeds = [
    Buffer.from("escrow_payment"),
    rafflePda.toBuffer()
  ]
  
  console.log("Escrow seeds:", {
    seed1: "escrow_payment",
    seed2: rafflePda.toString()
  })
  
  const [escrowPda, escrowBump] = PublicKey.findProgramAddressSync(
    escrowSeeds,
    programId
  )
  
  console.log("Calculated Escrow PDA:", escrowPda.toString())
  console.log("Escrow bump:", escrowBump)
  
  return { rafflePda, raffleBump, escrowPda, escrowBump }
}