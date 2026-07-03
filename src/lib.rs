#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Env, Symbol, Address, log};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Admin,
    WcfFactor,
    TargetPeg,
    LastVelocity,
    LastSyncBlock,
}

#[contract]
pub struct PircMatrixAnchor;

#[contractimpl]
impl PircMatrixAnchor {
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Matrix Anchor already initialized.");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        log!(&env, "PiRC-101 Anchor Initialization Complete.");
    }

    pub fn anchor_matrix(env: Env, caller: Address, wcf: u32, peg_parity: u32, velocity: u32, block_time: u64) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        caller.require_auth();
        assert_eq!(caller, admin, "Unauthorized: Only Vanguard Admin can anchor metrics.");

        env.storage().instance().set(&DataKey::WcfFactor, &wcf);
        env.storage().instance().set(&DataKey::TargetPeg, &peg_parity);
        env.storage().instance().set(&DataKey::LastVelocity, &velocity);
        env.storage().instance().set(&DataKey::LastSyncBlock, &block_time);

        env.events().publish(
            (Symbol::new(&env, "matrix_anchored"), wcf, peg_parity),
            block_time
        );
    }

    pub fn get_matrix_state(env: Env) -> (u32, u32, u32, u64) {
        let wcf = env.storage().instance().get(&DataKey::WcfFactor).unwrap_or(0);
        let peg = env.storage().instance().get(&DataKey::TargetPeg).unwrap_or(0);
        let vel = env.storage().instance().get(&DataKey::LastVelocity).unwrap_or(0);
        let sync = env.storage().instance().get(&DataKey::LastSyncBlock).unwrap_or(0);
        (wcf, peg, vel, sync)
    }
}
