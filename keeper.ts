import { Connection, Keypair, PublicKey, SYSVAR_CLOCK_PUBKEY } from '@solana/web3.js';
import { fileURLToPath } from 'url';
import { createServer } from "http"
import { Server } from "socket.io"
import * as dotenv from "dotenv"
import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor';
import idl from "./src/idl/Raffle.json"
import * as fs from "fs"

dotenv.config()

const keypairFile = fs.readFileSync("./randomness-keypair.json");
const keypair = Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(keypairFile.toString()))
);
const wallet = new Wallet(keypair);

// Handle __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);

const connection = new Connection("http://127.0.0.1:8899", "confirmed");
const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
// Derive program ID either from the IDL or fall back to Anchor.toml value.
const programId =
  (idl as any).address
    ? new PublicKey((idl as any).address)
    : new PublicKey("5CmMWJpHYhPjmhCXaaLU2WskBBB5HJ4yzDv6JzXEiDnz");

const program = new Program(idl as any, provider);

const server = createServer();
const io = new Server(server, {
  cors: {
    methods: ["POST", "GET"],
    origin: "*"
  }
});


io.on("connect", async (socket) => {
  console.log("socket connected:", socket.id)
  socket.on("disconnect", () => {
    console.log("socket disconnected!")
  })
})

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket server is running on ${PORT}`);
});

/**
 * Periodic keeper job:
 * - Runs every 30 seconds
 * - Scans all raffle accounts
 * - For each raffle where:
 *   - on-chain time > deadline
 *   - status == Drawing
 *   - (other invariants are enforced by the on-chain program)
 *   it sends a `draw_winner` instruction.
 */
async function processRaffles() {
  try {
    // Use on-chain time (block time) so it matches the program's Clock::get().
    const slot = await connection.getSlot();
    const nowTs = await connection.getBlockTime(slot);
    if (nowTs === null) {
      console.warn("Keeper: unable to fetch current block time");
      return;
    }

    // Fetch all raffle accounts; on-chain logic will re-check invariants.
    const raffles = await (program.account as any).raffleAccount.all();
    console.log(`Keeper: found ${raffles.length} raffles to inspect`);

    for (const { publicKey, account } of raffles) {
      const deadline = account.deadline.toNumber();
      const status: any = account.status;
      const isDrawing = status && typeof status === "object" && "drawing" in status;

      // Only act on raffles whose deadline has passed and are in Drawing state.
      if (!isDrawing) continue;
      if (nowTs <= deadline) continue;

      console.log(
        `Keeper: triggering draw_winner for raffle ${publicKey.toBase58()} (deadline=${deadline}, now=${nowTs})`
      );

      try {
        const tx = await program.methods
          .drawWinner()
          .accounts({
            raffleAccount: publicKey,
            signer: wallet.publicKey,
            clock: SYSVAR_CLOCK_PUBKEY,
          })
          .rpc();

        console.log(
          `Keeper: draw_winner succeeded for raffle ${publicKey.toBase58()}, tx=${tx}`
        );
      } catch (e) {
        console.error(
          `Keeper: draw_winner failed for raffle ${publicKey.toBase58()}`,
          e
        );
      }
    }
  } catch (e) {
    console.error("Keeper: error while processing raffles", e);
  }
}

// Run immediately on startup, then every 30 seconds.
processRaffles().catch((e) =>
  console.error("Keeper: initial run failed", e)
);
setInterval(() => {
  processRaffles().catch((e) =>
    console.error("Keeper: scheduled run failed", e)
  );
}, 30_000);