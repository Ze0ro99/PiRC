# PiRC-237 — AI Market Intelligence Oracle

Status: DRAFT / COMMUNITY PROPOSAL. This document is not an official Pi Network standard.

## Purpose
Define an auditable interface for publishing model-derived volatility and sentiment observations for registered assets. The contract records signed-updater provenance and bounded observations; it does not train models, certify model quality, or independently prove a zero-knowledge statement.

## Source baseline
The Unity Sphere default branch contains `contracts/PiRC237AIOracle.sol` and `contracts/soroban/src/ai_oracle.rs`. The Solidity file leaves ZK verification as a placeholder. The Soroban file was malformed and contained duplicate/incomplete contract definitions. A new reference crate is available on the integration branch at `Ze0ro99/SmartContracts/contracts/pirc_237_ai_oracle`.

## Data model
Each record contains asset/feed ID, volatility index, sentiment score, sequence, ledger timestamp, updater address, model version and proof hash. Scores use parts-per-million scale [0, 1,000,000]. The proof hash is only a commitment/reference; it is not proof verification.

## Authorization and validation
- Admin initializes the contract and controls an updater allowlist.
- Each updater must authorize each submission.
- Scores outside [0, 1,000,000] are rejected.
- Sequence numbers must increase for each asset.
- Timestamp comes from the ledger, not caller input.
- Model version and proof hash are stored with the observation.

## Required production extensions
Independent source aggregation, quorum, freshness limits, deviation controls, model version governance, model evaluation, proof verification, replay protection, dispute handling, emergency pause and consumer-side stale-data rejection.

## Consumer constraints
Do not interpret sentiment or volatility as price, solvency, reserve coverage or purchasing power. A missing or stale observation must fail closed.

## Acceptance criteria
Authorization tests, boundary tests, sequence replay tests, timestamp checks, persistence/readback tests, model version and proof-hash integrity, adversarial tests, independent security review and network-specific deployment evidence.

## Current implementation status
The integration-branch Soroban reference stores bounded, authorized, monotonic observations. It does not implement ZK proof verification, multi-source aggregation, model execution or market-price formation.
