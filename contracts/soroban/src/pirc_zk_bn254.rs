// PiRC-225 / PiRC-226 — ZK Proof Reserve Verification (BN254 / Groth16)
// This contract handles on-chain commitment storage and event attestation
// for BN254 Groth16 zero-knowledge proofs used in:
//   - Reserve proof-of-solvency (PiRC-225)
//   - Cross-chain identity portability (PiRC-226)
//   - Gold/asset warehouse reserve verification
// Soroban SDK v27 — Pi Testnet / Stellar Testnet
#![no_std]
#![forbid(unsafe_code)]

use soroban_sdk::{
    contract, contractimpl, contractmeta, contracttype, symbol_short, Address, BytesN, Env, String,
};

contractmeta!(
    title    = "PiRC-225/226 BN254 Groth16 ZK Reserve Proof",
    version  = "2.0",
    description = "On-chain commitment store for BN254 zero-knowledge reserve proofs"
);

// ────────────────────────────────────────────────────────────────────────────
// BN254 proof structure
// A Groth16 proof over BN254 consists of:
//   π_A  (G1 point, 64 bytes → stored as two 32-byte chunks)
//   π_B  (G2 point, 128 bytes → stored as four 32-byte chunks)
//   π_C  (G1 point, 64 bytes → stored as two 32-byte chunks)
// We store a 32-byte Poseidon/Keccak commitment of the full proof for gas
// efficiency on Soroban, plus the 32-byte public inputs hash.
// ────────────────────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone)]
pub enum ZKProofType {
    ReserveProof,
    IdentityProof,
    WarehouseGoldProof,
    CrossChainPortability,
}

#[contracttype]
#[derive(Clone)]
pub struct BN254ProofCommitment {
    /// Submitter address (prover)
    pub prover: Address,
    /// 32-byte commitment of the full Groth16 proof (π_A ‖ π_B ‖ π_C hashed)
    pub proof_commitment: BytesN<32>,
    /// 32-byte hash of public inputs (statement being proved)
    pub public_inputs_hash: BytesN<32>,
    /// Verification key hash for this circuit (identifies which circuit)
    pub vk_hash: BytesN<32>,
    /// Proof type
    pub proof_type: ZKProofType,
    /// Ledger timestamp when submitted
    pub submitted_at: u64,
    /// Whether this proof has been attested as valid by the off-chain verifier
    pub is_verified: bool,
    /// Optional: asset amount referenced by the proof (for reserve proofs)
    pub asset_amount: i128,
}

#[contracttype]
#[derive(Clone)]
pub enum ZKKey {
    Proof(BytesN<32>),       // proof_commitment → BN254ProofCommitment
    ProverProofs(Address),   // prover → latest proof_commitment
    TotalProofs,
    TotalVerified,
}

#[contract]
pub struct PiRCZkBN254;

#[contractimpl]
impl PiRCZkBN254 {
    // ─── Submit ──────────────────────────────────────────────────────────────

    /// Submit a BN254 Groth16 proof commitment for on-chain storage.
    /// The prover supplies:
    ///   proof_commitment    – Poseidon/Keccak hash of (π_A ‖ π_B ‖ π_C)
    ///   public_inputs_hash  – hash of the public statement vector
    ///   vk_hash             – hash of the verification key (circuit identifier)
    ///   proof_type          – which sub-protocol this proof belongs to
    ///   asset_amount        – referenced asset value (0 if not a reserve proof)
    pub fn submit_proof(
        env: Env,
        prover: Address,
        proof_commitment: BytesN<32>,
        public_inputs_hash: BytesN<32>,
        vk_hash: BytesN<32>,
        proof_type: ZKProofType,
        asset_amount: i128,
    ) -> BytesN<32> {
        prover.require_auth();

        let commitment = BN254ProofCommitment {
            prover: prover.clone(),
            proof_commitment: proof_commitment.clone(),
            public_inputs_hash: public_inputs_hash.clone(),
            vk_hash: vk_hash.clone(),
            proof_type,
            submitted_at: env.ledger().timestamp(),
            is_verified: false,
            asset_amount,
        };

        env.storage()
            .persistent()
            .set(&ZKKey::Proof(proof_commitment.clone()), &commitment);

        env.storage()
            .persistent()
            .set(&ZKKey::ProverProofs(prover.clone()), &proof_commitment);

        let total: u64 = env.storage().instance().get(&ZKKey::TotalProofs).unwrap_or(0);
        env.storage().instance().set(&ZKKey::TotalProofs, &(total + 1));

        env.events().publish(
            (symbol_short!("ZKB254"), symbol_short!("SUBMIT")),
            (prover, proof_commitment.clone(), asset_amount),
        );

        proof_commitment
    }

    // ─── Attest ──────────────────────────────────────────────────────────────

