use anchor_lang::prelude::*;

#[account]
#[derive(Debug,InitSpace)]
pub struct RaffleAccount {
    pub raffle_id:u64,
    pub seller: Pubkey,
    pub is_sold_out:bool,
    pub progress:u32,
    pub total_entries:u64, // Total tickets sold
    pub payment_mint: Pubkey,
    #[max_len(32)]
    pub item_name: String,
    #[max_len(64)]
    pub item_description: String,
    #[max_len(128)]
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
    pub product_delivered_status:DeliveryStatus,
    #[max_len(32)]
    pub tracking_info: Option<String>,
    pub shipped_at:Option<i64>,
    pub despute_deadline:Option<i64>
}

#[account]
#[derive(Debug,InitSpace)]
pub struct Counter {
    pub counter:u64
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq,Debug,InitSpace)]
pub enum DeliveryStatus {
    Pending,           // Winner selected, awaiting delivery
    Shipped,           // Seller marked as shipped
    Delivered,         // Winner confirmed delivery
    Disputed,          // Winner disputes delivery
    Resolved,          // Dispute resolved
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq,Copy,Debug,InitSpace)]
pub enum RaffleStatus {
    Active,
    Drawing,
    Completed,
    Cancelled,
    Refunded,
    Ended
}
