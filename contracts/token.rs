#![no_std]

use soroban_sdk::{contract, contractimpl, Address, Env};

#[contract]
pub struct TokenContract;

#[contractimpl]
impl TokenContract {

    // 📌 Mint Token
    pub fn mint(env: Env, to: Address, amount: i128) {
        // 🔐 Basic validation
        if amount <= 0 {
            panic!("Invalid amount");
        }

        // Simulated storage (extend with real storage later)
        let key = (to.clone(), "balance");
        let balance: i128 = env.storage().instance().get(&key).unwrap_or(0);

        env.storage().instance().set(&key, &(balance + amount));
    }

    // 📌 Transfer Token
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        if amount <= 0 {
            panic!("Invalid amount");
        }

        let from_key = (from.clone(), "balance");
        let to_key = (to.clone(), "balance");

        let from_balance: i128 = env.storage().instance().get(&from_key).unwrap_or(0);

        if from_balance < amount {
            panic!("Insufficient balance");
        }

        let to_balance: i128 = env.storage().instance().get(&to_key).unwrap_or(0);

        env.storage().instance().set(&from_key, &(from_balance - amount));
        env.storage().instance().set(&to_key, &(to_balance + amount));
    }
}
