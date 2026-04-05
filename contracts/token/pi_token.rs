#![no_std]

use soroban_sdk::{contract, contractimpl, Address, Env};

#[contract]
pub struct Token;

#[contractimpl]
impl Token {

    pub fn mint(env: Env, to: Address, amount: i128) {
        if amount <= 0 {
            panic!("Invalid amount");
        }

        let key = (to.clone(), "bal");
        let bal: i128 = env.storage().instance().get(&key).unwrap_or(0);

        env.storage().instance().set(&key, &(bal + amount));
    }

    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        if amount <= 0 {
            panic!("Invalid amount");
        }

        let from_key = (from.clone(), "bal");
        let to_key = (to.clone(), "bal");

        let from_bal: i128 = env.storage().instance().get(&from_key).unwrap_or(0);

        if from_bal < amount {
            panic!("Insufficient");
        }

        let to_bal: i128 = env.storage().instance().get(&to_key).unwrap_or(0);

        env.storage().instance().set(&from_key, &(from_bal - amount));
        env.storage().instance().set(&to_key, &(to_bal + amount));
    }
}
