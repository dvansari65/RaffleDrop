import {PublicKey} from "@solana/web3.js"
export interface CreateRaffleInputs {
    itemName: string,
    itemDescription: string,
    itemImageUri: string,
    sellingPrice: number,
    ticketPrice: number,
    minTickets: number,
    maxTickets: number,
    deadline: number,
}

export type RaffleStatus = "active" | "drawing" | "completed" | "cancelled" | "refunded";


export interface buyTicketProps {
    numTickets:number,
    sellingPrice:number,
    deadline:number,
    sellerPubKey: PublicKey; 
    rafflePubKey: PublicKey; 
}