#![no_std]

use soroban_sdk::{contractimpl, Env, Bytes, BytesN};

pub struct RwaVerify;

#[contractimpl]
impl RwaVerify {
    pub fn verify(
        env: Env,
        pid: BytesN<32>,
        issuer_pubkey: BytesN<32>,
        signature: Bytes,
    ) -> bool {
        env.crypto().ed25519_verify(
            &issuer_pubkey,
            &pid.into(),
            &signature,
        )
    }
}
