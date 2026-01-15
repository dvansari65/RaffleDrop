
use std::time::{SystemTime,UNIX_EPOCH};

pub fn get_unix_timestamp ()-> u64 {
    let duration_since_epoch = SystemTime::now()
                        .duration_since(UNIX_EPOCH)
                        .expect("Time goes backword!");
    return duration_since_epoch.as_millis() as u64;
}