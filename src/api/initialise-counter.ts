import { useGetCounterPda } from "@/hooks/useGetCounterPda"
import { useRaffleProgram } from "@/hooks/useRaffleProgram"
import { useWallet } from "@solana/wallet-adapter-react"
import { useMutation } from "@tanstack/react-query"
import { SystemProgram, PublicKey } from "@solana/web3.js"
export const initialiseCounter = () => {
    const { program } = useRaffleProgram()

    const { publicKey } = useWallet()
    return useMutation({
        mutationKey: ["counter-init"],
        mutationFn: async () => {
            try {
                if (!publicKey ) {
                    throw new Error("Wallet not connected!")
                }
                // Derive PDA inside the mutation function when we know values exist
                const [counterPda] = PublicKey.findProgramAddressSync(
                    [Buffer.from("global-counter")], // Check your Rust program for exact seeds
                    program.programId
                )
                const tx = await program.methods
                    .initialiseCounter()
                    .accounts({
                        counter: counterPda,
                        signer: publicKey,
                        systemProgram: SystemProgram.programId
                    })
                    .rpc()
                return tx;
            } catch (error) {
                throw error
            }
        }
    })
}