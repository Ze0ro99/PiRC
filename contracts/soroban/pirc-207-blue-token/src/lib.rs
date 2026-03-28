#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, String, symbol_short, log};

#[contract]
pub struct Blue314Token;

#[contractimpl]
impl Blue314Token {
    pub fn initialize(env: Env, admin: Address) {
        admin.require_auth();
        env.storage().instance().set(&symbol_short!("admin"), &admin);
        log!(&env, "PiRC-207 π-BLUE Layer Activated");
    }
    pub fn name(env: Env) -> String { String::from_slice(&env, "Blue314 Pi Layer") }
    pub fn symbol(env: Env) -> String { String::from_slice(&env, "π-BLUE") }
    pub fn decimals(env: Env) -> u32 { 8 }
}