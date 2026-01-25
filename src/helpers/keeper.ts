
import * as sb from "@switchboard-xyz/on-demand";
import handleRaffleDraw from "./handleDrawWinner";
import { Program } from "@coral-xyz/anchor";
import { Connection, Keypair } from "@solana/web3.js";

export async function runKeeper(program:Program,connection:Connection,payer:Keypair) {

  if (!program){
    throw new Error("Program not found!")
  }
  // Load Switchboard queue
  const queue = await sb.getDefaultQueue(connection.rpcEndpoint);
  if(!queue){
    throw new Error("Queue account not found!")
  }
  const results = [];
  // ✅ NO SEPARATE sbProgram NEEDED
  // Switchboard functionality is accessed through classes directly
  
  // Fetch raffles ready to draw
  const raffles = await (program?.account as any).raffleAccount.all();
  
  for (const raffle of raffles) {
    await handleRaffleDraw({
      rafflePubkey: raffle.publicKey,
      raffleProgram:program,
      queue:queue.pubkey,
      connection,
      payer: payer,
    });
    if(raffle.winner){
        results.push(String(raffle.winner))
    }
  }
  return results;
}