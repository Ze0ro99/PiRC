#![no_std]
#![forbid(unsafe_code)]

use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Env, Map, Symbol, String, Vec, vec,
    U256,
};

#[derive(Clone)]
#[contracttype]
pub enum ChainConfig {
    Ethereum { contract_addr: String, chain_id: u32 },
    Polygon { contract_addr: String, chain_id: u32 },
    Avalanche { contract_addr: String, chain_id: u32 },
    Cosmos { contract_addr: String, chain_id: String },
}

#[derive(Clone)]
#[contracttype]
pub struct BridgeReceipt {
    pub sequence: u64,
    pub amount: i128,
    pub fee: i128,
    pub target_chain: String,
    pub recipient: String,
    pub timestamp: u64,
    pub vaa_hash: String,
}

#[derive(Clone)]
#[contracttype]
pub struct VerifiedActionApproval {
    pub sequence: u64,
    pub payload: Vec<u8>,
    pub signatures: Vec<Vec<u8>>,
    pub guardian_set_index: u32,
}

#[contract]
pub struct CrossChainBridge;

#[contractimpl]
impl CrossChainBridge {
    /// Initialize bridge with supported chains
    pub fn init(
        env: Env,
        admin: Address,
        bridge_fee_bps: u32,
    ) -> Result<(), String> {
        admin.require_auth();

        let storage = env.storage().persistent();
        storage.set(&Symbol::new(&env, "admin"), &admin);
        storage.set(&Symbol::new(&env, "bridge_fee_bps"), &bridge_fee_bps);
        storage.set(&Symbol::new(&env, "locked_pi_vault"), &0i128);
        storage.set(&Symbol::new(&env, "sequence"), &0u64);

        // Register Wormhole configuration
        let wormhole_config = vec![
            &env,
            String::from_slice(&env, "guardian_set_index"),
            String::from_slice(&env, "1"),
        ];
        storage.set(&Symbol::new(&env, "wormhole_config"), &wormhole_config);

        Ok(())
    }

    /// Bridge tokens OUT (Pi -> Wrapped on target chain)
    pub fn bridge_out(
        env: Env,
        amount: i128,
        target_chain: String,
        recipient_addr: String,
        sender: Address,
    ) -> Result<BridgeReceipt, String> {
        sender.require_auth();

        if amount <= 0 {
            return Err("Amount must be positive".to_string());
        }

        let storage = env.storage().persistent();
        let bridge_fee_bps: u32 = storage
            .get(&Symbol::new(&env, "bridge_fee_bps"))
            .ok_or("Not initialized".to_string())?
            .unwrap();

        // Calculate fee
        let fee = (amount as u128 * bridge_fee_bps as u128 / 10000) as i128;
        let net_amount = amount - fee;

        if net_amount <= 0 {
            return Err("Amount after fee must be positive".to_string());
        }

        // Increment sequence
        let sequence: u64 = storage
            .get(&Symbol::new(&env, "sequence"))
            .unwrap_or(Ok(0u64))
            .unwrap_or(0);

        let new_sequence = sequence + 1;
        storage.set(&Symbol::new(&env, "sequence"), &new_sequence);

        // Lock Pi in vault
        let mut vault: i128 = storage
            .get(&Symbol::new(&env, "locked_pi_vault"))
            .unwrap_or(Ok(0i128))
            .unwrap_or(0);
        vault += amount;
        storage.set(&Symbol::new(&env, "locked_pi_vault"), &vault);

        // Store bridge-out event for VAA
        let bridge_event_key = Symbol::new(&env, &format!("bridge_out_{}", sequence));
        let receipt = BridgeReceipt {
            sequence,
            amount: net_amount,
            fee,
            target_chain: target_chain.clone(),
            recipient: recipient_addr.clone(),
            timestamp: env.ledger().timestamp(),
            vaa_hash: format!("vaa_{}_{}", sequence, env.ledger().timestamp()),
        };

        storage.set(&bridge_event_key, &receipt.clone());

        // Emit Wormhole event
        env.events().publish(
            (Symbol::new(&env, "bridge_out"), &sequence),
            (&sender, &target_chain, &recipient_addr, amount, fee),
        );

        Ok(receipt)
    }

    /// Bridge tokens IN (Wrapped -> Pi via VAA)
    pub fn bridge_in(
        env: Env,
        vaa: VerifiedActionApproval,
        recipient: Address,
    ) -> Result<i128, String> {
        recipient.require_auth();

        let storage = env.storage().persistent();

        // Verify VAA signature (simplified - in production use Wormhole contract)
        // Check guardian set and verify threshold of signatures
        if vaa.signatures.len() < 6 {
            return Err("Insufficient VAA signatures".to_string());
        }

        // Check for double-spend
        let vaa_processed_key = Symbol::new(&env, &format!("vaa_processed_{}", vaa.sequence));
        if storage.get(&vaa_processed_key).is_some() {
            return Err("VAA already processed".to_string());
        }

        // Mark VAA as processed
        storage.set(&vaa_processed_key, &true);

        // Extract amount from VAA payload (simplified parsing)
        let amount = 1000000i128; // Placeholder - parse from VAA payload

        // Release Pi from vault
        let mut vault: i128 = storage
            .get(&Symbol::new(&env, "locked_pi_vault"))
            .unwrap_or(Ok(0i128))
            .unwrap_or(0);

        if vault < amount {
            return Err("Insufficient collateral in vault".to_string());
        }

        vault -= amount;
        storage.set(&Symbol::new(&env, "locked_pi_vault"), &vault);

        // Mint Pi to recipient (via token contract)
        env.events().publish(
            (Symbol::new(&env, "bridge_in"), &vaa.sequence),
            (&recipient, amount),
        );

        Ok(amount)
    }

    /// Register supported chain
    pub fn register_chain(
        env: Env,
        chain_name: String,
        config: ChainConfig,
        admin: Address,
    ) -> Result<(), String> {
        admin.require_auth();

        let storage = env.storage().persistent();
        let chain_key = Symbol::new(&env, &format!("chain_{}", &chain_name));

        // Validate chain config
        match &config {
            ChainConfig::Ethereum { chain_id, .. } | 
            ChainConfig::Polygon { chain_id, .. } | 
            ChainConfig::Avalanche { chain_id, .. } => {
                if *chain_id == 0 {
                    return Err("Invalid chain ID".to_string());
                }
            }
            ChainConfig::Cosmos { .. } => {}
        }

        storage.set(&chain_key, &config);
        env.events().publish(
            (Symbol::new(&env, "chain_registered"), &chain_name),
            (),
        );

        Ok(())
    }

    /// Get bridge statistics
    pub fn get_stats(env: Env) -> Result<(i128, u64), String> {
        let storage = env.storage().persistent();
        
        let vault = storage
            .get(&Symbol::new(&env, "locked_pi_vault"))
            .unwrap_or(Ok(0i128))
            .unwrap_or(0);
        
        let sequence = storage
            .get(&Symbol::new(&env, "sequence"))
            .unwrap_or(Ok(0u64))
            .unwrap_or(0);

        Ok((vault, sequence))
    }

    /// Get bridge receipt
    pub fn get_receipt(
        env: Env,
        sequence: u64,
    ) -> Result<BridgeReceipt, String> {
        let storage = env.storage().persistent();
        let key = Symbol::new(&env, &format!("bridge_out_{}", sequence));

        storage
            .get(&key)
            .ok_or("Receipt not found".to_string())?
            .ok_or("Receipt not found".to_string())
    }
}
