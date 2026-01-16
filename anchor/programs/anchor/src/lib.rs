use crate::{
    error::RaffleError,
    events::{ProductDelivered, ProductShipped},
    types::{Counter, RaffleAccount, RaffleStatus},
};
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, Token, TokenAccount, Transfer},
};
use switchboard_on_demand::on_demand::accounts::pull_feed::PullFeedAccountData;

declare_id!("5CmMWJpHYhPjmhCXaaLU2WskBBB5HJ4yzDv6JzXEiDnz");
mod error;
mod events;
mod types;
mod utils;
mod helpers;

#[program]
pub mod Raffle {

    use super::*;
    use crate::{
        error::RaffleError, events::{RaffleCreated, TicketsBought}, helpers::get_unix_timestamp, types::RaffleStatus
    };

    pub fn initialise_counter(ctx: Context<InitializeCounter>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.counter = 0;
        Ok(())
    }
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
        let counter = &mut ctx.accounts.counter;

        let raffle_id = counter.counter;
        // Token decimals constant
        const DECIMALS: u64 = 1_000_000; // 10^6 for 6 decimals

        // Input validation
        require!(selling_price > 0, RaffleError::InvalidPrice);
        require!(ticket_price > 0, RaffleError::InvalidPrice);
        require!(min_tickets > 0, RaffleError::InvalidTicketCount);
        require!(max_tickets >= min_tickets, RaffleError::InvalidTicketCount);
        require!(
            deadline > clock.unix_timestamp,
            RaffleError::InvalidDeadline
        );

        // Convert prices to smallest unit (accounting for 6 decimals)
        let selling_price_with_decimals = selling_price
            .checked_mul(DECIMALS)
            .ok_or(RaffleError::Overflow)?;

        let ticket_price_with_decimals = ticket_price
            .checked_mul(DECIMALS)
            .ok_or(RaffleError::Overflow)?;

        // Initialize raffle account
        raffle.seller = ctx.accounts.seller.key();
        raffle.payment_mint = ctx.accounts.payment_mint.key();
        raffle.item_name = item_name;
        raffle.item_description = item_description;
        raffle.item_image_uri = item_image_uri;
        raffle.selling_price = selling_price_with_decimals;
        raffle.ticket_price = ticket_price_with_decimals;
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
        raffle.is_sold_out = false;
        raffle.total_entries = 0;
        raffle.raffle_id = raffle_id;
        counter.counter = counter
            .counter
            .checked_add(1)
            .ok_or(RaffleError::Overflow)?;

