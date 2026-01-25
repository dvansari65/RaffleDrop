
import { getPaymentMint } from "@/helpers/getPaymentMint"
import { uploadToIPFS } from "@/helpers/uploadToIPFS"
import { useGetCounter } from "@/hooks/getCounter"
import { useCreateAssociatedToken } from "@/hooks/useCreateATA"
import { useRaffleProgram } from "@/hooks/useRaffleProgram"
import { CreateRaffleInputs } from "@/types/raffleType"
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { useWallet } from "@solana/wallet-adapter-react"
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js"
import { useMutation } from "@tanstack/react-query"
import { BN } from "bn.js"
import { toast } from "sonner"


export const CreateRaffle = () => {
    const { createTokenAccount } = useCreateAssociatedToken()
    const { program } = useRaffleProgram()
    const { publicKey } = useWallet()
    const paymentMint = getPaymentMint()
    const { getCounterValue } = useGetCounter()

    return useMutation<any, Error, CreateRaffleInputs>({
        mutationKey: ["create-raffle",publicKey],
        mutationFn: async ({
            itemDescription,
            itemImage,
            itemName,
            maxTickets,
            minTickets,
            sellingPrice,
            deadline,
            ticketPrice
        }: CreateRaffleInputs) => {
            try {
                if (!publicKey) {
                    throw new Error("Connect your wallet!")
                }
                if (!sellingPrice || !maxTickets || !minTickets || !ticketPrice) {
                    throw new Error("Some fields are missing!")
                }
                if (!program?.programId) {
                    throw new Error("Program not found!")
                }
                const [counterPda] = PublicKey.findProgramAddressSync(
                    [Buffer.from("global-counter")],
                    program.programId
                )
                if (!counterPda) {
                    throw new Error("Counter pda not found!")
                }
                const counterValue = await getCounterValue()
                console.log("Counter value:", String(counterValue))
                const sellerTokenAccount = await createTokenAccount()
                if (!sellerTokenAccount) {
                    throw new Error("Seller token account not found!")
                }

                const [rafflePda] = PublicKey.findProgramAddressSync(
                    [
                        Buffer.from("raffle"),
                        publicKey.toBuffer(),
                        counterValue.toArrayLike(Buffer, "le", 8)
                    ],
                    program?.programId
                )

                console.log("raffleKey key:", rafflePda.toString())

                if (!rafflePda) {
                    throw new Error("Raffle pda not found!")
                }
                const [escrowPaymentAccount] = PublicKey.findProgramAddressSync(
                    [
                        Buffer.from("escrow_payment"),
                        publicKey.toBuffer(),
                        counterValue.toArrayLike(Buffer,"le",8)
                    ],
                    program.programId
                )

                if (!itemImage) {
                    throw new Error("Image not found!")
                }
                let cid: string;

                try {
                    cid = await uploadToIPFS(itemImage)
                } catch (error: any) {
                    throw new Error(error.message)
                }

                const tx = await (program.methods as any)
                    .createRaffle(
                        itemName,
                        itemDescription,
                        cid,
                        new BN(sellingPrice),
                        new BN(ticketPrice),
                        minTickets,
                        maxTickets,
                        new BN(deadline)
                    )
                    .accounts({
                        seller: publicKey,
                        counter: counterPda,
                        paymentMint,
                        sellerTokenAccount: sellerTokenAccount,
                        raffleAccount: rafflePda,
                        escrowPaymentAccount,
                        tokenProgram: TOKEN_PROGRAM_ID,
                        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                        systemProgram: SystemProgram.programId,
                        rend: SYSVAR_RENT_PUBKEY
                    })
                    .rpc()
                console.log("tx", tx)
                return tx
            } catch (error: any) {
                console.log("error:", error.message)
                throw error
            }

        },

    })
}