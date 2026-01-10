
import { useRaffleProgram } from "./useRaffleProgram"
import {PublicKey} from "@solana/web3.js"

export const useGetCounter = ()=>{
    const {program} = useRaffleProgram()
    
    const getCounterValue = async ()=>{
        try {
            const [counterPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("global-counter")], 
                program.programId
            )
            const counterInfo = await program.account.counter.fetch(counterPda,"confirmed")
            return counterInfo.counter
        } catch (error) {
            console.error("counter value error:",error)
            throw error;
        }
    }
    return {
        getCounterValue
    }
}