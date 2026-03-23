// contracts/adaptive_gate.rs
use soroban_sdk::{contract, contractimpl, Address, Env, Symbol};

#[contract]
pub struct AdaptiveUtilityGate;

#[contractimpl]
impl AdaptiveUtilityGate {
    pub fn get_multiplier(env: Env, engagement_score: u32) -> u32 {
        if engagement_score >= 5000 {
            314 // 3.14x multiplier for active pioneers (Design 2)
        } else {
            100 // 1.0x base
        }
    }
}
