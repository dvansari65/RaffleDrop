import { useCreateAssociatedToken } from "@/hooks/useCreateATA"
import { useRaffleProgram } from "@/hooks/useRaffleProgram"
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { useWallet } from "@solana/wallet-adapter-react"
import { PublicKey, SystemProgram } from "@solana/web3.js"
import { useMutation } from "@tanstack/react-query"
import { BN } from "bn.js"


interface buyTicketProps {
    numTickets:number,
    sellingPrice:number,
    deadline:number
}
export const buyTicket = ()=>{
    const {program} = useRaffleProgram()
    const {publicKey} = useWallet()
    const {createTokenAccount} = useCreateAssociatedToken()
    return useMutation<any,Error,buyTicketProps>({
        mutationKey:["buy-ticket"],
        mutationFn:async({numTickets,sellingPrice,deadline}:buyTicketProps)=>{
            try {
                const tokenATA = await createTokenAccount()
                if(!tokenATA){
                    throw new Error("Buyer token account not found!")
                }
                if(!publicKey){
                    throw new Error("Connect your wallet!")
                }
                if(!program?.programId){
                    throw new Error("Program id not found!")
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
                const [escrowPaymentAccount] = PublicKey.findProgramAddressSync(
                    [
                        Buffer.from("escrow_payment"),
                        rafflePda.toBuffer()
                    ],
                    program.programId
                )
                const tx = await program?.methods
                                .buyTickets(numTickets)
                                .accounts({
                                    buyer:publicKey,
                                    buyerTokenAccont:tokenATA,
                                    raffleAccount:rafflePda,
                                    escrowPaymentAccount,
                                    tokenProgram:TOKEN_PROGRAM_ID,
                                    systemProgram:SystemProgram.programId,
                                })
                                .rpc()
                console.log("tx:",tx)
                return tx;
            } catch (error) {
                console.log("error:",error)
                throw error
            }
        }
    })
}