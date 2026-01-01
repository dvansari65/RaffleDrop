import { createAssociatedTokenAccount, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress } from "@solana/spl-token"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { useRaffleProgram } from "./useRaffleProgram"
import { PublicKey, Transaction } from "@solana/web3.js"


export const useCreateToken = async () => {
    const { publicKey, sendTransaction } = useWallet()
    const { program } = useRaffleProgram()
    const { connection } = useConnection()
    try {
        const paymentMint = process.env.NEXT_PUBLIC_PAYMENT_MINT;
        if (!publicKey) {
            throw new Error("Connect your wallet first!")
        }
        if (!paymentMint) {
            throw new Error("Payment Mint not found!")
        }

        const tokenATA = await getAssociatedTokenAddress(new PublicKey(paymentMint), publicKey, false, program.programId)
        const transaction = new Transaction()
        const accountInfo = await connection.getAccountInfo(tokenATA)
        const needsAccount = !accountInfo
        if (!needsAccount) {
            console.log("account already exist!")
            tokenATA;
        }
        if (needsAccount) {
            transaction.add(
                createAssociatedTokenAccountInstruction(publicKey, tokenATA, publicKey, new PublicKey(paymentMint), program.programId)
            )
        }
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash({ commitment: "confirmed" })

        transaction.feePayer = publicKey;
        transaction.recentBlockhash = blockhash;

        let signature;
        try {
            signature = await sendTransaction(transaction, connection, {
                maxRetries: 3,
                preflightCommitment: "processed"
            })
        } catch (error) {
            throw error;
        }
        
        await connection.confirmTransaction({
            signature,
            blockhash,
            lastValidBlockHeight
        },"confirmed")

        return tokenATA
    } catch (error) {
        throw error;
    }
}