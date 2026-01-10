import {PublicKey} from "@solana/web3.js"
export interface CreateRaffleInputs {
    itemName: string,
    itemDescription: string,
    itemImage: File | null,
    sellingPrice: number | null,
    ticketPrice:number | null,
    minTickets: number | null,
    maxTickets: number | null,
    deadline: number,
}

export type RaffleStatus = "active" | "drawing" | "completed" | "cancelled" | "refunded";


export interface buyTicketProps {
    numTickets:number,
    sellerKey: PublicKey; 
    raffleKey:PublicKey
}

export type RaffleUIState =
| "live"
| "sold_out"
| "drawing"
| "completed"
| "cancelled"
| "refunded"
| "expired"