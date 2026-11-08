# Cross-Repository Pi Testnet1 Integration Status — 2026-11-08

**Status:** IN PROGRESS. This record links PiRC normative requirements to the current SmartContracts and Unity Sphere implementation work. It is not a deployment attestation.

## 1. Source-of-truth boundaries

- PiRC owns standards, economics, governance, schemas, network profiles and release gates.
- SmartContracts owns canonical Soroban contract source, ABI, storage, authorization, tests and reproducible WASM.
- Unity Sphere owns portals, APIs, Pi SDK account integration, asset registry views, network adapters, event ingestion and PiDEX application workflows.

Changes crossing these boundaries require pinned commit SHAs, schema/ABI compatibility, automated tests and evidence records. Branches must be reviewed and selectively integrated; do not bulk-merge every branch.

## 2. Active integration pull requests

| Repository | Pull request | Purpose | Current state |
|---|---|---|---|
| [SmartContracts](https://github.com/Ze0ro99/SmartContracts/pull/1108) | #1108 | Establish canonical SmartContracts-owned PiDEX AMM crate | Open Draft; CI pending |
| [Unity Sphere](https://github.com/Ze0ro99/project-unity-sphere-0e2c810d/pull/52) | #52 | Pi wallet-address binding, shared connection state, Testnet1 network identity guard, asset probe guard, PiDEX fail-closed behavior and integration manifest | Open Draft; CI/runtime validation pending |

These PRs do not deploy contracts, activate liquidity, enable Soroban signing, or authorize Mainnet writes.

## 3. Testnet1 profile

The PiRC network profile identifies Pi Testnet as the target and uses Testnet1 as a project alias.

- Horizon: `https://api.testnet.minepi.com`
- Soroban RPC: `https://rpc.testnet.minepi.com`
- Expected protocol target: 28, subject to live verification.
- Exact network passphrase must be supplied through protected configuration and match both Horizon and Soroban RPC.
- Mainnet deployment and writes remain disabled.

The Unity Sphere network adapter now fails closed unless network selection, approved endpoint hosts, passphrase, protocol and RPC health checks agree. It reports endpoint reachability separately from verified network identity.

## 4. Pi SDK wallet boundary

The official Pi Client SDK defines `wallet_address` as a separate authentication scope. Unity Sphere now requests username and wallet-address permissions for normal connection and requests payment permission only when a payment is explicitly initiated.

The returned wallet address binds a Pi account to an address. It does not expose the private key or prove arbitrary Soroban transaction signing capability. PiDEX must not treat account authentication as permission to submit an AMM transaction.

## 4A. Live Pi Testnet read-only evidence — 2026-11-08

The Unity Sphere focused validation workflow verified Pi Testnet identity using the explicit `Pi Testnet` passphrase:
- Horizon and Soroban RPC reachable.
- Both passphrase checks matched.
- Soroban RPC healthy, protocol 28.
- Horizon supported protocol 29.
- Latest ledger observed: 27,596,965.

The seven contract IDs currently stored in the Unity Sphere layer registry all returned `NOT_FOUND` on this verified Pi Testnet profile: root, sacral, solar, heart, throat, crown and gold-unmapped. This proves those registry references are not deployed contract instances on this network at the probe time. They remain unverified metadata and must not be represented as active tokens, balances, reserves or tradable assets.

The probe is read-only and does not establish that no other assets exist on Pi Testnet.

## 5. PiDEX and contract status

- PiDEX browser order entry, balances, fills and liquidity remain local simulation data.
- The AMM reference contract has been proposed for canonical ownership in SmartContracts PR #1108.
- The PiDEX core subscription gate previously returned unconditional success without querying PiRC-2. Unity Sphere PR #52 changes this placeholder to fail closed and adds a denial test. The actual PiRC-2 cross-contract adapter remains incomplete.
- A real PiDEX launch requires verified token contracts, an allowlisted AMM deployment, code-hash readback, wallet signing, liquidity, min-out/slippage checks, event reconciliation and security review.

## 6. Asset registry and seven-layer migration

PiRC's current main README defines the conceptual seven-color sequence as Red, Orange, Yellow, Green, Blue, Indigo, Purple. Unity Sphere's existing L0–L6 mapping differs and contains a Gold registry entry without a matching canonical layer mapping; Indigo has no verified matching contract in the current registry.

This conflict is not silently resolved. A versioned migration must preserve historical identifiers, explicitly classify Gold, retain Indigo as a separate proposal until verified, and include API compatibility tests. All repository-sourced contract IDs remain UNVERIFIED until network readback confirms contract instance, code hash, issuer authority and asset metadata.

## 7. Contract and settlement controls

The SmartContracts audit documents repeated source templates across numbered crates. Contract directory counts do not establish feature completeness. Only independently implemented, compiled, tested and reviewed modules may advance through the release lifecycle.

For economic settlement, Unity Sphere must consume the canonical ABI specified by the SmartContracts event-consumer document, pin the exact commit, decode XDR, verify transaction status, read canonical contract state and compare the settlement digest. Raw event ingestion is not settlement finality.

OUSD remains TEST ONLY: no USD peg, reserve backing or redemption claim is established.

## 8. Protocol and upgrade policy

- Stellar Protocol 18 / CAP-38 describes native constant-product AMM ledger functionality; it is not a Pi velocity multiplier.
- Pi Protocol V28 compatibility remains UNVERIFIED until exact runtime, SDK, WASM and host-function tests are recorded.
- Pi protocol version, Soroban SDK, contract ABI, schema version and app release version must be tracked independently.
- Testnet success does not authorize Mainnet promotion.

## 9. Required evidence before Testnet1 activation

1. Green CI on the exact PR heads.
2. Verified Pi Testnet Horizon and Soroban network identity.
3. Reproducible WASM build and hash for every allowlisted contract.
4. Testnet deployment transaction, contract ID and code-hash readback.
5. Initialized contract state, admin/issuer authority and negative authorization tests.
6. Pi Browser and Pi Developer Sandbox authentication checks.
7. A supported wallet-signing flow for Soroban transactions, separate from Pi account authentication.
8. PiDEX AMM functional tests with verified test tokens and real Testnet readback.
9. PiRC-2 subscription cross-contract authorization tests.
10. Idempotent event decoding, transaction finality and contract-state reconciliation.
11. Asset issuer/metadata/supply synchronization with network and ledger provenance.
12. Independent security review, monitoring and rollback evidence.

Unknown values must remain `null` or `UNVERIFIED`. No address, screenshot, branch name, API health response or successful frontend build may be substituted for deployment evidence.
