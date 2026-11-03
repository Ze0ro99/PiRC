# Branch Feature Intake and Evidence Register

**Scope:** Git branches and repository artefacts in the PiRC ecosystem.  
**Review basis:** GitHub branch refs and recursive trees inspected on 2026-11-03. This is a discovery register, not proof that every branch commit or every file has been semantically reviewed.

## 1. Repository inventory

| Repository | Branch refs discovered | Main-tree files/paths observed | Notes |
|---|---:|---:|---|
| Ze0ro99/PiRC | 164 | 9,100 paths | Large nested full-repository snapshots and isolated workspaces exist; exclude vendored caches and nested copies from source-of-truth selection. |
| Ze0ro99/SmartContracts | 281 | 660 paths | Main README reports 106 Rust source files but only four distinct Rust contents by Git blob SHA; many numbered crates are templates/scaffolds. |
| Ze0ro99/project-unity-sphere-0e2c810d | 149 | 19,771 paths | Contains application code, contract adapters, copied repository trees, legacy code and generated/static assets. |

Branch counts are point-in-time discovery counts. Branches are not automatically merge candidates. The same branch name across repositories does not imply identical content or synchronized commits.

## 2. High-value isolated work areas found

- `Raw`: exists in PiRC and Unity Sphere. The PiRC Raw branch has a compact 208-entry tree; Unity Sphere Raw contains a much larger application/contract workspace. Treat them as distinct snapshots.
- `omni-factory-release`: PiRC and Unity Sphere contain a factory/RWA package with `Omni_Sovereign_Architecture/04_Physical_RWA_Environment` and `05_Sovereign_Smart_Contract_Factory`.
- `feature/v3-auto-pr-factory`: automation workflow branch family; inspect workflow permissions and write targets before enabling.
- `feature/quantum-legacy-core` and `feature/quantum-legacy-optimized`: research/legacy crypto work; not evidence of production PQ security.
- `feat/pirc-06-ai-oracles`, `feat/pirc-07-governance-execution`, `feat/pirc-08-rwa-tokenization`, `feat/pirc-09-liquidity-amm`, `feat/pirc-212-autonomous-agent`, `feat/pirc-213-224-rwa`: feature branch families requiring per-commit diff and test review.
- `rwa/spec-v0.3`, `rwa/examples`, `security/rwa-threats`: useful RWA specification and threat-model sources.
- SmartContracts includes reference crates for OUSD test token, oracle V2, AI oracle, registry and proof-of-reserves. Their presence is not deployment evidence.

## 3. Confirmed implementation gaps from inspected source

| Area | Observed artefact | Current evidence | Required disposition |
|---|---|---|---|
| RAW factory | `raw_record_factory.rs` | Emits event and returns product ID; no child contract deployment | Mark scaffold; implement factory client/deployer, salt, code hash, registry, idempotency and read-back |
| Factory SDK | `raw_record_factory_sdk.js` | Returns placeholder `TX_HASH_QUANTUM_SECURED` | Replace placeholder; never expose fake transaction success |
| Physical proof | `possession_proof.rs` | Accepts a signature argument but returns `true` | Block production use; implement signature/device-key verification and revocation |
| Scanner relay | `nfc_vision_scanner.py` | Creates SHA-256 digest from user/product/time; no hardware signature | Treat as mock; add device identity, challenge-response and signed evidence |
| CEX/DEX simulation | `contracts/pi_dex_engine.rs` | Uses floating-point reserves and constant-product arithmetic | Simulation only; production math uses integer atomic units and checked arithmetic |
| PiDEX Soroban | `contracts/pidex_amm` | Reference AMM contract exists | Review complete functions, tests, token auth, fee accounting, slippage, reentrancy/callback assumptions, pause and read-back |
| Chainlink EVM adapter | `PiRCChainlinkConsumer.sol` | Reads configured AggregatorV3 feeds and forms a weighted basket | Verify chain/feed addresses, access, decimals, freshness, round integrity, coverage and supported network; EVM adapter is not automatically a Soroban feed |
| Soroban oracle V2 | `contracts/pirc_214_oracle_v2` | Authorized reporters, monotonic sequence, ledger timestamp | Single latest reporter record per feed; no demonstrated median/quorum/deviation aggregation in this crate |
| AI oracle | `contracts/pirc_237_ai_oracle` | Allowlisted updater, bounded scores, proof hash and model version | Proof hash is a commitment, not proof of inference correctness or ZK verification |
| OUSD | `contracts/ousd_test_token` | Test-only token, 7 decimals, admin mint/burn, fixed cap | No peg, reserve, redemption, collateral, liquidation or backing mechanism |
| PQ crypto | `quantum-legacy` research | Legacy hooks and readiness note | No production PQ claim; validate algorithms, libraries, key sizes, verification and protocol support |

## 4. Branch intake workflow

1. Enumerate branch name, head SHA, last commit date and upstream/base relation.
2. Compare each candidate to the current main commit; record ahead/behind and changed files.
3. Classify files: normative spec, implementation, test, simulation, generated asset, vendored dependency, duplicate snapshot, workflow/automation, secret/config.
4. Extract requirements and link each to an issue/spec ID.
5. Run static analysis, schema validation, tests and supply-chain checks in isolated CI.
6. Inspect deployment/signing workflows manually; deny privileged actions by default.
7. Create a small PR per coherent capability, with rollback and migration plan.
8. Merge only after review, required checks and evidence links are complete.

## 5. Prohibited shortcuts

- No blind merge of all branches.
- No force-push or deletion of source branches as part of intake.
- No execution of scripts that stage/commit/push or deploy without human review.
- No production signing keys in browser, agent prompt, repository or CI logs.
- No assertion of live contracts from a filename, README status badge or old RAW snapshot.
- No feature auto-acceptance by an AI agent.

## 6. Acceptance record

For each accepted feature, record: repository, branch, source SHA, PR, merge SHA, spec ID, tests, security reviewer, deployment environment, contract ID/code hash, transaction reference, read-back result, owner and rollback status.
