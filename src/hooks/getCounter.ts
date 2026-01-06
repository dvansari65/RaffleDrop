
import { getCounterPubkey } from "@/helpers/getCounterPubkey"
import { useRaffleProgram } from "./useRaffleProgram"
import {PublicKey} from "@solana/web3.js"

export const useGetCounter = ()=>{
    const {program} = useRaffleProgram()
    const counterKey = getCounterPubkey()
    const getCounterValue = async ()=>{
        try {
            if(!counterKey){
                throw new Error("Counter key not found!")
            }
            const counterInfo = await program.account.counter.fetch(counterKey,"confirmed")
            return counterInfo.counter
        } catch (error) {
            throw error;
        }
    }
    return {
        getCounterValue
    }
}