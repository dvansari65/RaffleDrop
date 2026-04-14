import { Connection, Keypair, SYSVAR_CLOCK_PUBKEY } from '@solana/web3.js'
import { createServer } from 'http'
import { Server } from 'socket.io'
import * as dotenv from 'dotenv'
import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor'
import idl from './idl/Raffle.json'
import * as fs from 'fs'

dotenv.config()

const keypairData = process.env.KEEPER_KEYPAIR
  ? JSON.parse(process.env.KEEPER_KEYPAIR)
  : JSON.parse(fs.readFileSync('./keeper-wallet.json').toString())

const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData))
const wallet = new Wallet(keypair)

const connection = new Connection(process.env.RPC_URL || '', 'confirmed')

const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' })
// Derive program ID either from the IDL or fall back to Anchor.toml value.
const program = new Program(idl as any, provider)

const server = createServer()
const io = new Server(server, {
  cors: {
    methods: ['POST', 'GET'],
    origin: '*',
  },
})

io.on('connect', async (socket) => {
  console.log('socket connected:', socket.id)
  socket.on('disconnect', () => {
    console.log('socket disconnected!')
  })
})

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`Socket server is running on ${PORT}`)
})

function toNumber(value: { toNumber?: () => number } | number): number {
  return typeof value === 'number' ? value : value.toNumber?.() ?? Number(value)
}

function hasStatus(status: unknown, expected: string): boolean {
  if (typeof status === 'string') {
    return status.toLowerCase() === expected.toLowerCase()
  }

  return Boolean(status && typeof status === 'object' && expected in status)
}

let isProcessing = false

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
  if (isProcessing) {
    console.log('Keeper: previous scan still running, skipping this interval')
    return
  }

  isProcessing = true

  try {
    // Use on-chain time (block time) so it matches the program's Clock::get().
    const slot = await connection.getSlot()
    const nowTs = await connection.getBlockTime(slot)
    if (nowTs === null) {
      console.warn('Keeper: unable to fetch current block time')
      return
    }

    // Fetch all raffle accounts; on-chain logic will re-check invariants.
    const raffles = await (program.account as any).raffleAccount.all()
    console.log(`Keeper: found ${raffles.length} raffles to inspect`)

    for (const { publicKey, account } of raffles) {
      const deadline = toNumber(account.deadline)
      const isDrawing = hasStatus(account.status, 'drawing')

      if (account.participants.length <= 0) {
        console.log(`Keeper: skipping ${publicKey.toBase58()} because it has no participants`)
        continue
      }

      // Only act on raffles whose deadline has passed and are in Drawing state.
      if (!isDrawing) continue
      if (nowTs <= deadline) continue

      console.log(
        `Keeper: triggering draw_winner for raffle ${publicKey.toBase58()} (deadline=${deadline}, now=${nowTs})`,
      )

      try {
        const tx = await program.methods
          .drawWinner()
          .accounts({
            raffleAccount: publicKey,
            signer: wallet.publicKey,
            clock: SYSVAR_CLOCK_PUBKEY,
          })
          .rpc()

        if (tx) {
          console.log('Winner selected!')
        }
        console.log(`Keeper: draw_winner succeeded for raffle ${publicKey.toBase58()}, tx=${tx}`)
      } catch (e) {
        console.error(`Keeper: draw_winner failed for raffle ${publicKey.toBase58()}`, e)
      }
    }
  } catch (e) {
    console.error('Keeper: error while processing raffles', e)
  } finally {
    isProcessing = false
  }
}

// Run immediately on startup, then every 30 seconds.
processRaffles().catch((e) => console.error('Keeper: initial run failed', e))
setInterval(() => {
  processRaffles().catch((e) => console.error('Keeper: scheduled run failed', e))
}, 30_000)
