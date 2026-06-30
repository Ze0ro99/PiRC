#![no_std]
use soroban_sdk::{contract, contractimpl, Env};

#[contract]
pub struct RwaVerify;

#[contractimpl]
impl RwaVerify {
    pub fn calculate_wcf(_env: Env, balance: i128, lock_time: u64) -> i128 {
        if lock_time == 0 { return balance; }
        balance + (balance * (lock_time as i128) / 100)
    }

    pub fn apply_qwf(_env: Env, amount: i128) -> i128 {
        (amount * 2248) / 10000
    }
}
