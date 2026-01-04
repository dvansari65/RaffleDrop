use anchor_lang::prelude::*;

#[account]
#[derive(Debug,InitSpace)]
pub struct RaffleAccount {
    pub seller: Pubkey,
    pub payment_mint: Pubkey,
    #[max_len(32)]
    pub item_name: String,
    #[max_len(64)]
    pub item_description: String,
    #[max_len(64)]
    pub item_image_uri: String,
    pub selling_price: u64,
    pub ticket_price: u64,
    pub min_tickets: u32,
    pub max_tickets: u32,
    pub deadline: i64,
    #[max_len(32)]
    pub participants: Vec<Pubkey>,
    pub total_collected: u64,
    pub status: RaffleStatus,
    pub randomness_account: Option<Pubkey>,
    pub winner: Option<Pubkey>,
    pub claimed: bool,
    pub bump: u8,
    pub escrow_bump: u8,
    pub product_delivered:bool
}



#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq,Copy,Debug,InitSpace)]
pub enum RaffleStatus {
    Active,
    Drawing,
    Completed,
    Cancelled,
    Refunded,
}
