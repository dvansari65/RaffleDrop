import { Connection, Keypair } from '@solana/web3.js';
import { fileURLToPath } from 'url';
import { createServer } from "http"
import { Server } from "socket.io"
import * as dotenv from "dotenv"
import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor';
import idl from "./src/idl/Raffle.json"
import * as fs from "fs"

dotenv.config()

const keypairFile = fs.readFileSync("./randomness-keypair.json");
const keypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(keypairFile.toString())));
const wallet = new Wallet(keypair);

// Handle __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);

const connection = new Connection("http://127.0.0.1:8899","confirmed");
const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
const program = new Program(
  idl as any,
  provider
);

const server = createServer()
const io = new Server(server, {
  cors: {
    methods: ["POST", "GET"],
    origin: "*"
  }
})


io.on("connect", async (socket) => {
  console.log("socket connected:", socket.id)
  socket.on("disconnect", () => {
    console.log("socket disconnected!")
  })
})

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`Socket server is running on ${PORT}`)
})