        emit!(RaffleCreated {
            raffle: raffle.key(),
            seller: raffle.seller,
            ticket_price: ticket_price_with_decimals,
            deadline,
        });
        Ok(())
    }
    pub fn buy_tickets(ctx: Context<BuyTickets>, num_tickets: u8) -> Result<()> {
        let raffle_account = &mut ctx.accounts.raffle_account;
        let clock = Clock::get()?.unix_timestamp;
        let escrow_account = &mut ctx.accounts.escrow_payment_account;
        let buyer = &mut ctx.accounts.buyer;

        let buyer_key = buyer.key();

        require!(
            raffle_account.participants.len() < 32,
            RaffleError::RaffleFull
        );
        // Basic validations
        require!(
            raffle_account.status == RaffleStatus::Active,
            RaffleError::RaffleNotActive
        );
        require!(num_tickets > 0, RaffleError::InvalidTicketCount);
        if raffle_account.deadline > clock {
            raffle_account.status = RaffleStatus::Ended;
            require!(raffle_account.deadline > clock, RaffleError::DeadlinePassed);
        }
        
        require!(
            raffle_account.is_sold_out == false,
            RaffleError::TicketsAlreadySold
        );

        let new_total_entries = raffle_account
            .total_entries
            .checked_add(num_tickets as u64)
            .ok_or(RaffleError::Overflow)?;
        require!(
            new_total_entries <= raffle_account.max_tickets as u64,
            RaffleError::MaxTicketsReached
        );
        msg!(
            "Current entries: {}, Buying: {}, New total: {}, Max: {}",
            raffle_account.total_entries,
            num_tickets,
            new_total_entries,
            raffle_account.max_tickets
        );

        // Calculate total price
        let total_price = (num_tickets as u64)
            .checked_mul(raffle_account.ticket_price)
            .ok_or(RaffleError::Overflow)?;

        // Transfer tokens to escrow
        let cpi_accounts = Transfer {
            from: ctx.accounts.buyer_token_accont.to_account_info(),
            to: escrow_account.to_account_info(),
            authority: buyer.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, total_price)?;

        // Update total collected
        raffle_account.total_collected = raffle_account
            .total_collected
            .checked_add(total_price)
            .ok_or(RaffleError::Overflow)?;

        // Add participants (each ticket = one entry)
        if !raffle_account.participants.contains(&buyer_key) {
            require!(
                raffle_account.participants.len() < 32,
                RaffleError::RaffleFull
            );
            raffle_account.participants.push(buyer_key);
        }
        // FIX: Increment total_entries by num_tickets, not by 1
        raffle_account.total_entries = new_total_entries;

         // Check if sold out based on TOTAL_ENTRIES
        let max_tickets = raffle_account.max_tickets;
        if raffle_account.total_entries >= max_tickets as u64 {
            raffle_account.is_sold_out = true;
        }
        // Calculate progress
        let progress = RaffleAccount::calculate_progress(
            new_total_entries, // ← No reference, just value
            max_tickets,
        )?;
        raffle_account.progress = progress;

        // Emit event
        emit!(TicketsBought {
            buyer: buyer_key,
            raffle: raffle_account.key(),
            number_of_tickets_bought: num_tickets,
            total_tickets_now: raffle_account.total_entries,
            total_participants_now: raffle_account.participants.len() as u32
        });

        Ok(())
    }
    pub fn draw_winner(ctx: Context<DrawWinner>) -> Result<()> {
        let raffle_account = &mut ctx.accounts.raffle_account;
       let time_stamp = get_unix_timestamp();
        
        require!(
            time_stamp > raffle_account.deadline as u64,
            RaffleError::DeadlineNotReached
        );
        require!(!raffle_account.claimed, RaffleError::AlreadyClaimed);
        let randomness_data =
            PullFeedAccountData::parse(ctx.accounts.randomness_account_data.try_borrow_data()?)
                .map_err(|_| RaffleError::InvalidRandomnessAccount)?;

        let staleness_time = time_stamp - randomness_data.last_update_timestamp as u64;
        require!(staleness_time < 60, RaffleError::RandomnessTooOld);
        
        let value = randomness_data.result.value;
        let random_bytes = value.to_le_bytes();
        let mut bytes_array = [0u8; 8];
        bytes_array.copy_from_slice(&random_bytes[0..8]);
        let random_number = u64::from_ne_bytes(bytes_array);

        let num_participants = raffle_account.participants.len();
        let winner_index = (random_number as usize) % num_participants;
        let winner = raffle_account.participants[winner_index];

        raffle_account.winner = Some(winner);
        raffle_account.claimed = true;
        raffle_account.product_delivered_status = types::DeliveryStatus::Pending;
        // we are not moving assets till the product not delivered to the winner!
        raffle_account.randomness_account = Some(ctx.accounts.randomness_account_data.key());
        msg!("Winner selected successfully:{}", winner);
        Ok(())
    }
    pub fn mark_shipped(ctx: Context<MarkShipped>, tracking_info: Option<String>) -> Result<()> {
        let raffle_account = &mut ctx.accounts.raffle_account;
        let clock = Clock::get()?.unix_timestamp;
        raffle_account.tracking_info = tracking_info;
        raffle_account.product_delivered_status = types::DeliveryStatus::Shipped;
        raffle_account.shipped_at = Some(Clock::get()?.unix_timestamp);

        raffle_account.despute_deadline = Some(clock + (30 * 24 * 60 * 60));
        emit!(ProductShipped {
            raffle: raffle_account.key(),
            winner: raffle_account.winner.unwrap(),
            shipped_at: Some(clock),
        });

        Ok(())
    }

    pub fn mark_delivered(
        ctx: Context<MarkDelivered>,
        tracking_info: Option<String>,
    ) -> Result<()> {
        let raffle = &mut ctx.accounts.raffle_account;
        let clock = Clock::get()?.unix_timestamp;
        raffle.tracking_info = tracking_info;
        raffle.product_delivered_status = types::DeliveryStatus::Delivered;
        emit!(ProductDelivered {
            raffle: raffle.key(),
            winner: raffle.winner.unwrap(),
            delivered_at: Some(clock),
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

    #[account(
        mut,
        seeds = [b"global-counter"],
        bump
    )]
    pub counter: Account<'info, Counter>,
    /// Payment token mint (USDC, SOL wrapped, etc.)
    pub payment_mint: Account<'info, token::Mint>,

    /// Seller's token account
    #[account(
        mut,
        constraint = seller_token_account.mint == payment_mint.key(),
        constraint = seller_token_account.owner == seller.key(),
    )]
    pub seller_token_account: Account<'info, token::TokenAccount>,

    /// Raffle PDA
    #[account(
        init,
        payer = seller,
        space = 8 + RaffleAccount::INIT_SPACE,
        seeds = [
            b"raffle",
            seller.key().as_ref(),
            &counter.counter.to_le_bytes()
        ],
        bump
    )]
    pub raffle_account: Account<'info, RaffleAccount>,

    /// Escrow token account - THE FIX IS HERE
    /// Must be initialized AFTER raffle_account exists
    #[account(
        init,
        payer = seller,
        seeds = [b"escrow_payment",seller.key().as_ref(), &counter.counter.to_le_bytes()],
        bump,
        token::mint = payment_mint,
        token::authority = raffle_account,
    )]
    pub escrow_payment_account: Account<'info, token::TokenAccount>,

    /// Programs
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct BuyTickets<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(mut)]
    pub buyer_token_accont: Account<'info, token::TokenAccount>,

    #[account(
        mut,
        constraint = raffle_account.participants.len() < 32 @ RaffleError::RaffleFull
    )]
    pub raffle_account: Account<'info, RaffleAccount>,

    #[account(
        mut,
        seeds = [b"escrow_payment",raffle_account.seller.key().as_ref(),&raffle_account.raffle_id.to_le_bytes()],
        bump
    )]
    pub escrow_payment_account: Account<'info, token::TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DrawWinner<'info> {
    /// CHECK:  switchboard randomness account
    pub randomness_account_data: AccountInfo<'info>,

    #[account(
        mut,
        seeds=[b"raffle",
        raffle_account.seller.key().as_ref(),
        &raffle_account.raffle_id.to_le_bytes()
        ],
        bump = raffle_account.bump,
        constraint = raffle_account.status == RaffleStatus::Active @ RaffleError::RaffleNotActive,
        constraint = raffle_account.participants.len() > 0 @ RaffleError::NoParticipants,
    )]
    pub raffle_account: Account<'info, RaffleAccount>,

    #[account(
        mut,
        seeds = [b"global-counter"],
        bump
    )]
    pub counter: Account<'info, Counter>,

    #[account(
        mut,
        seeds = [b"escrow_payment",raffle_account.seller.key().as_ref(),&raffle_account.raffle_id.to_le_bytes()],
        bump
    )]
    pub escrow_payment_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub keeper: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MarkShipped<'info> {
    #[account(mut)]
    pub seller: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds=[b"raffle_account",
        raffle_account.seller.key().as_ref(),
        &counter.counter.to_le_bytes()
        ],
        bump = raffle_account.bump
    )]
    pub raffle_account: Account<'info, RaffleAccount>,

    #[account(
        mut,
        seeds = [b"global-counter"],
        bump
    )]
    pub counter: Account<'info, Counter>,
}

#[derive(Accounts)]
pub struct MarkDelivered<'info> {
    #[account(mut)]
    pub buyer: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds=[b"raffle_account",
        raffle_account.seller.key().as_ref(),
        &counter.counter.to_le_bytes()
        ],
        bump = raffle_account.bump
    )]
    pub raffle_account: Account<'info, RaffleAccount>,

    #[account(
        mut,
        seeds = [b"global-counter"],
        bump
    )]
    pub counter: Account<'info, Counter>,
}

#[derive(Accounts)]
pub struct InitializeCounter<'info> {
    #[account(
        init,
        payer = signer,
        space = 8 + types::Counter::INIT_SPACE,
        seeds = [b"global-counter"],
        bump
    )]
    pub counter: Account<'info, types::Counter>,
    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}
