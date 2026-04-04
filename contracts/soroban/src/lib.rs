#![no_std]

use soroban_sdk::contract;

pub mod did_registry;
pub mod vc_verifier;

/// Re-export contracts for easy deployment
pub use did_registry::PiRC209DIDRegistry;
pub use vc_verifier::PiRC209VCVerifier;
