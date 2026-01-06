import {PublicKey} from "@solana/web3.js"

export const getCounterPubkey = ()=>{
    const counterKey = process.env.NEXT_PUBLIC_COUNTER_KEY
    if(!counterKey){
        throw new Error("Counter key not found!")
    }
    return new PublicKey(counterKey)
}