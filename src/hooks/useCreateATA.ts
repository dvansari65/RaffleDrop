import { getPaymentMint } from "@/helpers/getPaymentMint"
import { ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { useRaffleProgram } from "./useRaffleProgram"
import { PublicKey, Transaction } from '@solana/web3.js'

export const useCreateAssociatedToken = ()=>{
  const paymentMint = getPaymentMint()
  const {publicKey,sendTransaction} = useWallet()
  const {connection} = useConnection()
  const createTokenAccount =  async ()=>{
    try {
      if(!publicKey){
        throw new Error("Please connect your wallet first!")
      }
      let tokenATA:PublicKey
      try {
        tokenATA = await getAssociatedTokenAddress(paymentMint,publicKey,false,TOKEN_PROGRAM_ID,ASSOCIATED_TOKEN_PROGRAM_ID);
      } catch (error:any) {
        console.log("Error while obtaining ATA:",error.message)
        throw error;
      }
      let accountInfo;
      try {
          accountInfo = await connection.getAccountInfo(tokenATA,"confirmed")
          if(accountInfo){
            console.log("Token ATA already exist!")
            return tokenATA;
          }
      } catch (error) {
        console.group("Account info not found!")
        throw error;
      }
      const transaction = new Transaction()
      transaction.add(
        createAssociatedTokenAccountInstruction(publicKey,tokenATA,publicKey,paymentMint)
      )
      const {blockhash,lastValidBlockHeight } = await connection.getLatestBlockhash()
      transaction.feePayer = publicKey;
      transaction.recentBlockhash = blockhash;
      let sig;
      try {
        sig = await sendTransaction(transaction,connection,{
          maxRetries:3,
          skipPreflight:false,
          preflightCommitment:"processed"
        })
      } catch (error) {
        console.log("Error while sending error:",error)
        throw error
      }
      await connection.confirmTransaction({
        signature:sig,
        blockhash,
        lastValidBlockHeight
      },"confirmed")
      return tokenATA
    } catch (error:any) {
      console.log("Error while creating Token account:",error.message)
      throw error;
    }
  }
  return {
    createTokenAccount
  }
}