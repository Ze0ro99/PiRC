// PiRC Pi Token — SEP-41 / PiRC-207 Compliant
// Differentiates mined Pi (internal) from exchange Pi (external)
// Soroban SDK v27 — Pi Testnet / Stellar Testnet
#![no_std]
#![forbid(unsafe_code)]

use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env};

/// Pi coin source: mined (internal, walled garden) vs exchange-listed
#[contracttype]
#[derive(Clone, PartialEq)]
pub enum PiSource {
    /// Mined Pi — subject to 10M:1 QWF multiplier (PiRC-207)
    Mined,
    /// Exchange Pi — external market price, NOT subject to QWF
    Exchange,
}

#[contracttype]
#[derive(Clone)]
pub enum TokenKey {
    Balance(Address, PiSource),
    Minter,
    TotalMined,
    TotalExchange,
}

#[contract]
pub struct PiToken;

#[contractimpl]
impl PiToken {
    pub fn initialize(env: Env, minter: Address) {
        minter.require_auth();
        env.storage().instance().set(&TokenKey::Minter, &minter);
        env.storage().instance().set(&TokenKey::TotalMined, &0_i128);
        env.storage().instance().set(&TokenKey::TotalExchange, &0_i128);
    }

    /// Mint mined Pi — requires minter authority (PiRC-207 walled garden)
    pub fn mint_mined(env: Env, to: Address, amount: i128) {
        let minter: Address = env.storage().instance().get(&TokenKey::Minter).expect("not initialized");
        minter.require_auth();
        let key = TokenKey::Balance(to.clone(), PiSource::Mined);
        let bal: i128 = env.storage().persistent().get(&key).unwrap_or(0);
        env.storage().persistent().set(&key, &(bal + amount));
        let total: i128 = env.storage().instance().get(&TokenKey::TotalMined).unwrap_or(0);
        env.storage().instance().set(&TokenKey::TotalMined, &(total + amount));
        env.events().publish((symbol_short!("PI"), symbol_short!("MINT_M")), (to, amount));
    }

    /// Mint exchange Pi — represents externally traded Pi
    pub fn mint_exchange(env: Env, to: Address, amount: i128) {
        let minter: Address = env.storage().instance().get(&TokenKey::Minter).expect("not initialized");
        minter.require_auth();
        let key = TokenKey::Balance(to.clone(), PiSource::Exchange);
        let bal: i128 = env.storage().persistent().get(&key).unwrap_or(0);
        env.storage().persistent().set(&key, &(bal + amount));
        let total: i128 = env.storage().instance().get(&TokenKey::TotalExchange).unwrap_or(0);
        env.storage().instance().set(&TokenKey::TotalExchange, &(total + amount));
        env.events().publish((symbol_short!("PI"), symbol_short!("MINT_E")), (to, amount));
    }

    pub fn transfer(env: Env, from: Address, to: Address, amount: i128, source: PiSource) -> bool {
        from.require_auth();
        let from_key = TokenKey::Balance(from.clone(), source.clone());
        let from_bal: i128 = env.storage().persistent().get(&from_key).unwrap_or(0);
        if from_bal < amount {
            return false;
        }
        env.storage().persistent().set(&from_key, &(from_bal - amount));
        let to_key = TokenKey::Balance(to.clone(), source.clone());
        let to_bal: i128 = env.storage().persistent().get(&to_key).unwrap_or(0);
        env.storage().persistent().set(&to_key, &(to_bal + amount));
        env.events().publish((symbol_short!("PI"), symbol_short!("XFER")), (from, to, amount));
        true
    }

    pub fn balance_of(env: Env, addr: Address, source: PiSource) -> i128 {
        env.storage().persistent().get(&TokenKey::Balance(addr, source)).unwrap_or(0)
    }

    /// QWF value: 1 mined Pi = market_price * 10_000_000 internal units
    pub fn qwf_value(market_price_micro: i128) -> i128 {
        market_price_micro * 10_000_000
    }

    pub fn total_mined(env: Env) -> i128 {
        env.storage().instance().get(&TokenKey::TotalMined).unwrap_or(0)
    }

    pub fn total_exchange(env: Env) -> i128 {
        env.storage().instance().get(&TokenKey::TotalExchange).unwrap_or(0)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::Env;

    #[test]
    fn test_mined_vs_exchange_separation() {
        let env = Env::default();
        let contract_id = env.register_contract(None, PiToken);
        let client = PiTokenClient::new(&env, &contract_id);
        let minter = Address::generate(&env);
        let user = Address::generate(&env);
        env.mock_all_auths();
        client.initialize(&minter);
        client.mint_mined(&user, &1_000_i128);
        client.mint_exchange(&user, &500_i128);
        assert_eq!(client.balance_of(&user, &PiSource::Mined), 1_000_i128);
        assert_eq!(client.balance_of(&user, &PiSource::Exchange), 500_i128);
        // QWF: mined Pi internal value (at 0.2248 USD = 224800 micro)
        assert_eq!(PiToken::qwf_value(224_800), 2_248_000_000_000);
    }
}
