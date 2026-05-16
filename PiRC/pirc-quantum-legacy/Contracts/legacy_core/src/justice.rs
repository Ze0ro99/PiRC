use soroban_sdk::{contracttype, Address, Map};

#[contracttype]
pub struct Heir {
    pub account: Address,
    pub share_percentage: u32,
}

#[contracttype]
pub struct LegacyVault {
    pub owner: Address,
    pub last_activity_ledger: u32,
    pub threshold_ledgers: u32,
    pub heirs: Map<Address, u32>,
    pub is_active: bool,
}

pub fn calculate_justice_shares(total_balance: i128, share_percentage: u32) -> i128 {
    (total_balance * (share_percentage as i128)) / 10000
}
