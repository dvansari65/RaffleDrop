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
    pub winner: Option<Pubkey>,
    pub claimed: bool,
    pub bump: u8,
    pub escrow_bump: u8,
}



#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq,Copy,Debug,InitSpace)]
pub enum RaffleStatus {
    Active,
    Drawing,
    Completed,
    Cancelled,
    Refunded,
}
pub struct LegallyBoundRaffle {
    pub raffle_id: Pubkey,
    pub seller: Pubkey,
    pub seller_identity: SellerIdentity,
    pub legal_contract: LegalContract,
    pub item_details: RaffleAccount,
    pub contract_status: ContractStatus,
    pub created_at: i64,
    pub can_be_cancelled: bool,
}

pub struct SellerIdentity {
    // KYC Documents
    pub full_name: String,
    pub government_id_type: String,        // "Aadhaar" / "PAN" / "Passport"
    pub government_id_number: String,      // Encrypted
    pub government_id_hash: [u8; 32],      // Document hash stored on Arweave
    pub address: String,
    pub phone_number: String,
    pub email: String,
    pub photo_hash: [u8; 32],              // Selfie verification
    
    // Document Proofs
    pub ownership_documents: Vec<DocumentProof>,
    pub verification_status: VerificationStatus,
    pub verified_at: i64,
    pub verified_by: String,                // Platform admin who verified
}

pub struct DocumentProof {
    pub document_type: String,              // "Sale Deed", "Invoice", "Receipt"
    pub document_hash: [u8; 32],            // SHA256 hash
    pub arweave_uri: String,                // Permanent storage link
    pub uploaded_at: i64,
}

pub struct LegalContract {
    pub contract_text_hash: [u8; 32],       // Hash of full contract
    pub contract_arweave_uri: String,       // Full contract on Arweave
    pub seller_signature: [u8; 64],         // Cryptographic signature
    pub seller_acceptance_timestamp: i64,
    pub ip_address: String,                 // For legal records
    pub geolocation: Option<String>,
    pub terms_version: String,              // "v1.0"
    pub is_legally_binding: bool,
}

pub enum ContractStatus {
    Draft,                  // Contract created but not signed
    Active,                 // Signed and raffle running
    Completed,              // Raffle finished, item delivered
    SellerCancelled,        // Seller cancelled before first ticket
    Breached,               // Seller violated terms
    Disputed,               // Under dispute resolution
}

pub enum VerificationStatus {
    Pending,
    Verified,
    Rejected,
    Flagged,
}