    /// Attest that an off-chain BN254 verifier has confirmed this proof.
    /// Called by the designated attester (multi-sig governance in prod).
    pub fn attest_verified(
        env: Env,
        attester: Address,
        proof_commitment: BytesN<32>,
    ) -> bool {
        attester.require_auth();

        let key = ZKKey::Proof(proof_commitment.clone());
        let mut record: BN254ProofCommitment = match env.storage().persistent().get(&key) {
            Some(r) => r,
            None => return false,
        };

        if record.is_verified {
            return false; // Already attested
        }

        record.is_verified = true;
        env.storage().persistent().set(&key, &record);

        let verified: u64 = env.storage().instance().get(&ZKKey::TotalVerified).unwrap_or(0);
        env.storage().instance().set(&ZKKey::TotalVerified, &(verified + 1));

        env.events().publish(
            (symbol_short!("ZKB254"), symbol_short!("ATTESTED")),
            (attester, proof_commitment, record.asset_amount),
        );
        true
    }

    // ─── Query ───────────────────────────────────────────────────────────────

    pub fn get_proof(env: Env, proof_commitment: BytesN<32>) -> Option<BN254ProofCommitment> {
        env.storage().persistent().get(&ZKKey::Proof(proof_commitment))
    }

    pub fn get_latest_proof_by_prover(
        env: Env,
        prover: Address,
    ) -> Option<BN254ProofCommitment> {
        let latest_commitment: BytesN<32> = env
            .storage()
            .persistent()
            .get(&ZKKey::ProverProofs(prover))?;
        env.storage().persistent().get(&ZKKey::Proof(latest_commitment))
    }

    pub fn is_verified(env: Env, proof_commitment: BytesN<32>) -> bool {
        env.storage()
            .persistent()
            .get::<ZKKey, BN254ProofCommitment>(&ZKKey::Proof(proof_commitment))
            .map(|r| r.is_verified)
            .unwrap_or(false)
    }

    pub fn total_proofs(env: Env) -> u64 {
        env.storage().instance().get(&ZKKey::TotalProofs).unwrap_or(0)
    }

    pub fn total_verified(env: Env) -> u64 {
        env.storage().instance().get(&ZKKey::TotalVerified).unwrap_or(0)
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────
#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::Env;

    fn make_hash(env: &Env, seed: u8) -> BytesN<32> {
        BytesN::from_array(env, &[seed; 32])
    }

    #[test]
    fn test_submit_and_attest_reserve_proof() {
        let env = Env::default();
        let contract_id = env.register_contract(None, PiRCZkBN254);
        let client = PiRCZkBN254Client::new(&env, &contract_id);
        let prover = Address::generate(&env);
        let attester = Address::generate(&env);
        env.mock_all_auths();

        let pc = make_hash(&env, 0xAA);
        let pi = make_hash(&env, 0xBB);
        let vk = make_hash(&env, 0xCC);

        let returned = client.submit_proof(
            &prover,
            &pc,
            &pi,
            &vk,
            &ZKProofType::WarehouseGoldProof,
            &10_000_000_000_i128, // 10B asset units
        );
        assert_eq!(returned, pc);
        assert_eq!(client.total_proofs(), 1);
        assert!(!client.is_verified(&pc));

        // Attest
        assert!(client.attest_verified(&attester, &pc));
        assert!(client.is_verified(&pc));
        assert_eq!(client.total_verified(), 1);

        // Double attest should fail
        assert!(!client.attest_verified(&attester, &pc));
    }

    #[test]
    fn test_identity_proof() {
        let env = Env::default();
        let contract_id = env.register_contract(None, PiRCZkBN254);
        let client = PiRCZkBN254Client::new(&env, &contract_id);
        let prover = Address::generate(&env);
        let attester = Address::generate(&env);
        env.mock_all_auths();

        let pc = make_hash(&env, 0x01);
        let pi = make_hash(&env, 0x02);
        let vk = make_hash(&env, 0x03);

        client.submit_proof(&prover, &pc, &pi, &vk, &ZKProofType::IdentityProof, &0_i128);
        let rec = client.get_proof(&pc).unwrap();
        assert!(!rec.is_verified);
        assert_eq!(rec.asset_amount, 0);

        assert!(client.attest_verified(&attester, &pc));
        let latest = client.get_latest_proof_by_prover(&prover).unwrap();
        assert!(latest.is_verified);
    }

    #[test]
    fn test_cross_chain_portability_proof() {
        let env = Env::default();
        let contract_id = env.register_contract(None, PiRCZkBN254);
        let client = PiRCZkBN254Client::new(&env, &contract_id);
        let prover = Address::generate(&env);
        env.mock_all_auths();

        let pc = make_hash(&env, 0x10);
        let pi = make_hash(&env, 0x11);
        let vk = make_hash(&env, 0x12);

        client.submit_proof(
            &prover,
            &pc,
            &pi,
            &vk,
            &ZKProofType::CrossChainPortability,
            &0_i128,
        );
        assert_eq!(client.total_proofs(), 1);
        assert_eq!(client.total_verified(), 0);
    }
}
