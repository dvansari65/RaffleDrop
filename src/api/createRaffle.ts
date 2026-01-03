import { getPaymentMint } from "@/helpers/getPaymentMint"
import { useCreateAssociatedToken } from "@/hooks/useCreateATA"
import { useRaffleProgram } from "@/hooks/useRaffleProgram"
import { CreateRaffleInputs } from "@/types/raffle"
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { useWallet } from "@solana/wallet-adapter-react"
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js"
import { useMutation } from "@tanstack/react-query"
import { BN } from "bn.js"


export const CreateRaffle = ()=>{
    const {createTokenAccount} = useCreateAssociatedToken()
    const {program} = useRaffleProgram()
    const {publicKey} = useWallet()
    const paymentMint = getPaymentMint()
  
    return useMutation<any,Error,CreateRaffleInputs>({
        mutationKey:["create-raffle"],
        mutationFn:async({
            itemDescription,
            itemImageUri,
            itemName,
            maxTickets,
            minTickets,
            sellingPrice,
            deadline,
            ticketPrice
        }:CreateRaffleInputs)=>{
            try {
                if(!publicKey){
                    throw new Error("Connect your wallet!")
                }
                if(!program?.programId){
                    throw new Error("Program not found!")
                }
                const sellerTokenAccount = await createTokenAccount()
                if(!sellerTokenAccount){
                    throw new Error("Seller token account not found!")
                }
                const [rafflePda] = PublicKey.findProgramAddressSync(
                    [
                      Buffer.from("raffle"),
                      publicKey.toBuffer(),
                      new BN(sellingPrice).toArrayLike(Buffer, "le", 8),
                      new BN(deadline).toArrayLike(Buffer, "le", 8)
                    ],
                    program?.programId
                  )
                if(!rafflePda){
                    throw new Error("Raffle pda not found!")
                }
                const [escrowPaymentAccount] = PublicKey.findProgramAddressSync(
                    [
                        Buffer.from("escrow_payment"),
                        rafflePda.toBuffer()
                    ],
                    program.programId
                )
                console.log("escrow payment account:",escrowPaymentAccount)
                const tx = await program.methods
                                .createRaffle(
                                    itemName,
                                    itemDescription,
                                    itemImageUri,
                                    new BN(sellingPrice),
                                    new BN(ticketPrice),
                                    minTickets,
                                    maxTickets,
                                    new BN(deadline)
                                )
                                .accounts({
                                    seller:publicKey,
                                    paymentMint,
                                    sellerTokenAccount:sellerTokenAccount,
                                    raffleAccount:rafflePda,
                                    escrowPaymentAccount,
                                    tokenProgram:TOKEN_PROGRAM_ID,
                                    associatedTokenProgram:ASSOCIATED_TOKEN_PROGRAM_ID,
                                    systemProgram:SystemProgram.programId,
                                    rend:SYSVAR_RENT_PUBKEY
                                })
                                .rpc()
                console.log("tx",tx)
                return tx
            } catch (error:any) {
                console.log("error:",error.message)
                throw error
            }

        },
        
    })
}