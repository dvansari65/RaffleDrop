

import { useRaffleProgram } from "./useRaffleProgram"
import {PublicKey} from "@solana/web3.js"
export const useGetCounterPda = ()=>{
  const {program} = useRaffleProgram()
  const getCounterPda = ()=>{
    const [pda] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("gobal-counter")
        ],
        program.programId
    )
    return pda;
  }
  return {getCounterPda}
}
