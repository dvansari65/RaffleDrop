use anchor_lang::prelude::{Clock, SolanaSysvar};

pub fn get_unix_timestamp() -> i64 {
    Clock::get().unwrap().unix_timestamp
}