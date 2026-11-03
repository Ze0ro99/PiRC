# Application Asset and Token Lifecycle Standard

**Status:** Proposed standard. **Execution:** Pi Testnet only.

## Asset classes

The registry must distinguish native network assets, issued fungible tokens, non-fungible assets, application credits, test tokens, and off-chain accounting units. A ticker or logo does not identify an asset. Canonical identity is network + contract/issuer + asset type.

## Mandatory token metadata

- immutable asset ID and canonical network ID;
- issuer identity and authorization evidence;
- name, symbol, decimals and metadata version;
- supply cap and initial supply;
- mint, burn, pause, freeze and upgrade permissions;
- allocation, vesting, transfer restrictions and utility;
- metadata URI/content hash and disclosure document;
- deployment transaction, contract ID and WASM hash;
- audit status, risk classification and lifecycle status.

Unknown deployment fields remain null. Never invent contract IDs or mark a token deployed without Testnet readback.

## Launchpad gates

1. Draft: schema and disclosure complete.
2. Submitted: issuer signs exact immutable proposal hash.
3. Review: technical, economic, legal and security review.
4. Testnet-approved: explicit reviewer approval and parameters frozen.
5. Deployed: allowlisted package, Testnet signer, reproducible artifact and RPC readback.
6. Observed: supply, privileges, transfers and incidents monitored.
7. Suspended: emergency pause with documented reason and appeal.
8. Retired: privileges revoked or bounded, final supply/state recorded.

AI agents may prepare and analyze submissions but cannot approve issuers, change supply, mint, deploy or unpause.

## Supply invariants

- total_supply = cumulative_mints - cumulative_burns, subject to documented initial supply.
- total_supply <= cap where a cap is defined.
- every mint/burn has authorized actor, reason, event and transaction reference.
- upgrades are disabled by default; if enabled, require timelock, review, migration plan and rollback.
- decimals and asset identity are immutable after deployment unless the canonical standard explicitly defines a migration.

## Application utility

A token's utility must be described as an enforceable product/service rule, not a promise of appreciation, profit, dividends, bank deposits or redemption. Listing on a launchpad does not imply liquidity or exchange access.
