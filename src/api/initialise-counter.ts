import { useRaffleProgram } from '@/hooks/useRaffleProgram'
import { useWallet } from '@solana/wallet-adapter-react'
import { useMutation } from '@tanstack/react-query'
import { SystemProgram, PublicKey } from '@solana/web3.js'

export const initialiseCounter = () => {
  const { program } = useRaffleProgram()
  const { publicKey } = useWallet()

  return useMutation({
    mutationKey: ['counter-init'],
    mutationFn: async () => {
      try {
        if (!publicKey) {
          throw new Error('Wallet not connected!')
        }
        if (!program?.programId) {
          throw new Error('Program not found!')
        }

        const [counterPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('global-counter')],
          program.programId,
        )

        const tx = await (program.methods as any)
          .initialiseCounter()
          .accounts({
            counter: counterPda,
            signer: publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc()
        return tx
      } catch (error) {
        throw error
      }
    },
  })
}
