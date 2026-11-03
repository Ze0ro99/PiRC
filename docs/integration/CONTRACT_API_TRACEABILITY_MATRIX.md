# Contract and API Traceability Matrix — Evidence Snapshot

**Snapshot date:** 2026-11-03  
**Purpose:** Connect PiRC requirements to the actual SmartContracts and Unity Sphere source artifacts inspected for this integration pass.  
**Status:** Audit and integration planning; this is not a deployment, audit, or compatibility certificate.

## 1. Evidence rules

The matrix distinguishes file presence from executable behavior. A Rust file in a numbered crate, a JSON schema, a README status badge, or a branch name is not sufficient evidence of implementation.

Use these states:

- **PRESENT** — source/schema file exists at the inspected ref.
- **PARTIAL** — a limited implementation or schema exists, but required controls or behavior are missing.
- **NOT MAPPED** — no verified implementation mapping was established in this pass.
- **UNVERIFIED** — tests, CI, deployment, or runtime evidence was not obtained.
- **BLOCKED** — a concrete security or interface issue must be resolved before integration.

## 2. Cross-repository ownership

| Concern | Source of truth | Implementation owner | Consumer |
|---|---|---|---|
| Normative requirement, version, acceptance criteria | PiRC | PiRC maintainers | SmartContracts and Unity Sphere |
| Soroban ABI, storage, authorization, events | PiRC interface specification | SmartContracts | Unity Sphere adapters |
| API request/response and UI workflows | PiRC versioned API/schema registry | Unity Sphere | PiRC clients and operators |
| Network identity and transaction submission | Network profile in PiRC | Unity Sphere adapter + contract integration | Operator |
| Release evidence and feature state | PiRC traceability registry | All three repositories | Release reviewers |

A cross-repository feature is not ready until the specification version, schema/interface version, contract implementation, consumer adapter, and test evidence all refer to the same feature revision.

## 3. Inspected implementation samples

| Feature | PiRC / standard reference | SmartContracts default branch | Unity Sphere default branch | Current assessment |
|---|---|---|---|---|
| PiRC-101 identity | Standard reference listed in SmartContracts coverage inventory | `contracts/pirc_101/src/lib.rs` stores a DID string and 32-byte metadata hash by address | No matching consumer/API contract verified in this pass | **PARTIAL / UNVERIFIED** — caller auth exists for registration, but DID method semantics, controller policy, rotation, revocation, schema validation and lifecycle events are not established |
| PiRC-202 adaptive utility gate | `PiRC-202/README.md`; schema `PiRC-202/schemas/pirc202_utility_gate.json` | No verified corresponding default-branch contract mapping in this pass | `PiRC-202/contracts/adaptive_gate.rs` and schema are present | **BLOCKED** — `update_threshold` and `update_phi_guard` have no authorization check; the score is supplied by the caller; schema is descriptive only and does not authenticate the score |
| PiRC-203 merchant oracle | `PiRC-203/README.md`; schema `PiRC-203/schemas/pirc203_merchant_oracle.json` | Default-branch coverage inventory reports a generic crate mapping, not a verified oracle implementation | `PiRC-203/contracts/oracle_median.rs` and schema are present | **PARTIAL / BLOCKED** — prices are function arguments, not authenticated observations; no reporter allowlist, freshness, sequence, quorum, outlier policy, or signed source evidence; arithmetic needs checked bounds and explicit units |
| PiRC-204 reward engine | `PiRC-204/README.md` and reward schema (not revalidated in this pass) | No verified matching contract mapping established | `PiRC-204/contracts/reward_engine_enhanced.rs` | **PARTIAL / BLOCKED** — floating-point arithmetic and implicit 314/10,000 base factor; no eligibility proof, deterministic remainder allocation, cap, treasury authorization, or conservation invariant |
| Registry / asset lifecycle | PiRC registry standard and schema registry | Default-branch generic asset templates are not evidence of a secure registry; separate V2/V3 reference modules are described in SmartContracts integration-branch documentation | Registry UI/API paths require per-route verification | **NOT READY** — use the dedicated registry reference crate only after pinning its branch/SHA, compiling, testing, and reviewing it |
| Oracle V2 / reserve attestation | PiRC oracle and reserve standards | SmartContracts documents separate V2 reference crates on its integration branch; default-branch generic templates must not be conflated with them | Unity Sphere schemas and adapters are not yet proven ABI-compatible with those crates | **UNVERIFIED** — pin exact source refs and compare generated Soroban specs before wiring consumers |

## 4. Material source findings

### 4.1 SmartContracts workspace

The inspected default-branch workspace pins `soroban-sdk = 22.0.11` and includes `contracts/*` as workspace members. Its own audit records 106 Rust source files but only four distinct Rust source contents by Git blob SHA, with large sets of numbered crates reusing templates.

