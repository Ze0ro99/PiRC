#![no_std]
#![forbid(unsafe_code)]

use soroban_sdk::{contract, contractimpl, Symbol, Env, Address};
use std::time::SystemTime;

#[contract]
pub struct CircuitBreaker;

#[contractimpl]
impl CircuitBreaker {
    /// Activate circuit breaker (called by anomaly detector)
    pub fn activate(
        env: Env,
        reason: Symbol,
        duration_seconds: u64,
    ) -> Result<(), String> {
        let storage = env.storage().persistent();
        let current_time = env.ledger().timestamp();
        
        // Set breaker active flag
        storage.set(&Symbol::new(&env, "breaker_active"), &true);
        storage.set(&Symbol::new(&env, "breaker_reason"), &reason);
        storage.set(&Symbol::new(&env, "activated_at"), &current_time);
        storage.set(&Symbol::new(&env, "duration"), &duration_seconds);
        
        // Pause all settlement operations
        storage.set(&Symbol::new(&env, "settlement_paused"), &true);
        storage.set(&Symbol::new(&env, "minting_paused"), &true);
        
        // Emit event
        env.events().publish(
            (Symbol::new(&env, "circuit_breaker_activated"), reason),
            (current_time, duration_seconds),
        );
        
        Ok(())
    }
    
    /// Check if breaker should auto-recover
    pub fn check_recovery(env: Env) -> Result<bool, String> {
        let storage = env.storage().persistent();
        
        let is_active = storage
            .get(&Symbol::new(&env, "breaker_active"))
            .unwrap_or(Ok(false))
            .unwrap_or(false);
        
        if !is_active {
            return Ok(false);
        }
        
        let activated_at: u64 = storage
            .get(&Symbol::new(&env, "activated_at"))
            .unwrap_or(Ok(0u64))
            .unwrap_or(0);
        
        let duration: u64 = storage
            .get(&Symbol::new(&env, "duration"))
            .unwrap_or(Ok(21600u64))  // 6 hour default
            .unwrap_or(21600);
        
        let current_time = env.ledger().timestamp();
        let elapsed = current_time - activated_at;
        
        if elapsed >= duration {
            // Auto-recover
            storage.set(&Symbol::new(&env, "breaker_active"), &false);
            storage.set(&Symbol::new(&env, "settlement_paused"), &false);
            storage.set(&Symbol::new(&env, "minting_paused"), &false);
            
            env.events().publish(
                (Symbol::new(&env, "circuit_breaker_recovered"), elapsed),
                (current_time, duration),
            );
            
            return Ok(true);
        }
        
        Ok(false)
    }
    
    /// Get circuit breaker status
    pub fn status(env: Env) -> Result<(bool, u64), String> {
        let storage = env.storage().persistent();
        
        let is_active = storage
            .get(&Symbol::new(&env, "breaker_active"))
            .unwrap_or(Ok(false))
            .unwrap_or(false);
        
        let activated_at: u64 = storage
            .get(&Symbol::new(&env, "activated_at"))
            .unwrap_or(Ok(0u64))
            .unwrap_or(0);
        
        let duration: u64 = storage
            .get(&Symbol::new(&env, "duration"))
            .unwrap_or(Ok(21600u64))
            .unwrap_or(21600);
        
        let current_time = env.ledger().timestamp();
        let remaining = if is_active {
            let elapsed = current_time - activated_at;
            if elapsed < duration { duration - elapsed } else { 0 }
        } else {
            0
        };
        
        Ok((is_active, remaining))
    }
}
