use anchor_lang::prelude::Pubkey;

#[event]
#[derive(Debug)]
pub struct RaffleCreated {
    raffle: Pubkey,
    seller: Pubkey,
    ticket_price:u64,
    deadline:u64,
}