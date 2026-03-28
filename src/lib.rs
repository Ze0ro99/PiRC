#![no_std]

use soroban_sdk::{contract, contractimpl, Env, Symbol};

#[contract]
pub struct RwaVerify;

#[contractimpl]
impl RwaVerify {
    pub fn hello(env: Env) -> Symbol {
        Symbol::short("RWA_OK")
    }
}
