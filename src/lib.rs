#![no_std]

use soroban_sdk::{contract, contractimpl, Env, BytesN};

#[contract]
pub struct RwaVerify;

#[contractimpl]
impl RwaVerify {
    pub fn verify(
        env: Env,
        pid: BytesN<32>,
        issuer_pubkey: BytesN<32>,
        signature: BytesN<64>,
    ) -> bool {

        env.crypto().ed25519_verify(
            &issuer_pubkey,
            &pid,
            &signature,
        )
    }
}
