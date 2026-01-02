import { CreateRaffleInputs } from "@/types/raffle";

// Constants
const PRICE_MULTIPLIER = 1_000_000 // For 6 decimal places (USDC standard)
const RAFFLE_CACHE_KEY = "raffles"

export function convertPrices(inputs: CreateRaffleInputs) {
    return {
      sellingPriceLamports: inputs.sellingPrice * PRICE_MULTIPLIER,
      ticketPriceLamports: inputs.ticketPrice * PRICE_MULTIPLIER
    }
  }