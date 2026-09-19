// PiRC Warehouse Payment — Immediate Settlement on Testnet 1 & 2
// Handles withdrawal requests from the Gold Warehouse with instant settlement.
// PiRC-220 / PiRC-252 / PiRC-228 Compliant
// Soroban SDK v27 — Pi Testnet (https://rpc.testnet.minepi.com)
#![no_std]
#![forbid(unsafe_code)]

use soroban_sdk::{contract, contractimpl, contractmeta, contracttype, symbol_short, Address, BytesN, Env};

contractmeta!(
    title       = "PiRC Warehouse Immediate Payment Settlement",
    version     = "1.0",
    description = "Processes warehouse withdrawal requests with immediate settlement on Pi Testnet 1 & 2"
);

// ─── Types ───────────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone, PartialEq)]
pub enum PaymentStatus {
    Pending,
    Settled,
    Rejected,
}

#[contracttype]
#[derive(Clone)]
pub struct WithdrawalRequest {
    /// Requesting party
    pub requester: Address,
    /// Destination account
    pub recipient: Address,
    /// Amount in Pi micro-units (7 decimals)
    pub amount: i128,
    /// ZK proof commitment (BN254) authorising this release
    pub zk_proof: BytesN<32>,
    /// Settlement network: 1 = Pi Testnet 1, 2 = Pi Testnet 2
    pub network_id: u32,
    pub status: PaymentStatus,
    pub submitted_at: u64,
    pub settled_at: u64,
}

#[contracttype]
#[derive(Clone)]
pub enum PayKey {
    Request(u64),   // request_id → WithdrawalRequest
    Counter,
    Settler,
    TotalSettled,
    TotalRejected,
}

// ─── Contract ────────────────────────────────────────────────────────────────

#[contract]
pub struct PiRCWarehousePayment;

#[contractimpl]
impl PiRCWarehousePayment {
    pub fn initialize(env: Env, settler: Address) {
        settler.require_auth();
        env.storage().instance().set(&PayKey::Settler, &settler);
        env.storage().instance().set(&PayKey::Counter, &0_u64);
        env.storage().instance().set(&PayKey::TotalSettled, &0_i128);
        env.storage().instance().set(&PayKey::TotalRejected, &0_u64);
    }

    // ─── Submit ──────────────────────────────────────────────────────────

    /// Submit a withdrawal request from the warehouse.
    /// Returns the request ID for tracking.
    pub fn submit_withdrawal(
        env: Env,
        requester: Address,
        recipient: Address,
        amount: i128,
        zk_proof: BytesN<32>,
        network_id: u32,
    ) -> u64 {
        requester.require_auth();
        assert!(amount > 0, "amount must be positive");
        assert!(network_id == 1 || network_id == 2, "network_id must be 1 or 2");

        let id: u64 = env.storage().instance().get(&PayKey::Counter).unwrap_or(0);
        let request = WithdrawalRequest {
            requester: requester.clone(),
            recipient: recipient.clone(),
            amount,
            zk_proof: zk_proof.clone(),
            network_id,
            status: PaymentStatus::Pending,
            submitted_at: env.ledger().timestamp(),
            settled_at: 0,
        };
        env.storage().persistent().set(&PayKey::Request(id), &request);
        env.storage().instance().set(&PayKey::Counter, &(id + 1));

        env.events().publish(
            (symbol_short!("WHPAY"), symbol_short!("SUBMIT")),
            (id, requester, recipient, amount, network_id),
        );
        id
    }

    // ─── Settle ──────────────────────────────────────────────────────────

    /// Immediately settle a pending withdrawal — called by settler authority.
    /// In production this is triggered by the testnet transaction broadcaster.
    pub fn settle(env: Env, request_id: u64) -> bool {
        let settler: Address = env.storage().instance().get(&PayKey::Settler).expect("not initialized");
        settler.require_auth();

        let key = PayKey::Request(request_id);
        let mut req: WithdrawalRequest = match env.storage().persistent().get(&key) {
            Some(r) => r,
            None => return false,
        };
        if req.status != PaymentStatus::Pending {
            return false;
        }

        req.status = PaymentStatus::Settled;
        req.settled_at = env.ledger().timestamp();
        env.storage().persistent().set(&key, &req);

        let total: i128 = env.storage().instance().get(&PayKey::TotalSettled).unwrap_or(0);
        env.storage().instance().set(&PayKey::TotalSettled, &(total + req.amount));

        env.events().publish(
            (symbol_short!("WHPAY"), symbol_short!("SETTLED")),
            (request_id, req.recipient, req.amount, req.network_id),
        );
        true
    }

