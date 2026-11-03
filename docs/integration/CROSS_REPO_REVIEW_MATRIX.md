# Cross-Repository Integration and Review Matrix

**Status:** Draft integration plan — not a merge approval or deployment attestation.  
**Scope:** PiRC, SmartContracts, Unity Sphere. Source branches remain preserved.

## Review targets

| Repository | Pull request | Primary ownership | Current change focus | Acceptance gate |
|---|---|---|---|---|
| PiRC | [#342](https://github.com/Ze0ro99/PiRC/pull/342) | Normative specs, economics, governance, schemas | Master architecture, branch/source audit, seven-color mapping, OUSD test-only profile | Standards consistency, claims review, cross-links, source evidence |
| SmartContracts | [#1091](https://github.com/Ze0ro99/SmartContracts/pull/1091) | Soroban contract code and deterministic tests | Reference contracts plus capped OUSD test-only token | Rust formatting, unit tests, WASM build, authorization review, dependency scan |
| Unity Sphere | [#30](https://github.com/Ze0ro99/project-unity-sphere-0e2c810d/pull/30) | UI, APIs, adapters, operations | Network-scoped asset/logo routes, Pi Testnet endpoint probes, PiDEX logo wiring, OUSD test-only UI | Python tests, frontend build, route smoke tests, Vercel deployment verification |

All three PRs remain Draft as of this audit. Their existing diffs are broader than the incremental changes described here; reviewers should evaluate each file against its owning repository and split unrelated changes where practical.

## Data and dependency flow

1. **PiRC** defines the schema, asset lifecycle states, network boundaries and OUSD test-only policy.
2. **SmartContracts** implements reference contract behavior and tests. Contract IDs remain null in application metadata until a specific deployment is evidenced.
3. **Unity Sphere** reads the registry, displays provisional logos and status labels, probes Pi Testnet endpoints, and performs contract-instance readback through Soroban RPC.
4. A contract-instance readback proves only that an instance ledger entry was found. It does not prove source code identity, WASM hash, issuer authority, audit, reserves, redemption or production safety.
5. PiDEX must remain in Simulation Mode until the trading engine is connected to verified contracts and live market/liquidity data with explicit user authorization.

## Network endpoints

- Pi Testnet Horizon: https://api.testnet.minepi.com
- Pi Testnet Soroban RPC: https://rpc.testnet.minepi.com
- Network passphrase: `Pi Testnet`

Official references:
- https://developers.minepi.com/docs/use-native-features/Tokens
- https://minepi.com/blog/rpc-server/

Endpoint configuration is not proof that an individual address is deployed. The API's network-health route checks reachability; the verification route checks the contract-instance ledger entry and keeps code hash and issuer checks explicitly unverified.

## Seven-color mapping gate

The source proposal defines Red, Orange, Yellow, Green, Blue, Indigo and Purple. The CSV/contract registry contains Red, Orange, Yellow, Green, Blue, Gold and Purple. Indigo has no matching contract in the registry, while Gold has no matching chakra-layer definition. Keep both records visible as a source mismatch; do not relabel a contract or silently assign an address.

## OUSD gate

OUSD is a test-only reference asset:
- no contract ID is published before deployment;
- no USD peg, reserves, redemption, issuer or market price is claimed;
- the contract is admin-mintable under a software cap and is not deployed;
- PiDEX labels it TEST ONLY and does not enable trade, mint or redemption actions.

Any move toward a real stable asset requires a separate issuer/legal/reserve/custody/redemption design and independent evidence.

## Required CI and release evidence

- [ ] API unit tests pass.
- [ ] Frontend build and Node tests pass.
- [ ] OUSD contract unit tests and WASM build pass.
- [ ] Security and dependency checks pass.
- [ ] Vercel preview deployment succeeds.
- [ ] HTTP smoke tests return expected status and content type for /v1/health, /v1/assets, all seven logo routes, Gold, OUSD, and contract verification.
- [ ] Pi Testnet Horizon and Soroban RPC probes succeed from the deployed environment.
- [ ] Each contract ID is checked against the Pi Testnet Soroban RPC; results, ledger sequence and observation time are recorded.
- [ ] WASM/code hashes and deployment transaction IDs are independently verified.
- [ ] Reviewers approve the source mismatch, threat model, scope and claims.

Until these checks pass, do not mark the integration complete, merge all PRs together, or deploy to Mainnet.
