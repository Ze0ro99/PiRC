use soroban_sdk::{contract, Env, String, Bytes};
#[contract]
pub struct RWAAuthenticationInterface;
pub trait VerificationInterface {
    fn verify_rwa(env: Env, pid: String, signature: Bytes) -> bool;
}
