
import { Raffle } from "@/types/Raffle"
import { Program } from "@coral-xyz/anchor"
import {PublicKey,Connection} from "@solana/web3.js"
export const checkCounterInfo = async (
    program:Program<Raffle>,
    connection:Connection
):Promise<boolean>=>{
    try {
        const [counterPda] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("global-counter"),
            ],
            program.programId
        )
        const accountInfo = await connection.getAccountInfo(counterPda,"confirmed")
        return accountInfo !== null;
    } catch (error) {
        console.error("Error checking counter:", error);
        return false;
    }
}