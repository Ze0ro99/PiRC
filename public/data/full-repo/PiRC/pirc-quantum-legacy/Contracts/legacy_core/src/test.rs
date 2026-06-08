#![cfg(test)]
use super::*;
use soroban_sdk::{Env, Address, Map, BytesN};
use soroban_sdk::testutils::Address as _;

#[test]
fn test_vault_initialization_and_storage() {
    let env = Env::default();
    let contract_id = env.register_contract(None, SovereignLegacyContract);
    let client = SovereignLegacyContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let heir_1 = Address::generate(&env);
    let heir_2 = Address::generate(&env);

    let mut heirs_map = Map::new(&env);
    heirs_map.set(heir_1.clone(), 5000); 
    heirs_map.set(heir_2.clone(), 5000); 

    env.mock_all_auths();
    client.init_vault(&owner, &1000, &heirs_map);
}

#[test]
#[should_panic(expected = "Justice Protocol: Account is still active. Distribution denied.")]
fn test_distribution_fails_if_owner_is_still_active() {
    let env = Env::default();
    let contract_id = env.register_contract(None, SovereignLegacyContract);
    let client = SovereignLegacyContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let heir = Address::generate(&env);
    let mut heirs_map = Map::new(&env);
    heirs_map.set(heir.clone(), 10000);

    env.mock_all_auths();
    client.init_vault(&owner, &5000, &heirs_map);

    let oracle_pubkey = BytesN::from_array(&env, &[0u8; 32]);
    let dummy_msg = BytesN::from_array(&env, &[1u8; 32]);
    let dummy_sig = BytesN::from_array(&env, &[2u8; 64]);

    client.execute_distribution(&owner, &oracle_pubkey, &dummy_msg, &dummy_sig);
}

#[test]
fn test_successful_distribution_after_threshold() {
    let env = Env::default();
    let contract_id = env.register_contract(None, SovereignLegacyContract);
    let client = SovereignLegacyContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let heir = Address::generate(&env);
    let mut heirs_map = Map::new(&env);
    heirs_map.set(heir.clone(), 10000);

    env.mock_all_auths();
    client.init_vault(&owner, &10, &heirs_map);

    env.ledger().with_mut(|ledger| {
        ledger.sequence += 20;
    });

    let oracle_pubkey = BytesN::from_array(&env, &[0u8; 32]);
    let dummy_msg = BytesN::from_array(&env, &[1u8; 32]);
    let dummy_sig = BytesN::from_array(&env, &[2u8; 64]);

    client.execute_distribution(&owner, &oracle_pubkey, &dummy_msg, &dummy_sig);
}
