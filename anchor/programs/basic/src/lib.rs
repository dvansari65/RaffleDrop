use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use solana_program::pubkey::Pubkey;

use crate::types::RaffleAccount;
declare_id!("JAVuBXeBZqXNtS73azhBDAoYaaAFfo4gWXoZe2e7Jf8H");

mod types;
mod errors;
mod events;

#[program]
pub mod basic {
    use super::*;

    pub fn create_raffle(
        ctx: Context<CreateRaffle>,
        item_name: String,
        item_description: String,
        item_image_uri: String,
        selling_price: u64,
        ticket_price: u64,
        min_tickets: u32,
        max_tickets: u32,
        deadline: i64,
    ) -> Result<()> {
        let raffle = &mut ctx.accounts.raffle_account;
        let clock = Clock::get()?;

        // Input validation
        require!(selling_price > 0, ErrorCode::InvalidPrice);
        require!(ticket_price > 0, ErrorCode::InvalidPrice);
        require!(min_tickets > 0, ErrorCode::InvalidTicketCount);
        require!(
            max_tickets >= min_tickets,
            ErrorCode::InvalidTicketCount
        );
        require!(
            deadline > clock.unix_timestamp,
            ErrorCode::InvalidDeadline
        );

        // Initialize raffle account
        raffle.seller = ctx.accounts.seller.key();
        raffle.payment_mint = ctx.accounts.payment_mint.key();
        raffle.item_name = item_name;
        raffle.item_description = item_description;
        raffle.item_image_uri = item_image_uri;
        raffle.selling_price = selling_price;
        raffle.ticket_price = ticket_price;
        raffle.min_tickets = min_tickets;
        raffle.max_tickets = max_tickets;
        raffle.deadline = deadline;
        raffle.participants = Vec::new();
        raffle.total_collected = 0;
        raffle.status = RaffleStatus::Active;
        raffle.winner = None;
        raffle.claimed = false;
        raffle.bump = ctx.bumps.raffle_account;
        raffle.escrow_bump = ctx.bumps.escrow_payment_account;

        emit!(RaffleCreated {
            raffle: raffle.key(),
            seller: raffle.seller,
            ticket_price,
            deadline,
        });

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(
    item_name: String,
    item_description: String,
    item_image_uri: String,
    selling_price: u64,
    ticket_price: u64,
    min_tickets: u32,
    max_tickets: u32,
    deadline: i64,
)]
pub struct CreateRaffle<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,

    /// Payment token mint (USDC, SOL wrapped, etc.)
    pub payment_mint: Account<'info, Mint>,

    /// Seller's token account
    #[account(
        mut,
        constraint = seller_token_account.mint == payment_mint.key(),
        constraint = seller_token_account.owner == seller.key(),
    )]
    pub seller_token_account: Account<'info, TokenAccount>,

    /// Raffle PDA
    #[account(
        init,
        payer = seller,
        space = RaffleAccount::SIZE,
        seeds = [
            b"raffle",
            seller.key().as_ref(),
            &selling_price.to_le_bytes(),
            &deadline.to_le_bytes()
        ],
        bump
    )]
    pub raffle_account: Account<'info, RaffleAccount>,

    /// Escrow token account - THE FIX IS HERE
    /// Must be initialized AFTER raffle_account exists
    #[account(
        init,
        payer = seller,
        seeds = [b"escrow_payment", raffle_account.key().as_ref()],
        bump,
        token::mint = payment_mint,
        token::authority = raffle_account,
    )]
    pub escrow_payment_account: Account<'info, TokenAccount>,

    /// Programs
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}