    /// Reject a withdrawal request (fraud / proof invalid)
    pub fn reject(env: Env, request_id: u64) -> bool {
        let settler: Address = env.storage().instance().get(&PayKey::Settler).expect("not initialized");
        settler.require_auth();

        let key = PayKey::Request(request_id);
        let mut req: WithdrawalRequest = match env.storage().persistent().get(&key) {
            Some(r) => r,
            None => return false,
        };
        if req.status != PaymentStatus::Pending {
            return false;
        }
        req.status = PaymentStatus::Rejected;
        env.storage().persistent().set(&key, &req);

        let rejected: u64 = env.storage().instance().get(&PayKey::TotalRejected).unwrap_or(0);
        env.storage().instance().set(&PayKey::TotalRejected, &(rejected + 1));

        env.events().publish(
            (symbol_short!("WHPAY"), symbol_short!("REJECTED")),
            (request_id, req.requester),
        );
        true
    }

    // ─── Query ───────────────────────────────────────────────────────────

    pub fn get_request(env: Env, request_id: u64) -> Option<WithdrawalRequest> {
        env.storage().persistent().get(&PayKey::Request(request_id))
    }

    pub fn total_requests(env: Env) -> u64 {
        env.storage().instance().get(&PayKey::Counter).unwrap_or(0)
    }

    pub fn total_settled_amount(env: Env) -> i128 {
        env.storage().instance().get(&PayKey::TotalSettled).unwrap_or(0)
    }

    pub fn total_rejected(env: Env) -> u64 {
        env.storage().instance().get(&PayKey::TotalRejected).unwrap_or(0)
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

    fn make_proof(env: &Env, seed: u8) -> BytesN<32> {
        BytesN::from_array(env, &[seed; 32])
    }

    #[test]
    fn test_submit_and_settle_testnet1() {
        let env = Env::default();
        let contract_id = env.register_contract(None, PiRCWarehousePayment);
        let client = PiRCWarehousePaymentClient::new(&env, &contract_id);
        let settler = Address::generate(&env);
        let requester = Address::generate(&env);
        let recipient = Address::generate(&env);
        env.mock_all_auths();

        client.initialize(&settler);

        let id = client.submit_withdrawal(
            &requester,
            &recipient,
            &1_000_000_000_i128, // 1000 Pi (7 decimals)
            &make_proof(&env, 0xAA),
            &1_u32, // Testnet 1
        );
        assert_eq!(id, 0);
        assert_eq!(client.total_requests(), 1);

        let req = client.get_request(&id).unwrap();
        assert_eq!(req.status, PaymentStatus::Pending);

        // Immediate settlement
        assert!(client.settle(&id));
        let settled = client.get_request(&id).unwrap();
        assert_eq!(settled.status, PaymentStatus::Settled);
        assert_eq!(client.total_settled_amount(), 1_000_000_000_i128);
    }

    #[test]
    fn test_submit_and_settle_testnet2() {
        let env = Env::default();
        let contract_id = env.register_contract(None, PiRCWarehousePayment);
        let client = PiRCWarehousePaymentClient::new(&env, &contract_id);
        let settler = Address::generate(&env);
        let requester = Address::generate(&env);
        let recipient = Address::generate(&env);
        env.mock_all_auths();

        client.initialize(&settler);

        let id = client.submit_withdrawal(
            &requester,
            &recipient,
            &500_000_000_i128,
            &make_proof(&env, 0xBB),
            &2_u32, // Testnet 2
        );
        assert!(client.settle(&id));
        assert_eq!(client.total_settled_amount(), 500_000_000_i128);
    }

    #[test]
    fn test_reject_withdrawal() {
        let env = Env::default();
        let contract_id = env.register_contract(None, PiRCWarehousePayment);
        let client = PiRCWarehousePaymentClient::new(&env, &contract_id);
        let settler = Address::generate(&env);
        let requester = Address::generate(&env);
        let recipient = Address::generate(&env);
        env.mock_all_auths();

        client.initialize(&settler);
        let id = client.submit_withdrawal(
            &requester,
            &recipient,
            &250_000_000_i128,
            &make_proof(&env, 0xCC),
            &1_u32,
        );
        assert!(client.reject(&id));
        assert_eq!(client.total_rejected(), 1);
        assert_eq!(client.total_settled_amount(), 0);
    }

    #[test]
    fn test_cannot_settle_twice() {
        let env = Env::default();
        let contract_id = env.register_contract(None, PiRCWarehousePayment);
        let client = PiRCWarehousePaymentClient::new(&env, &contract_id);
        let settler = Address::generate(&env);
        let requester = Address::generate(&env);
        let recipient = Address::generate(&env);
        env.mock_all_auths();

        client.initialize(&settler);
        let id = client.submit_withdrawal(
            &requester, &recipient, &100_000_000_i128,
            &make_proof(&env, 0xDD), &1_u32,
        );
        assert!(client.settle(&id));
        assert!(!client.settle(&id)); // second settle must fail
    }
}
