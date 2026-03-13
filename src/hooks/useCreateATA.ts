import { getPaymentMint } from '@/helpers/getPaymentMint'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, Transaction } from '@solana/web3.js'

export const useCreateAssociatedToken = () => {
  const paymentMint = getPaymentMint()
  const { publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()

  const createTokenAccount = async () => {
    try {
      // Check wallet connection
      if (!publicKey) {
        console.error('❌ Wallet not connected')
        throw new Error('Please connect your wallet first!')
      }
      console.log('✅ Wallet connected')

      // Get Associated Token Address
      let tokenATA: PublicKey
      try {
        console.log('🔍 Getting Associated Token Address...')
        tokenATA = await getAssociatedTokenAddress(
          paymentMint,
          publicKey,
          false,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID,
        )
        console.log('✅ Token ATA:', tokenATA.toString())
      } catch (error: any) {
        console.error('❌ Error obtaining ATA:', error.message)
        console.error('Full error:', error)
        throw error
      }

      // Check if account already exists
      let accountInfo
      try {
        console.log('🔍 Checking if ATA already exists...')
        accountInfo = await connection.getAccountInfo(tokenATA, 'confirmed')

        if (accountInfo) {
          console.log('✅ Token ATA already exists!')
          console.log('Account data:', accountInfo)
          return tokenATA
        }
        console.log('ℹ️ ATA does not exist, creating new one...')
      } catch (error: any) {
        console.error('❌ Error checking account info:', error.message)
        throw error
      }

      // Check mint account exists
      try {
        console.log('🔍 Verifying payment mint exists...')
        const mintInfo = await connection.getAccountInfo(paymentMint, 'confirmed')
        if (!mintInfo) {
          console.error('❌ Payment mint does not exist:', paymentMint.toString())
          throw new Error(
            'Payment mint account does not exist. Make sure the mint is deployed on your local validator.',
          )
        }
        console.log('✅ Payment mint exists')
        console.log('Mint info:', mintInfo)
      } catch (error: any) {
        console.error('❌ Error verifying mint:', error.message)
        throw error
      }

      // Check wallet balance
      try {
        console.log('🔍 Checking wallet balance...')
        const balance = await connection.getBalance(publicKey)
        console.log('💵 Wallet balance:', balance / 1e9, 'SOL')

        if (balance === 0) {
          console.error('❌ Wallet has 0 SOL balance')
          throw new Error('Insufficient SOL balance. Airdrop some SOL: solana airdrop 2 <your-address> --url localhost')
        }
        console.log('✅ Wallet has sufficient balance')
      } catch (error: any) {
        console.error('❌ Error checking balance:', error.message)
        throw error
      }

      // Create transaction
      console.log('🔨 Building transaction...')
      const transaction = new Transaction()

      const instruction = createAssociatedTokenAccountInstruction(
        publicKey, // payer
        tokenATA, // associated token address
        publicKey, // owner
        paymentMint, // mint
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      )

      console.log('📝 Instruction created:', instruction)
      transaction.add(instruction)

      // Get recent blockhash
      let blockhash: string
      let lastValidBlockHeight: number
      try {
        console.log('🔍 Getting latest blockhash...')
        const blockhashInfo = await connection.getLatestBlockhash('confirmed')
        blockhash = blockhashInfo.blockhash
        lastValidBlockHeight = blockhashInfo.lastValidBlockHeight
        console.log('✅ Blockhash:', blockhash)
        console.log('✅ Last valid block height:', lastValidBlockHeight)
      } catch (error: any) {
        console.error('❌ Error getting blockhash:', error.message)
        throw error
      }

      // Set transaction properties
      transaction.feePayer = publicKey
      transaction.recentBlockhash = blockhash

      console.log('📦 Transaction prepared:')
      console.log('  - Fee payer:', transaction.feePayer.toString())
      console.log('  - Recent blockhash:', transaction.recentBlockhash)
      console.log('  - Instructions:', transaction.instructions.length)

      // Simulate transaction first
      try {
        console.log('🧪 Simulating transaction...')
        const simulation = await connection.simulateTransaction(transaction)
        console.log('✅ Simulation result:', simulation)

        if (simulation.value.err) {
          console.error('❌ Simulation failed:', simulation.value.err)
          console.error('Logs:', simulation.value.logs)
          throw new Error(`Transaction simulation failed: ${JSON.stringify(simulation.value.err)}`)
        }
        console.log('✅ Simulation successful')
      } catch (error: any) {
        console.error('❌ Simulation error:', error.message)
        console.error('Full error:', error)
        // Continue anyway, simulation might fail but real tx might work
      }

      // Send transaction
      let sig: string
      try {
        console.log('📤 Sending transaction...')
        sig = await sendTransaction(transaction, connection, {
          maxRetries: 3,
          skipPreflight: false,
          preflightCommitment: 'confirmed',
        })
        console.log('✅ Transaction sent! Signature:', sig)
        console.log(
          '🔗 View on explorer: https://explorer.solana.com/tx/' +
            sig +
            '?cluster=custom&customUrl=http://localhost:8899',
        )
      } catch (error: any) {
        console.error('❌ Error sending transaction:', error.message)
        console.error('Error code:', error.code)
        console.error('Error name:', error.name)
        console.error('Full error object:', error)

        // Common error messages
        if (error.message?.includes('insufficient')) {
          console.error('💡 Tip: Your wallet might not have enough SOL for rent + fees')
          console.error('💡 Run: solana airdrop 2 ' + publicKey.toString() + ' --url localhost')
        }
        if (error.message?.includes('blockhash')) {
          console.error('💡 Tip: Blockhash might be expired, try again')
        }
        if (error.message?.includes('User rejected')) {
          console.error('💡 Tip: You cancelled the transaction in your wallet')
        }

        throw error
      }

      // Confirm transaction
      console.log('⏳ Confirming transaction...')
      try {
        const confirmation = await connection.confirmTransaction(
          {
            signature: sig,
            blockhash,
            lastValidBlockHeight,
          },
          'confirmed',
        )

        console.log('✅ Transaction confirmed!')
        console.log('Confirmation:', confirmation)

        if (confirmation.value.err) {
          console.error('❌ Transaction failed on-chain:', confirmation.value.err)
          throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`)
        }
      } catch (error: any) {
        console.error('❌ Error confirming transaction:', error.message)
        throw error
      }

      console.log('🎉 Token account created successfully!')
      console.log('Token ATA:', tokenATA.toString())
      return tokenATA
    } catch (error: any) {
      console.error('❌ FINAL ERROR in createTokenAccount:', error.message)
      console.error('Stack trace:', error.stack)
      throw error
    }
  }

  return {
    createTokenAccount,
  }
}
