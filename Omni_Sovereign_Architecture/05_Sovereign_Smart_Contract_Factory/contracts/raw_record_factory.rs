#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, String, Map};

#[contract]
pub struct RawRecordFactory;

#[contractimpl]
impl RawRecordFactory {
    pub fn register_and_deploy(env: Env, product_id: String, metadata: Map<String, String>, owner: Address) -> String {
        env.events().publish(
            (symbol_short!("FACTORY"), symbol_short!("DEPLOYED")),
            (product_id.clone(), owner, metadata)
        );
        product_id
    }
}
