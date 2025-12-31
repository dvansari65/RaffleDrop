use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer, spl_token::state::ACCOUNT_INITIALIZED_INDEX};
use solana_program::pubkey::Pubkey;

use crate::types::RaffleAccount;
declare_id!("JAVuBXeBZqXNtS73azhBDAoYaaAFfo4gWXoZe2e7Jf8H");

mod types;
mod errors;
mod events;

#[program]
pub mod basic {
    use crate::{events::TicketsBought, types::RaffleStatus};

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
    pub fn buy_tickets (
        ctx: Context<BuyTickets>,
        num_tickets:u8
    )->Result<()>{
        let raffle_account = &mut ctx.accounts.raffle_account;
        let clock = Clock::get()?.unix_timestamp;
        let escrow_account = &mut ctx.accounts.escrow_payment_account;
        let buyer = &mut ctx.accounts.buyer;
        require!(raffle_account.status == RaffleStatus::Active,ErrorCode::RaffleNotActive);
        require!(num_tickets > 0,ErrorCode::InvalidTicketCount);
        require!(raffle_account.deadline > clock,ErrorCode::DeadlinePassed);
        require!(
            raffle_account.participants.len() + num_tickets as usize <= raffle_account.max_tickets as usize,
            ErrorCode::MaxTicketsReached
        );
        let total_price= num_tickets
                            .checked_mul(raffle_account.selling_price as u8)
                            .ok_or(ErrorCode::Overflow)?;
        let cpi_accounts = Transfer {
            from:ctx.accounts.buyer_token_accont.to_account_info(),
            to:escrow_account.to_account_info(),
            authority:buyer.to_account_info()
        };
        let cpi_program =  ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, total_price as u65)?;
        
        raffle_account.total_collected = raffle_account 
                                            .total_collected
                                            .checked_add(total_price as u64)
                                            .ok_or(ErrorCode::OverFlow)?;
        let participants = raffle_account.participants;
        for _ in 0..num_tickets  {  
            participants.push(buyer.key());
        };

        emit!(TicketsBought{
            buyer:buyer.key(),
            raffle:raffle_account.key(),
            number_of_tickets_bought:num_tickets
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
        space = ACCOUNT_INITIALIZED_INDEX,
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

#[derive(Accounts)]
pub struct  BuyTickets<'info> {
    #[account(mut)]
    pub buyer : Signer<'info>,

    #[account(mut)]
    pub buyer_token_accont : Account<'info,TokenAccount>,

    #[account(
        seeds = [b"raffle",raffle.seller.key().as_ref(),&raffle.selling_price.to_le_bytes(),&raffle.deadline.to_le_bytes()],
        bump = raffle.bump
    )]
    pub raffle_account : Account<'info,RaffleAccount>,

    #[account(
        seeds = [b"escrow_payment",raffle_account.key().as_ref()],
        bump
    )]
    pub escrow_payment_account : Account<'info,TokenAccount>,

    pub token_program : Program<'info,Token>,
    pub system_program : Program<'info,System>
}