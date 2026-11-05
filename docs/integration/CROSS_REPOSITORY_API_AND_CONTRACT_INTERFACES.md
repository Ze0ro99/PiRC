# Cross-Repository API and Contract Interfaces

## 1. Versioning rules

PiRC owns normative schemas and compatibility policy. SmartContracts owns executable ABI and contract behavior. Unity Sphere owns orchestration and user-facing APIs. Every interface includes semantic version, schema hash, owner, network scope and deprecation window.

Breaking field meaning, asset units, authorization semantics, event ordering or error semantics requires a major version. Additive optional fields may use a minor version only if old consumers safely ignore them.

## 2. Interface catalogue

| Interface | Producer | Consumer | Required invariant |
|---|---|---|---|
| RAW evidence envelope | Unity Sphere / approved attesters | PiRC registry + Soroban | Signed, versioned, privacy-scoped |
| Factory deployment request | Developer Studio | Factory API/contract | Idempotent, quota/approval gated |
| Factory deployment result | Factory + network adapter | Studio / registry indexer | Real tx + code hash + read-back |
| Oracle observation | Source adapter/reporter | Oracle engine | Signed, typed units, freshness |
| Aggregated quote | Oracle engine | Valuation and risk | Quorum evidence and expiry |
| Merchant utility quote | Merchant service | Checkout / valuation | Terms, capacity, validity |
| Payment intent | Checkout | Settlement contract | Idempotency, amount atomic, asset/network |
| Payment event | Contract / indexer | Reconciliation | Confirmed tx and canonical event |
| Economic settlement | Treasury service | Settlement contract | Revenue evidence and conservation |
| Dispute event | Case service | Registry / settlement | State transition and authorization |

## 3. Canonical payment intent

Fields: `payment_id`, `idempotency_key`, `network_id`, `asset_id`, `asset_contract_id`, `amount_atomic`, `decimals`, `payer`, `payee`, `merchant_quote_id`, `expires_at`, `policy_version`, `memo_hash`.

Amounts are non-negative integer strings in JSON to avoid JavaScript number precision loss. Reject decimal strings in the atomic field, scientific notation, overflow, unknown decimals, expired quotes, and mismatched network/asset.

## 4. Canonical payment event

Fields: `event_id`, `payment_id`, `network_id`, `transaction_hash`, `ledger_or_block`, `operation_index`, `asset_id`, `amount_atomic`, `from`, `to`, `status`, `confirmed_at`, `contract_id`, `event_topic`, `schema_version`.

An API response saying "submitted" is not a confirmed payment. Reconciliation must verify transaction status and event details from the network, detect duplicate events, and handle reorg/finality policy as appropriate to the network.

## 5. Error model

Use stable machine-readable codes: `INVALID_SCHEMA`, `UNSUPPORTED_VERSION`, `UNAUTHORIZED`, `POLICY_REJECTED`, `DUPLICATE_IDEMPOTENCY_KEY`, `QUOTE_EXPIRED`, `ORACLE_STALE`, `ORACLE_QUORUM_FAILED`, `INSUFFICIENT_LIQUIDITY`, `NETWORK_UNAVAILABLE`, `SUBMISSION_UNKNOWN`, `READBACK_MISMATCH`, `SETTLEMENT_RECONCILIATION_FAILED`.

Never map unknown submission outcome to success or retry a non-idempotent financial action blindly.

## 6. Ownership and compatibility tests

CI must validate schema hashes, ABI snapshots, event fixtures, decimal/atomic conversion, unknown-field behavior, idempotency, authorization, failure-state transitions and cross-repository fixture compatibility. Each producer publishes a compatibility manifest and each consumer tests against the pinned version.
