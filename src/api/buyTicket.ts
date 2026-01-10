
import { useCreateAssociatedToken } from "@/hooks/useCreateATA"
import { useGetCounterPda } from "@/hooks/useGetCounterPda"
import { useRaffleProgram } from "@/hooks/useRaffleProgram"
import { buyTicketProps } from "@/types/raffleType"
import { AnchorError } from "@coral-xyz/anchor"
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { PublicKey, SystemProgram } from "@solana/web3.js"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

export const buyTicket = () => {
    const { program } = useRaffleProgram()
    const { publicKey, signTransaction } = useWallet()
    const { connection } = useConnection()
    const { createTokenAccount } = useCreateAssociatedToken()
    return useMutation<any, Error, buyTicketProps>({
        mutationKey: ["buy-ticket"],
        mutationFn: async ({ numTickets, sellerKey,raffleKey }: buyTicketProps) => {
            try {
                let tokenATA: PublicKey;
              
                const [counterKey] = PublicKey.findProgramAddressSync(
                    [
                        Buffer.from("gobal-counter")
                    ],
                    program.programId
                )
                console.log("counter key:",counterKey)
                try {
                    tokenATA = await createTokenAccount()
                } catch (error) {
                    throw error;
                }

                if (!publicKey) {
                    throw new Error("Connect your wallet!")
                }

                if (!program?.programId) {
                    throw new Error("Program id not found!")
                }

                if (!counterKey) {
                    throw new Error("Counter pda not found!")
                }
                if (!sellerKey) {
                    throw new Error("Seller key not found!")
                }

                const [escrowPaymentAccount] = PublicKey.findProgramAddressSync(
                    [
                        Buffer.from("escrow_payment"),
                        sellerKey.toBuffer(),
                        counterKey.toBuffer()
                    ],
                    program.programId
                )

                const tx = await program.methods
                    .buyTickets(numTickets)
                    .accounts({
                        buyer: publicKey,
                        buyerTokenAccont: tokenATA,
                        raffleAccount: raffleKey,
                        counter: counterKey,
                        escrowPaymentAccount,
                        tokenProgram: TOKEN_PROGRAM_ID,
                        systemProgram: SystemProgram.programId,
                    })
                    .transaction()

                // 1️⃣ Fetch blockhash
                const {blockhash,lastValidBlockHeight} = await connection.getLatestBlockhash("confirmed")

                tx.feePayer = publicKey
                tx.recentBlockhash = blockhash

                // 2️⃣ Wallet signs
                if (!signTransaction) {
                    throw new Error("Wallet does not support signTransaction")
                }

                const signedTx = await signTransaction(tx)

                // 3️⃣ Send RAW transaction (full control)
                const signature = await connection.sendRawTransaction(
                    signedTx.serialize(),
                    { maxRetries: 0 }
                )
                const currentHeight = await connection.getBlockHeight()
                if(currentHeight > lastValidBlockHeight ){
                    console.log("Blockhash expired!!!!!!")
                }
                // 4️⃣ Confirm with SAME blockhash
                await connection.confirmTransaction(
                    {
                        signature,
                        blockhash,
                        lastValidBlockHeight
                    },
                    "confirmed"
                )

                return signature

            } catch (error:any) {
                console.log("error:", error)
                if( error instanceof AnchorError){
                    throw new Error(error.error.errorMessage)
                }
                if(error.logs) {
                    error.logs.forEach((log:any) => console.error("     ", log));
                }
                throw error
            }
        }
    })
}