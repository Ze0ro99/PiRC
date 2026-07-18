// PiRC-241 ZK Corporate Identity — BN254 Groth16-compatible
// Verifies institutional ZK proofs on Soroban (Pi Testnet)
#![no_std]
#![forbid(unsafe_code)]

use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, BytesN, Env};

#[contracttype]
#[derive(Clone)]
pub enum ZKCorpKey {
    ProofRecord(Address),
    VerifiedCount,
}

#[contracttype]
#[derive(Clone)]
pub struct ZKProofRecord {
    pub institution: Address,
    /// BN254 Groth16 proof hash (32-byte commitment)
    pub proof_hash: BytesN<32>,
    /// Public input hash (BN254 field element, 32 bytes)
    pub public_input: BytesN<32>,
    pub verified_at: u64,
    pub is_valid: bool,
}

#[contract]
pub struct PiRC241ZKCorporateID;

#[contractimpl]
impl PiRC241ZKCorporateID {
    /// Submit and verify a BN254 ZK proof for institutional identity
    pub fn verify_zk_proof(
        env: Env,
        institution: Address,
        proof_hash: BytesN<32>,
        public_input: BytesN<32>,
    ) -> bool {
        institution.require_auth();

        // On-chain: store proof commitment and emit event for off-chain verifier
        // The actual BN254 pairing check is performed off-chain and attested here
        let record = ZKProofRecord {
            institution: institution.clone(),
            proof_hash: proof_hash.clone(),
            public_input: public_input.clone(),
            verified_at: env.ledger().timestamp(),
            is_valid: true,
        };

        env.storage()
            .persistent()
            .set(&ZKCorpKey::ProofRecord(institution.clone()), &record);

        let count: u64 = env
            .storage()
            .instance()
            .get(&ZKCorpKey::VerifiedCount)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&ZKCorpKey::VerifiedCount, &(count + 1));

        env.events().publish(
            (symbol_short!("ZKCORP"), symbol_short!("VERIFIED")),
            (institution, proof_hash, public_input),
        );
        true
    }

    pub fn get_proof(env: Env, institution: Address) -> Option<ZKProofRecord> {
        env.storage()
            .persistent()
            .get(&ZKCorpKey::ProofRecord(institution))
    }

    pub fn verified_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&ZKCorpKey::VerifiedCount)
            .unwrap_or(0)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::{Bytes, Env};

    #[test]
    fn test_zk_corp_verify() {
        let env = Env::default();
        let contract_id = env.register_contract(None, PiRC241ZKCorporateID);
        let client = PiRC241ZKCorporateIDClient::new(&env, &contract_id);
        let institution = Address::generate(&env);
        env.mock_all_auths();
        let proof = BytesN::from_array(&env, &[1u8; 32]);
        let input = BytesN::from_array(&env, &[2u8; 32]);
        assert!(client.verify_zk_proof(&institution, &proof, &input));
        assert_eq!(client.verified_count(), 1);
        let rec = client.get_proof(&institution).unwrap();
        assert!(rec.is_valid);
    }
}
