use anchor_lang::prelude::Pubkey;
use anchor_lang::prelude::*;

#[event]
#[derive(Debug)]
pub struct RaffleCreated {
    pub raffle: Pubkey,
    pub seller: Pubkey,
    pub ticket_price:u64,
    pub deadline:u64,
}

#[event]
#[derive(Debug)]
pub struct TicketsBought {
   pub buyer:Pubkey,
   pub raffle:Pubkey,
   pub number_of_tickets_bought:u8
}