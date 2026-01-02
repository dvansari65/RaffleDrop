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