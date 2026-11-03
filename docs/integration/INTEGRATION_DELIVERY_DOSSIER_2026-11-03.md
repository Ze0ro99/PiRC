# Cross-Repository Integration Delivery Dossier — 2026-11-03

**Status:** Engineering integration baseline; implementation and deployment gates remain open.  
**Scope:** PiRC, SmartContracts, and Unity Sphere.  
**Authority:** PiRC owns normative requirements; implementation repositories own executable behavior in their domains.

## 1. Executive summary

The integration is organized around three independently versioned repositories:

| Repository | Authoritative responsibility | Must not claim |
|---|---|---|
| PiRC | Standards, economics, schemas, layer taxonomy, acceptance criteria, traceability | That a proposal is official Pi policy or deployed |
| SmartContracts | Soroban ABI, storage, authorization, invariants, events, contract tests | That a crate directory or source file proves deployment or security |
| Unity Sphere | UI, API, network adapters, indexing, operations, evidence presentation | That client values, repository labels, or simulated metrics prove chain state |

The integration strategy is selective. Original branches remain intact; only reviewed, bounded changes are carried into the integration branch. Large branch merges and branch-harvesting automation are not accepted as an integration method.

## 2. Baseline artifacts

### PiRC
- `reference/economic_engine.py` — deterministic reference accounting and allocation.
- `tests/test_economic_engine.py` — reference tests.
- `fixtures/economic-engine-vectors.json` — shared expected cases.
- `docs/economics/ECONOMIC_ENGINE_EXECUTION_SPEC.md` — accounting semantics.
- `docs/standards/ORACLE_ENGINE_EXECUTION_SPEC.md` — observation validation requirements.
- `schemas/v1/*` — versioned message contracts.
- `registries/seven-layer-registry.v1.json` — proposal taxonomy and unresolved Gold/Indigo conflict.
- `docs/integration/CONTRACT_API_TRACEABILITY_MATRIX.md` — evidence mapping.

### SmartContracts
- `contracts/pirc_207_registry_v3` — registry reference module.
- `contracts/pirc_214_oracle_v2` — authenticated reporter observation store; not yet a quorum oracle.
- `contracts/pirc_225_por_v2` — auditor attestation record; not independent custody proof.
- `fixtures/economic-engine-vectors.json` — parity fixture copy.
- `scripts/test_economic_vectors.py` — standard-library arithmetic fixture validator.
- `docs/ECONOMIC_SETTLEMENT_PARITY_GATE.md` — Soroban acceptance gate.

### Unity Sphere
- `api/asset_registry.py` — local read-only registry API.
- `docs/integration/ECONOMIC_ENGINE_API_CONTRACT.md` — proposed settlement API boundary.
- `schemas/v1/economic-settlement-request.schema.json` — request validation schema.
- `docs/INTEGRATION_GAP_REGISTER.md` and branch intake review — source and risk findings.

Paths are repository evidence references, not statements that every artifact has passed CI or runtime verification.

## 3. Required end-to-end flow

1. PiRC publishes a versioned economic rule, asset identity schema, network profile, and golden vectors.
2. SmartContracts implements the state transition with explicit authorization, checked arithmetic, replay protection, and events.
3. Unity Sphere validates a request, resolves authoritative inputs from configured sources, simulates or prepares the transaction, and obtains explicit operator authorization.
4. A configured signer submits only to an explicitly selected network and allowlisted contract.
5. The adapter waits for final transaction status, reads contract state back, and compares period ID, totals, asset ID, and event data.
6. An evidence record stores source commit, schema versions, network, contract ID, transaction hash, code hash, verification time, and test results.
7. UI displays the exact evidence state; absent evidence is shown as UNVERIFIED, never inferred as ACTIVE or LIVE.

## 4. Economic trust boundaries

- Collected revenue is not forecast revenue, token price, TVL, market capitalization, or hypothetical GCV value.
- Internal reference values and external market quotes are separate data types and cannot be silently converted into redemption claims.
- A reserve attestation is a signed auditor statement; the contract does not independently inspect bank accounts, custodians, or physical assets.
- Eligibility, contribution weights, identity checks, and dispute outcomes require separately specified evidence and appeal controls.
- A positive distributable result does not authorize payment. Contract authorization, period closure, eligibility, and operator policy remain independent gates.

## 5. Status vocabulary

| Status | Meaning | Minimum evidence |
|---|---|---|
| PROPOSED | Design or policy concept | Versioned specification |
| IMPLEMENTED | Code exists for defined behavior | Source + tests |
| CI-VERIFIED | Required CI passed on exact commit | Successful workflow run |
| TESTNET-VERIFIED | Exact contract and API tested on named testnet | Tx hash, code hash, readback, logs |
| AUDITED | Independent review completed | Dated report and scope |
| MAINNET-VERIFIED | Exact deployed code and behavior independently read back | Network, address, tx, WASM hash, timestamp, evidence |
| UNVERIFIED | Evidence absent or incomplete | Explicitly recorded gap |

Do not skip statuses or promote a component based on a README label.

## 6. Open integration blockers

1. Soroban economic settlement implementation does not yet consume the shared golden fixture.
2. Contract replay protection and period-close semantics need implementation and tests.
3. Unity Sphere settlement endpoint is a specification, not a live transaction path.
4. Oracle V2 stores an authenticated reporter observation but does not implement source quorum, aggregation, or independent data truth.
5. Proof-of-reserves V2 records attestations but does not prove custody or enforce freshness policy by itself.
6. Asset provenance must bind canonical network, identifier type, issuer, deployment transaction, code hash, metadata hash, and readback evidence.
7. Seven-layer taxonomy must preserve Gold as unresolved; no silent Gold/Indigo alias.
8. Pi Desktop 0.6.4 compatibility requires a pinned build and runtime evidence.

## 7. Definition of done

A cross-repository feature is complete only when:
- PiRC requirement and schema versions are pinned.
- Contract ABI and storage are mapped to the requirement.
- Positive, negative, boundary, authorization, replay, and upgrade tests pass.
- Unity API validates inputs and does not trust client-computed financial values.
- Testnet transaction and readback evidence exist where network execution is in scope.
- Security review and least-privilege workflow review are complete.
- Release evidence identifies exact commits and artifacts.
- User-facing claims match the strongest available evidence state.

## 8. Change control

Breaking schema or ABI changes require a major version and migration plan. Additive optional fields require backward-compatibility tests. Never repurpose an existing layer ID, asset ID, network alias, or contract identifier. Keep unresolved taxonomy decisions explicit until a reviewed decision record closes them.
