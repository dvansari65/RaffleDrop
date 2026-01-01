import { useQuery } from "@tanstack/react-query"
import { PublicKey } from '@solana/web3.js'
import { useWallet } from "@solana/wallet-adapter-react"
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system"
import { useRaffleProgram } from "@/hooks/useRaffleProgram"

//  seeds = [
//     b"raffle",
//     seller.key().as_ref(),
//     &selling_price.to_le_bytes(),
//     &deadline.to_le_bytes()
// ],
interface GetRafflePdaProps  {
    sellerKey:PublicKey,
    sellingPrice:number,
    deadline:number
}
export const getRafflePda = ({
    sellerKey,
    sellingPrice,
    deadline
}:GetRafflePdaProps)=>{
    const {publicKey} = useWallet()
    const {program} = useRaffleProgram()
    return useQuery({
        queryKey:["RafflePda",sellerKey],
        queryFn:()=>{
            try {
                if(!publicKey){
                    throw new Error("Connect your wallet first!")
                }
                const sellingPriceBuffer = Buffer.alloc(8)
                sellingPriceBuffer.writeBigUint64LE(BigInt(sellingPrice))

                const deadlineBuffer = Buffer.alloc(8)
                deadlineBuffer.writeBigInt64LE(BigInt(deadline))
                const pda = PublicKey.findProgramAddressSync(
                    [
                        Buffer.from("raffle"),
                        publicKey?.toBuffer(),
                       sellingPriceBuffer,
                       deadlineBuffer
                    ],
                    program.programId
                )
                return pda;
            } catch (error) {
                throw error;
            }
        }
    })
}