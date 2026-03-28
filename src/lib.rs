#![no_std]

use soroban_sdk::{
    contract, contractimpl, Env, BytesN, Bytes
};

#[contract]
pub struct RWAVerifier;

#[contractimpl]
impl RWAVerifier {

    pub fn verify(
        env: Env,
        pid: BytesN<32>,
        issuer_pubkey: BytesN<32>,
        signature: Bytes,
        chip_uid: Bytes
    ) -> (bool, u32) {

        // Gabungkan pid + chip_uid
        let mut payload = pid.to_array().to_vec();
        payload.extend(chip_uid.to_vec());

        let payload_bytes = Bytes::from_slice(&env, &payload);

        // Verifikasi signature (Ed25519)
        let valid = env.crypto().ed25519_verify(
            &issuer_pubkey,
            &payload_bytes,
            &signature
        );

        let score = if valid { 98 } else { 0 };

        (valid, score)
    }
}
