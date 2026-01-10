import { PublicKey } from '@solana/web3.js'
import { BN } from 'bn.js';

interface GetRafflePdaProps {
  counterValue:number,
  programId: PublicKey
}


export const getRafflePda = ({
  counterValue,
  programId
}: GetRafflePdaProps) => {
  
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("raffle"),
      new BN(counterValue).toBuffer()
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
