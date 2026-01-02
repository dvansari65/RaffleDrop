import { PublicKey } from "@solana/web3.js"

export function getPaymentMint(): PublicKey {
    const mintStr = process.env.NEXT_PUBLIC_PAYMENT_MINT
    if (!mintStr) throw new Error("Payment mint not configured")
    return new PublicKey(mintStr)
  }

