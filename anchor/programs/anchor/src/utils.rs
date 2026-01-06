// utility function to update raffle fields

use crate::{error::RaffleError, types::RaffleAccount};

impl RaffleAccount {
    pub fn calculate_progress (&mut self,entries:&u64,max_tickets:&u32)->Result< u32 ,RaffleError>{
        if *max_tickets == 0 {
            return Ok(0);
        }
        if self.total_entries >= *entries {
            return Ok(100 as u32);
        }
        let percentage = entries.
                            checked_mul(100)
                            .ok_or(RaffleError::Overflow)?;
        let progress = percentage
                            .checked_div(percentage)
                            .ok_or(RaffleError::UnderFlow)?;
        
        Ok(progress as u32)
    }
}