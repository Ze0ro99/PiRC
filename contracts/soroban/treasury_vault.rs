#![forbid(unsafe_code)]
#![forbid(unsafe_code)]
#![forbid(unsafe_code)]
#![forbid(unsafe_code)]
#![forbid(unsafe_code)]
#![forbid(unsafe_code)]
#![forbid(unsafe_code)]
#![forbid(unsafe_code)]
#![forbid(unsafe_code)]
#![forbid(unsafe_code)]
#![forbid(unsafe_code)]
// PiRC Treasury Vault — PiRC-220 / PiRC-252 Compliant
// Soroban SDK v27 — Pi Testnet / Stellar Testnet
#![no_std]
#![forbid(unsafe_code)]

use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env};

#[contracttype]
#[derive(Clone)]
pub enum VaultKey {
    Balance(Address),
    Admin,
}

#[contract]
pub struct TreasuryVault;

#[contractimpl]
impl TreasuryVault {
    pub fn initialize(env: Env, admin: Address) {
        admin.require_auth();
        env.storage().instance().set(&VaultKey::Admin, &admin);
    }

    pub fn deposit(env: Env, user: Address, amount: i128) {
        user.require_auth();
        let key = VaultKey::Balance(user.clone());
        let bal: i128 = env.storage().persistent().get(&key).unwrap_or(0);
        env.storage().persistent().set(&key, &(bal + amount));
        env.events().publish(
            (symbol_short!("VAULT"), symbol_short!("DEPOSIT")),
            (user, amount),
        );
    }

    /// Withdraw Pi units — immediate settlement on testnet (Warehouse Payment)
    pub fn withdraw(env: Env, user: Address, amount: i128) -> bool {
        user.require_auth();
        let key = VaultKey::Balance(user.clone());
        let bal: i128 = env.storage().persistent().get(&key).unwrap_or(0);
        if bal < amount {
            return false;
        }
        env.storage().persistent().set(&key, &(bal - amount));
        env.events().publish(
            (symbol_short!("VAULT"), symbol_short!("WITHDRAW")),
            (user, amount),
        );
        true
    }

    pub fn balance_of(env: Env, addr: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&VaultKey::Balance(addr))
            .unwrap_or(0)
    }

    /// Emergency admin drain — justice/recovery (PiRC-228)
    pub fn admin_drain(env: Env, from: Address, to: Address, amount: i128) -> bool {
        let admin: Address = env
            .storage()
            .instance()
            .get(&VaultKey::Admin)
            .expect("not initialized");
        admin.require_auth();
        let from_key = VaultKey::Balance(from.clone());
        let bal: i128 = env.storage().persistent().get(&from_key).unwrap_or(0);
        if bal < amount {
            return false;
        }
        env.storage().persistent().set(&from_key, &(bal - amount));
        let to_key = VaultKey::Balance(to.clone());
        let to_bal: i128 = env.storage().persistent().get(&to_key).unwrap_or(0);
        env.storage().persistent().set(&to_key, &(to_bal + amount));
        env.events().publish(
            (symbol_short!("VAULT"), symbol_short!("DRAIN")),
            (from, to, amount),
        );
        true
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::Env;

    #[test]
    fn test_deposit_and_withdraw() {
        let env = Env::default();
        let contract_id = env.register_contract(None, TreasuryVault);
        let client = TreasuryVaultClient::new(&env, &contract_id);
        let admin = Address::generate(&env);
        let user = Address::generate(&env);
        env.mock_all_auths();
        client.initialize(&admin);
        client.deposit(&user, &1_000_i128);
        assert_eq!(client.balance_of(&user), 1_000_i128);
        assert!(client.withdraw(&user, &400_i128));
        assert_eq!(client.balance_of(&user), 600_i128);
        assert!(!client.withdraw(&user, &9_999_i128));
    }

    #[test]
    fn test_admin_drain() {
        let env = Env::default();
        let contract_id = env.register_contract(None, TreasuryVault);
        let client = TreasuryVaultClient::new(&env, &contract_id);
        let admin = Address::generate(&env);
        let from = Address::generate(&env);
        let to = Address::generate(&env);
        env.mock_all_auths();
        client.initialize(&admin);
        client.deposit(&from, &500_i128);
        assert!(client.admin_drain(&from, &to, &200_i128));
        assert_eq!(client.balance_of(&from), 300_i128);
        assert_eq!(client.balance_of(&to), 200_i128);
    }
}
