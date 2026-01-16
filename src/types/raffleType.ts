import { Idl, Program } from "@coral-xyz/anchor";
import {Connection, PublicKey} from "@solana/web3.js"
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

export type RaffleStatus = "active" | "drawing" | "completed" | "cancelled" | "refunded" | "ended";


export interface buyTicketProps {
    numTickets:number,
    sellerKey: PublicKey; 
    raffleKey:PublicKey;
    raffleId:number | null
}

export type RaffleUIState =
| "live"
| "sold_out"
| "drawing"
| "completed"
| "cancelled"
| "refunded"
| "expired"

export interface createRandomAccountDataProps {
    program:Program<Idl>,
    connection:Connection
}