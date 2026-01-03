import { PublicKey } from '@solana/web3.js'
import { BN, Program } from "@coral-xyz/anchor"

interface GetRafflePdaProps {
  sellerKey: PublicKey,
  sellingPrice: number,
  deadline: number,
  programId: PublicKey
}

export const getRafflePda = ({
  sellerKey,
  sellingPrice,
  deadline,
  programId
}: GetRafflePdaProps) => {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("raffle"),
      sellerKey.toBuffer(),
      new BN(sellingPrice).toArrayLike(Buffer, "le", 8),
      new BN(deadline).toArrayLike(Buffer, "le", 8)
    ],
    programId
  )
  
  return pda;
}

export const getEscrowPda = (raffleKey: PublicKey, programId: PublicKey) => {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("escrow_payment"),
      raffleKey.toBuffer()
    ],
    programId
  )
  
  return pda;
}