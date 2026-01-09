// utility function to update raffle fields

use crate::{error::RaffleError, types::RaffleAccount};
impl RaffleAccount {
    pub fn calculate_progress(entries: u64, max_tickets: u32) -> Result<u32, RaffleError> {
        if max_tickets == 0 {
            return Ok(0);
        }
        
        if entries >= max_tickets as u64 {
            return Ok(100);
        }
        
        let percentage = entries
            .checked_mul(100)
            .ok_or(RaffleError::Overflow)?;
        
        let progress = percentage
            .checked_div(max_tickets as u64)
            .ok_or(RaffleError::UnderFlow)?;
        
        Ok(progress as u32)
    }
}