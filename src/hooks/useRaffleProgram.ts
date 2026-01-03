import { AnchorProvider, Program } from "@coral-xyz/anchor"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import idl from "../idl/Raffle.json"
import { useMemo } from "react";
import { Raffle } from "@/types/RaffleTypes";

export const useRaffleProgram = ()=>{
    const { connection } = useConnection();
    const wallet = useWallet();
  
    const provider = useMemo(() => {
      if (!wallet.wallet) return null;
  
      return new AnchorProvider(
        connection,
        wallet as any,
        { commitment: "confirmed" }
      );
    }, [connection, wallet]);
  
    const program = useMemo(() => {
      if (!provider) return null;
  
      return new Program<Raffle>(
        idl as Raffle,
        provider
      );
    }, [provider]);
    return {
        program,
        provider
    }
}