The audit specifically identifies the PiRC-101 identity template and generic asset templates. The generic asset template must not be represented as a production registry, decentralized oracle, or proof-of-reserves implementation. The repository README describes newer registry V3, oracle V2, reserve-attestation V2, and AI-oracle reference crates as integration-branch work; those are separate from the inspected default-branch code and are explicitly not deployed.

**Integration rule:** do not silently copy a branch-only reference crate into the default-branch coverage count. Record its branch/ref, immutable commit SHA, source path, test run, and review state independently.

### 4.2 Unity Sphere samples

The inspected PiRC-202 utility-gate contract exposes threshold and guard updates without an authorization check, while accepting the engagement score as a caller-supplied argument. Its README calls the plugin production-ready, but the source sample does not support that claim. The status must remain proposed/partial until authorization, trusted score provenance, boundary tests, and end-to-end evidence exist.

The inspected PiRC-203 oracle sample computes a median from three caller-supplied integer values and applies a fixed 95% factor. This is a calculation helper, not a secure oracle network: it does not authenticate venues/reporters, prove freshness, prevent replay, establish quorum, or document price precision and quote units.

The inspected PiRC-204 reward sample uses `f64` and a hard-coded 314 basis-point-style factor. It must not be used for on-chain accounting or deterministic payout until replaced with fixed-point/integer arithmetic, explicit units, authorization, eligibility, caps, and conservation tests.

### 4.3 Manifest and claims

The inspected Unity Sphere `MASTER_MANIFEST.md` contains a verification assertion but no populated explorer transaction rows in the visible table. The inspected developer guide describes automatic token rewards and swaps without accompanying verified transaction, reserve, issuer, or authorization evidence in the reviewed excerpt. Those statements are not accepted as deployment proof.

## 5. Required interface contract

Every cross-repository feature must publish and pin:

1. Stable feature ID and PiRC specification revision.
2. JSON schema identifier/version and compatibility policy.
3. Contract crate path, source ref/SHA, exported function names, argument/return types, storage keys, and event topics.
4. Authorization matrix for initialize, mutate, pause, upgrade, and emergency actions.
5. Atomic units, precision, bounds, overflow behavior, and deterministic rounding.
6. API route, request/response examples, error model, idempotency key, and network identity.
7. Unit, integration, boundary, replay, unauthorized-caller, and adversarial tests.
8. CI run URL and immutable build artifact hash.
9. Deployment network, transaction/ledger reference, contract ID, WASM hash, and readback evidence where deployed.
10. Threat model, independent reviewer, operational owner, monitoring, and rollback procedure.

Unknown values must be recorded as `UNVERIFIED` or `null`; never infer an ABI from a folder name or invent a deployment reference.

## 6. Mandatory remediation gates

| Gate | Required change | Acceptance evidence |
|---|---|---|
| G-01: authorization | Add role/owner checks to every privileged state mutation; test unauthorized callers | Negative authorization tests for every privileged entry point |
| G-02: trusted inputs | Replace caller-asserted oracle/engagement values with authenticated, freshness-checked observations | Reporter authorization, sequence/replay protection, expiry and source provenance tests |
| G-03: deterministic math | Remove floating-point arithmetic from monetary/reward paths; define atomic units and checked operations | Integer/fixed-point tests, boundary/overflow tests, sum-of-allocation invariant |
| G-04: schema/ABI parity | Generate or export contract interface artifacts and validate API/schema consumers against them | Automated compatibility test in CI |
| G-05: lifecycle safety | Define one-time initialization, pause/emergency authority, upgrade policy, and event emission | State-transition and adversarial tests |
| G-06: release provenance | Pin branch/SHA, SDK/toolchain, network, artifact hash and deployment readback | Reproducible build report and signed release evidence |

## 7. Low-cost execution sequence

1. Documentation-only: run the PiRC documentation/schema validator.
2. Schema/API changes: run schema compatibility and targeted API smoke tests.
3. Rust contract changes: run `cargo fmt --check`, `cargo test --workspace`, and the repository's pinned Soroban/WASM build in SmartContracts CI.
4. Interface changes: run a focused cross-repository contract-spec/schema compatibility job.
5. Release candidate only: perform Testnet deployment/readback and a manual Desktop package/install test.
6. Mainnet promotion: require independent security review and explicit human release approval.

Do not run full deployment, pull large model images, or submit Testnet/Mainnet transactions for documentation-only changes.

## 8. References

- SmartContracts default branch: https://github.com/Ze0ro99/SmartContracts/tree/main
- SmartContracts contract coverage audit: https://github.com/Ze0ro99/SmartContracts/blob/main/docs/CONTRACT_COVERAGE_AND_SECURITY_AUDIT.md
- SmartContracts standards coverage inventory: https://github.com/Ze0ro99/SmartContracts/blob/main/docs/PIRC_STANDARDS_COVERAGE_MATRIX.md
- Unity Sphere default branch: https://github.com/Ze0ro99/project-unity-sphere-0e2c810d/tree/main
- PiRC cross-repository implementation traceability: ../integration/IMPLEMENTATION_TRACEABILITY_MATRIX.md
