import { AnchorProvider, Program } from "@coral-xyz/anchor"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import idl from "../idl/Raffle.json"
import { useMemo } from "react";
import {Raffle} from "../types/Raffle"

// Read-only wallet for fetching data without connection
class ReadOnlyWallet {
  constructor(public publicKey: PublicKey) {}
  async signTransaction() { throw new Error("Read-only wallet") }
  async signAllTransactions() { throw new Error("Read-only wallet") }
}

export const useRaffleProgram = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const provider = useMemo(() => {
    // Use connected wallet if available, otherwise use read-only wallet
    const walletToUse = wallet.wallet 
      ? wallet 
      : new ReadOnlyWallet(PublicKey.default);
    
    return new AnchorProvider(
      connection,
      walletToUse as any,
      { commitment: "confirmed" }
    );
  }, [connection, wallet]);

  const program = useMemo(() => {
    return new Program<Raffle>(
      idl as Raffle,
      provider
    );
  }, [provider]);
  
  return {
    program,
    provider,
    isConnected: !!wallet.wallet // Add this to check if wallet is connected
  }
}