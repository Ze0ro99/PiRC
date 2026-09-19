#![no_std]
#![forbid(unsafe_code)]

use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Env, Map, Symbol, String, Vec, vec,
    TimePoint,
};

#[derive(Clone)]
#[contracttype]
pub enum ProposalStatus {
    Pending,
    Approved,
    Executed,
    Rejected,
    Expired,
}

#[derive(Clone)]
#[contracttype]
pub struct Proposal {
    pub id: u32,
    pub action_description: String,
    pub proposer: Address,
    pub created_at: TimePoint,
    pub signatures_count: u32,
    pub status: ProposalStatus,
    pub execution_time: TimePoint,
}

#[derive(Clone)]
#[contracttype]
pub struct GovernanceAction {
    pub action_type: Symbol,
    pub target: Address,
    pub data: Vec<u8>,
}

#[contract]
pub struct MultiSigGovernance;

#[contractimpl]
impl MultiSigGovernance {
    /// Initialize governance contract with signers and threshold
    pub fn init(
        env: Env,
        signers: Vec<Address>,
        threshold: u32,
        time_lock_duration: u64,
    ) -> Result<(), String> {
        if signers.is_empty() {
            return Err("At least one signer required".to_string());
        }
        if threshold == 0 || threshold > signers.len() as u32 {
            return Err("Invalid threshold".to_string());
        }

        let storage = env.storage().persistent();
        storage.set(&Symbol::new(&env, "signers"), &signers);
        storage.set(&Symbol::new(&env, "threshold"), &threshold);
        storage.set(&Symbol::new(&env, "time_lock"), &time_lock_duration);
        storage.set(&Symbol::new(&env, "proposal_count"), &0u32);

        Ok(())
    }

    /// Submit a new proposal
    pub fn propose(
        env: Env,
        action: GovernanceAction,
        description: String,
        proposer: Address,
    ) -> Result<u32, String> {
        proposer.require_auth();

        let storage = env.storage().persistent();
        let signers: Vec<Address> = storage
            .get(&Symbol::new(&env, "signers"))
            .ok_or("Not initialized".to_string())?
            .unwrap();

        // Verify proposer is a signer
        if !signers.iter().any(|s| s == &proposer) {
            return Err("Only signers can propose".to_string());
        }

        let mut count: u32 = storage
            .get(&Symbol::new(&env, "proposal_count"))
            .unwrap_or(Ok(0u32))
            .unwrap_or(0);

        let proposal_id = count;
        count += 1;

        let proposal = Proposal {
            id: proposal_id,
            action_description: description,
            proposer: proposer.clone(),
            created_at: env.ledger().timestamp(),
            signatures_count: 0,
            status: ProposalStatus::Pending,
            execution_time: env.ledger().timestamp(),
        };

        let key = Symbol::new(&env, &format!("proposal_{}", proposal_id));
        storage.set(&key, &proposal);
        storage.set(&Symbol::new(&env, "proposal_count"), &count);

        // Emit event
        env.events().publish(
            (Symbol::new(&env, "proposal_created"), proposal_id),
            (proposer, env.ledger().timestamp()),
        );

        Ok(proposal_id)
    }

    /// Sign a proposal (called by each signer)
    pub fn sign_proposal(
        env: Env,
        proposal_id: u32,
        signer: Address,
    ) -> Result<(), String> {
        signer.require_auth();

        let storage = env.storage().persistent();
        let signers: Vec<Address> = storage
            .get(&Symbol::new(&env, "signers"))
            .ok_or("Not initialized".to_string())?
            .unwrap();

        // Verify signer
        if !signers.iter().any(|s| s == &signer) {
            return Err("Not a valid signer".to_string());
        }

        let key = Symbol::new(&env, &format!("proposal_{}", proposal_id));
        let mut proposal: Proposal = storage
            .get(&key)
            .ok_or("Proposal not found".to_string())?
            .unwrap();

        // Prevent double signing
        let signed_key = Symbol::new(&env, &format!("signed_{}_{}", proposal_id, signer.to_string()));
        if storage.get(&signed_key).is_some() {
            return Err("Already signed by this signer".to_string());
        }

        proposal.signatures_count += 1;
        storage.set(&key, &proposal);
        storage.set(&signed_key, &true);

        // Emit event
        env.events().publish(
            (Symbol::new(&env, "proposal_signed"), proposal_id),
            (&signer, proposal.signatures_count),
        );

        Ok(())
    }

    /// Execute proposal if threshold met and time-lock expired
    pub fn execute_proposal(
        env: Env,
        proposal_id: u32,
        executor: Address,
    ) -> Result<(), String> {
        executor.require_auth();

        let storage = env.storage().persistent();
        let threshold: u32 = storage
            .get(&Symbol::new(&env, "threshold"))
            .ok_or("Not initialized".to_string())?
            .unwrap();

        let time_lock: u64 = storage
            .get(&Symbol::new(&env, "time_lock"))
            .ok_or("Not initialized".to_string())?
            .unwrap();

        let key = Symbol::new(&env, &format!("proposal_{}", proposal_id));
        let mut proposal: Proposal = storage
            .get(&key)
            .ok_or("Proposal not found".to_string())?
            .unwrap();

        // Check signatures
        if proposal.signatures_count < threshold {
            return Err(format!(
                "Insufficient signatures: {} of {}",
                proposal.signatures_count, threshold
            ));
        }

        // Check time-lock
        let current_time = env.ledger().timestamp();
        let elapsed = current_time - proposal.created_at;
        if elapsed < time_lock {
            return Err(format!(
                "Time-lock not expired. {} seconds remaining",
                time_lock - elapsed
            ));
        }

        // Update status
        proposal.status = ProposalStatus::Executed;
        proposal.execution_time = current_time;
        storage.set(&key, &proposal);

        // Emit execution event
        env.events().publish(
            (Symbol::new(&env, "proposal_executed"), proposal_id),
            (&executor, current_time),
        );

        Ok(())
    }

    /// Query proposal status
    pub fn get_proposal(
        env: Env,
        proposal_id: u32,
    ) -> Result<Proposal, String> {
        let storage = env.storage().persistent();
        let key = Symbol::new(&env, &format!("proposal_{}", proposal_id));
        storage
            .get(&key)
            .ok_or("Proposal not found".to_string())?
            .ok_or("Proposal not found".to_string())
    }

    /// Get current signer list
    pub fn get_signers(env: Env) -> Result<Vec<Address>, String> {
        let storage = env.storage().persistent();
        storage
            .get(&Symbol::new(&env, "signers"))
            .ok_or("Not initialized".to_string())?
            .ok_or("Not initialized".to_string())
    }

    /// Get threshold
    pub fn get_threshold(env: Env) -> Result<u32, String> {
        let storage = env.storage().persistent();
        storage
            .get(&Symbol::new(&env, "threshold"))
            .ok_or("Not initialized".to_string())?
            .ok_or("Not initialized".to_string())
    }
}
