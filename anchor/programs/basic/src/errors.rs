use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid price")]
    InvalidPrice,
    #[msg("Invalid ticket count")]
    InvalidTicketCount,
    #[msg("Invalid deadline")]
    InvalidDeadline,
    #[msg("Raffle not active")]
    RaffleNotActive,
    #[msg("Deadline passed")]
    DeadlinePassed,
    #[msg("Max tickets reached")]
    MaxTicketsReached,
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Cannot draw yet")]
    CannotDrawYet,
    #[msg("Min tickets not reached")]
    MinTicketsNotReached,
    #[msg("Invalid status")]
    InvalidStatus,
    #[msg("No participants")]
    NoParticipants,
    #[msg("Raffle not completed")]
    RaffleNotCompleted,
    #[msg("Not winner")]
    NotWinner,
    #[msg("Already claimed")]
    AlreadyClaimed,
    #[msg("Not seller")]
    NotSeller,
    #[msg("Tickets already sold")]
    TicketsAlreadySold,
    #[msg("Deadline not reached")]
    DeadlineNotReached,
    #[msg("Min tickets reached")]
    MinTicketsReached,
}