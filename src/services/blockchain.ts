import { PublicKey } from '@solana/web3.js'

interface GetRafflePdaProps {
 counterPda:PublicKey,
  programId: PublicKey
}


export const getRafflePda = ({
  counterPda,
  programId
}: GetRafflePdaProps) => {
  
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("raffle"),
      counterPda.toBuffer()
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