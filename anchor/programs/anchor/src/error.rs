use anchor_lang::prelude::*;

#[error_code]
pub enum RaffleError {
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
    #[msg("Unauthorise request!")]
    Unauthorized,
    #[msg("Invalid randomness account data!")]
    InvalidRandomnessAccount,
    #[msg("Random data too old!")]
    RandomnessTooOld,
    #[msg("Entries full! You missed the opportunity!")]
    EnrtiesFull,
    #[msg("Arithmetic under flow")]
    UnderFlow,
    #[msg("Participants full!")]
    RaffleFull,
    #[msg("Randomness expired!")]
    RandomnessExpired,
    #[msg("Randomness already expired!")]
    RandomnessAlreadyRevealed,
    #[msg("Invalid Raffle state!")]
    InvalidRaffleState,
    #[msg("Randomness not resolved!")]
    RandomnessNotResolved,
    #[msg("Winner already selected!")]
    WinnerAlreadySelected
}