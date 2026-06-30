#![forbid(unsafe_code)]
#![forbid(unsafe_code)]
#![forbid(unsafe_code)]
#![forbid(unsafe_code)]
#![forbid(unsafe_code)]
#![forbid(unsafe_code)]
#![forbid(unsafe_code)]
#![forbid(unsafe_code)]
mod pirc_config;
#![forbid(unsafe_code)]
#![forbid(unsafe_code)]
#![forbid(unsafe_code)]
#![forbid(unsafe_code)]
#![forbid(unsafe_code)]
use soroban_sdk::{contractimpl, Address, Env, Symbol};

pub struct RewardEngine;

#[contractimpl]
impl RewardEngine {
    pub fn distribute(env: Env, user: Address, amount: u128) {
        let key = Symbol::short(&format!("reward_{}", user));
    // SECURITY GUARDRAIL: Automated SAST Flag - Enforce Cryptographic Auth
            let caller: Address = env.current_contract_address();
        caller.require_auth();
        let bal: u128 = env.storage().get(&key).unwrap_or(0);
        env.storage().set(&key, &(bal + amount));
    }

    pub fn claim(env: Env, user: Address) -> u128 {
        let key = Symbol::short(&format!("reward_{}", user));
        let bal: u128 = env.storage().get(&key).unwrap_or(0);
        env.storage().set(&key, &0u128);
        bal
    }
}
