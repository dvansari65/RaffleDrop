import { useCreateAssociatedToken } from "@/hooks/useCreateATA"
import { useGetCounterPda } from "@/hooks/useGetCounterPda"
import { useRaffleProgram } from "@/hooks/useRaffleProgram"
import { getRafflePda } from "@/services/blockchain"
import { buyTicketProps } from "@/types/raffle"
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { useWallet } from "@solana/wallet-adapter-react"
import { PublicKey, SystemProgram } from "@solana/web3.js"
import { useMutation } from "@tanstack/react-query"
import { BN } from "bn.js"



export const buyTicket = () => {
    const { program } = useRaffleProgram()
    const { publicKey } = useWallet()
    const {getCounterPda} = useGetCounterPda()
    const { createTokenAccount } = useCreateAssociatedToken()
    return useMutation<any, Error, buyTicketProps>({
        mutationKey: ["buy-ticket"],
        mutationFn: async ({ numTickets, rafflePubKey }: buyTicketProps) => {
            try {
                const tokenATA = await createTokenAccount()
                if (!tokenATA) {
                    throw new Error("Buyer token account not found!")
                }
                if (!publicKey) {
                    throw new Error("Connect your wallet!")
                }
                if (!program?.programId) {
                    throw new Error("Program id not found!")
                }
        
                const counterPda = getCounterPda()
                const rafflePda = getRafflePda({counterPda,programId:program.programId})

                if(!counterPda){
                    throw new Error("Counter pda not found!")
                }
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
                console.log("raffle pda:", rafflePda)
                if (!rafflePda) {
                    throw new Error("Raffle Pda not found!")
                }
                if (!rafflePda.equals(rafflePubKey)) {
                    console.error("PDA mismatch!")
                    console.log("Derived:", rafflePda.toBase58())
                    console.log("Expected:", rafflePubKey.toBase58())
                    throw new Error("Raffle PDA derivation mismatch!")
                }
                const tx = await program?.methods
                    .buyTickets(numTickets)
                    .accounts({
                        buyer: publicKey,
                        buyerTokenAccont: tokenATA,
                        raffleAccount: rafflePda,
                        escrowPaymentAccount,
                        tokenProgram: TOKEN_PROGRAM_ID,
                        systemProgram: SystemProgram.programId,
                    })
                    .rpc()
                console.log("tx:", tx)
                return tx;
            } catch (error) {
                console.log("error:", error)
                throw error
            }
        }
    })
}