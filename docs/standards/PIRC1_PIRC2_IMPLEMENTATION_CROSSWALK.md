# PiRC1 / PiRC2 Implementation Crosswalk

**Status:** Proposed engineering crosswalk; canonical proposal text and maintainer decisions take precedence.  
**Execution network:** Pi Testnet only (Testnet1 project profile).

## PiRC1 — application/token launchpad lifecycle

| Lifecycle | Required record | Gate | Expected evidence |
|---|---|---|---|
| Draft | app identity, issuer, token metadata, utility and disclosures | schema validation | immutable proposal version |
| Submitted | supply cap, decimals, mint/burn policy, allocations, vesting | issuer authorization | signed submission |
| Review | risk, dependencies, concentration, upgrade and pause policy | independent review | review record and findings |
| Approved Testnet | approved parameters and artifact hash | explicit maintainer approval | approval event |
| Deployed Testnet | network, contract ID, WASM hash, tx hash | Testnet-only deploy guard | RPC readback |
| Observation | supply, transfers, pauses, anomalies | monitoring policy | telemetry and incident log |
| Retired | reason, final state, remaining privileges | authorized governance | retirement event |

No app proposal may directly mint or list a token. No agent may approve issuer identity, bypass review, or deploy without explicit authorization. Testnet approval is not Mainnet approval.

## PiRC2 — service and subscription lifecycle

| Lifecycle | Required behavior | Negative tests |
|---|---|---|
| Created | immutable service version and pricing terms | malformed terms |
| Authorized | explicit payer authorization/allowance | revoked or insufficient allowance |
| Active | cycle schedule and next-charge boundary | duplicate cycle processing |
| Charged | idempotent charge reference | replayed callback |
| Past due | deterministic retry policy | repeated retries / fee exhaustion |
| Cancelled | stop future cycles, retain audit history | cancellation racing with charge |
| Expired | service entitlement ends at defined boundary | timezone/ledger-boundary cases |
| Refunded/disputed | separately authorized resolution | unauthorized refund |

Subscriptions and fungible token balances are separate state machines. A service entitlement must never be inferred from token ownership unless the canonical standard explicitly defines that relationship.

## Required conformance pins

Before claiming conformance, record:
- canonical PiRC1 and PiRC2 document paths and commit SHAs;
- exact contract repository, branch, commit SHA, package name and interface version;
- protocol/SDK compatibility matrix;
- deterministic test names and CI run URLs;
- Testnet transaction references and readback evidence;
- unresolved normative questions and maintainer decisions.

## Known blocker

The integration review has identified a mismatch between simulated approval expiry and the contract implementation in the PiRC2 subscription work. Keep recurring charges disabled until the same expiry, revocation, retry, and cancellation semantics are implemented and tested end-to-end.

## Release rule

The words `conformant`, `approved`, and `production-ready` may only be used when the required canonical specification, implementation, tests, and approval evidence are all linked. A draft PR or passing static-analysis badge alone is insufficient.
