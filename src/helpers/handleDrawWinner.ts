import { Program } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import * as sb from "@switchboard-xyz/on-demand";
import { setTimeout } from "timers/promises";

async function handleRaffleDraw({
    rafflePubkey,
    raffleProgram,
    queue,
    connection,
    payer,
}: {
    rafflePubkey: PublicKey;
    raffleProgram: Program;
    queue: PublicKey;
    connection: Connection;
    payer: Keypair;
}) {
    // 1️⃣ Create randomness account
    const rngKp = Keypair.generate();

    const [randomness, createIx] =
        await sb.Randomness.create(raffleProgram, rngKp, queue);

    const createTx = await sb.asV0Tx({
        connection,
        ixs: [createIx],
        payer: payer.publicKey,
        signers: [payer, rngKp],
        computeUnitPrice: 75_000,
        computeUnitLimitMultiple: 1.3,
    });

    await connection.sendTransaction(createTx);
    console.log("Randomness account created:", rngKp.publicKey.toBase58());

    // 2️⃣ COMMIT PHASE
    const commitIx = await randomness.commitIx(queue);

    const requestDrawIx = await raffleProgram.methods
        .requestDraw()
        .accounts({
            raffleAccount: rafflePubkey,
            randomnessAccountData: rngKp.publicKey,
            authority: payer.publicKey,
        })
        .instruction();
    console.log("request draw instruciton:", requestDrawIx)
    const commitTx = await sb.asV0Tx({
        connection,
        ixs: [commitIx, requestDrawIx],
        payer: payer.publicKey,
        signers: [payer],
        computeUnitPrice: 75_000,
        computeUnitLimitMultiple: 1.3,
    });

    const commitSig = await connection.sendTransaction(commitTx);
    await connection.confirmTransaction(commitSig, "confirmed");

    console.log("Commit done:", commitSig);

    // 3️⃣ Wait for slot to advance
    await setTimeout(2000, "Wait...")

    // 4️⃣ REVEAL PHASE
    const revealIx = await randomness.revealIx();

    const drawWinnerIx = await raffleProgram.methods
        .drawWinner()
        .accounts({
            raffleAccount: rafflePubkey,
            randomnessAccountData: rngKp.publicKey,
        })
        .instruction();

    const revealTx = await sb.asV0Tx({
        connection,
        ixs: [revealIx, drawWinnerIx],
        payer: payer.publicKey,
        signers: [payer],
        computeUnitPrice: 75_000,
        computeUnitLimitMultiple: 1.3,
    });

    const revealSig = await connection.sendTransaction(revealTx);
    await connection.confirmTransaction(revealSig, "confirmed");

    console.log("Winner drawn:", revealSig);
}

export default handleRaffleDraw