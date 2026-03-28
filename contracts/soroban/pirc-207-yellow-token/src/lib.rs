#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, String, symbol_short, log};

#[contract]
pub struct Yellow31141Token;

#[contractimpl]
impl Yellow31141Token {
    pub fn initialize(env: Env, admin: Address) {
        admin.require_auth();
        env.storage().instance().set(&symbol_short!("admin"), &admin);
        log!(&env, "PiRC-207 π-YELLOW Layer Activated");
    }
    pub fn name(env: Env) -> String { String::from_slice(&env, "Yellow31141 Pi Layer") }
    pub fn symbol(env: Env) -> String { String::from_slice(&env, "π-YELLOW") }
    pub fn decimals(env: Env) -> u32 { 8 }
}