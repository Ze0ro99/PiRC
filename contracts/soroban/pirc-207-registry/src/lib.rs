#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, Vec, symbol_short};

#[contract]
pub struct Pirc207Registry;

#[contractimpl]
impl Pirc207Registry {
    /// Initializes the registry with admin and the 7 layer token addresses.
    pub fn initialize(env: Env, admin: Address, token_contracts: Vec<Address>) {
        if env.storage().instance().has(&symbol_short!("admin")) {
            panic!("Registry already initialized");
        }
        
        // Ensure exactly 7 tokens are stored for parity compliance
        if token_contracts.len() != 7 {
            panic!("PiRC-207 requires exactly 7 tokens");
        }

        env.storage().instance().set(&symbol_short!("admin"), &admin);
        env.storage().instance().set(&symbol_short!("tokens"), &token_contracts);
    }

    /// Returns the address for a specific layer (0-6)
    pub fn get_layer_metadata(env: Env, layer_id: u32) -> Address {
        let tokens: Vec<Address> = env.storage().instance().get(&symbol_short!("tokens")).unwrap();
        tokens.get(layer_id).expect("Layer ID out of range (0-6)")
    }
}
