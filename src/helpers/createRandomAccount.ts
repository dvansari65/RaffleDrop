
import {
    SwitchboardProgram,
} from "@switchboard-xyz/solana.js";
import {Randomness} from "@switchboard-xyz/on-demand"
import { Connection, Keypair } from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";

export const createRandomAccount = async (connection:Connection,keyPair:Keypair,program:Program) => {
    const sbProgram = SwitchboardProgram.load(connection,keyPair)
    const randomness =await  Randomness.create(sbProgram,keyPair,)
}