use anchor_lang::prelude::Pubkey;
use anchor_lang::prelude::*;

#[event]
#[derive(Debug)]
pub struct RaffleCreated {
    pub raffle: Pubkey,
    pub seller: Pubkey,
    pub ticket_price:u64,
    pub deadline:i64,
}

#[event]
pub struct TicketsBought {
    pub buyer: Pubkey,
    pub raffle: Pubkey,
    pub number_of_tickets_bought: u8,
    pub total_tickets_now: u64,
    pub total_participants_now: u32,
}

#[event]
#[derive(Debug)]
pub struct  ProductShipped {
    pub raffle: Pubkey,
    pub winner: Pubkey,
    pub shipped_at: Option<i64>,
}

#[event]
#[derive(Debug)]
pub struct  ProductDelivered {
    pub raffle: Pubkey,
    pub winner: Pubkey,
    pub delivered_at: Option<i64>,
}