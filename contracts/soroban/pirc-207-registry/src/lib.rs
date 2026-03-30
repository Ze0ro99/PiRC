#![no_std]
use soroban_sdk::{
    contract, 
    contractimpl, 
    contracttype, 
    Address, 
    Env, 
    Vec, 
    symbol_short, 
    String, 
    panic_with_error, 
    IntoVal // <--- REQUIRED for .into_val(&env) to work
};

#[contracttype]
pub enum DataKey {
    Admin,
    Tokens,                // Vec<Address> of the 7 layers
    Issuer(u32),           // Layer ID -> Authorized Issuer
    RwaBinding(u32, u128), // Layer ID + Token ID -> RWA Hash
    LayerParity(u32),      // Layer ID -> Math Value (e.g., 314159)
}

#[contract]
pub struct Pirc207Registry;

#[contractimpl]
impl Pirc207Registry {
    /// 1. Initialize the Registry (Phase 2.1)
    pub fn initialize(env: Env, admin: Address, token_contracts: Vec<Address>) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Registry already initialized");
        }
        if token_contracts.len() != 7 {
            panic!("PiRC-207 requires exactly 7 layers");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Tokens, &token_contracts);

        // Set default Parity for Gold (Layer 1) as per spec
        env.storage().instance().set(&DataKey::LayerParity(1), &314159u32);
    }

    /// 2. Register Authorized Issuer (Admin Only)
    pub fn register_issuer(env: Env, layer_id: u32, issuer: Address) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        env.storage().instance().set(&DataKey::Issuer(layer_id), &issuer);
    }

    /// 3. Issue Tokens via Registry (Phase 2.2 Integration)
    /// This calls the mint() function on the specific token layer
    pub fn issue_tokens(env: Env, layer_id: u32, to: Address, amount: i128) {
        let issuer: Address = env.storage().instance().get(&DataKey::Issuer(layer_id)).expect("No authorized issuer");
        issuer.require_auth();

        let tokens: Vec<Address> = env.storage().instance().get(&DataKey::Tokens).unwrap();
        let token_address = tokens.get(layer_id).unwrap();

        // Cross-contract call to the specific layer's mint function
        // This will now compile successfully because IntoVal is in scope
        env.invoke_contract::<()>(
            &token_address,
            &symbol_short!("mint"),
            (to, amount).into_val(&env),
        );
    }

    /// 4. Bind Real World Asset Proof (Phase 2.3 RWA)
    /// Binds a unique hardware/NFC ID hash to a token ID
    pub fn bind_rwa(env: Env, layer_id: u32, token_id: u128, rwa_hash: String) {
        let issuer: Address = env.storage().instance().get(&DataKey::Issuer(layer_id)).unwrap();
        issuer.require_auth();
        
        env.storage().instance().set(&DataKey::RwaBinding(layer_id, token_id), &rwa_hash);
    }

    /// 5. Public Verification (Public Access)
    pub fn verify_rwa(env: Env, layer_id: u32, token_id: u128) -> String {
        env.storage().instance().get(&DataKey::RwaBinding(layer_id, token_id)).expect("RWA Binding not found")
    }

    /// 6. Get Layer Metadata (Public Access)
    pub fn get_layer_metadata(env: Env, layer_id: u32) -> Address {
        let tokens: Vec<Address> = env.storage().instance().get(&DataKey::Tokens).unwrap();
        tokens.get(layer_id).expect("Layer ID out of range")
    }

    /// 7. Update Parity / Mathematical Value (Admin Only)
    pub fn update_parity(env: Env, layer_id: u32, value: u32) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        env.storage().instance().set(&DataKey::LayerParity(layer_id), &value);
    }
}
