# PiRC — Pi Requests for Comment

PiRC is a community-led research, standards, and reference-engineering workspace for a proposed Pi ecosystem. It connects economic models, governance proposals, application interfaces, Soroban reference contracts, and evidence-driven release processes.

> **Project status:** This repository is not an official Pi Network specification or product. Nothing here implies Pi Core Team endorsement, a guaranteed Pi price, a USD peg, a bank, an exchange, a redemption right, or production deployment. Specifications and implementations are proposals until independently reviewed and verified.

## 1. Vision and operating principles

The project explores how a modular, auditable application ecosystem could coordinate identity, authorization, governance, dispute handling, asset provenance, payments, commerce, settlement, oracle observations, risk controls, reserve attestations, treasury accounting, revenue-funded utility, application services, dashboards, monitoring, and release evidence.

Core principles:
1. **Explicit ownership:** every standard, contract, API, schema, and workflow has one authoritative owner.
2. **Versioned interfaces:** repositories integrate through versioned schemas and manifests, not by copying entire branches.
3. **Least privilege:** signing, payments, deployment, and destructive automation are isolated and require explicit authorization.
4. **Provenance:** record source, issuer, network, evidence, timestamp, verification state, and responsible authority.
5. **Reproducibility:** every lifecycle transition requires tests and evidence that another reviewer can reproduce.
6. **Conservative claims:** distinguish proposed, simulated, testnet-verified, audited, and mainnet-verified capabilities.

## 2. Repository map and source-of-truth boundaries

| Repository | Authoritative responsibility | Must not become |
|---|---|---|
| [PiRC](https://github.com/Ze0ro99/PiRC) | Normative proposals, standards, economics, governance, architecture, schema registry, release requirements | A claim that proposals are official Pi Network policy |
| [SmartContracts](https://github.com/Ze0ro99/SmartContracts) | Soroban/Rust contract source, public interfaces, storage, authorization, contract tests, build configuration | A folder-count proxy for implementation coverage |
| [Unity Sphere](https://github.com/Ze0ro99/project-unity-sphere-0e2c810d) | PiDEX/application UI, APIs, adapters, asset registry views, monitoring, operations | Evidence that simulated markets, assets, or reserves are live |

**Ownership rule:** PiRC defines what a standard requires; SmartContracts implements contract-level behavior; Unity Sphere consumes versioned interfaces and exposes application workflows. Changes crossing these boundaries require traceability updates and coordinated review.

## 3. System architecture

The architecture is organized into seven conceptual layers. Their colors and names are proposal/UI semantics, not official Pi Network token classes or deployed asset tiers.

| Layer | Color | Conceptual responsibility | Example scope |
|---:|---|---|---|
| 1 | Red | Root governance and protocol controls | Policy, roles, emergency authority |
| 2 | Orange | Basic utility reference | Low-complexity utility and exchange of value |
| 3 | Yellow | Extended utility reference | Commerce and service utility |
| 4 | Green | PiCash/payment proposal | Payment intents, merchant flows, accounting |
| 5 | Blue | Institutional interface proposal | Treasury, custody, institutional workflows |
| 6 | Indigo | Premium reserve proposal | Reserve evidence and restricted eligibility models |
| 7 | Purple | Mined Pi and fractional accounting representations | Provenance-aware balances and atomic-unit accounting |

The source material also contains a **Gold** registry entry. Gold is an unresolved registry taxonomy item; it is not silently treated as Indigo. Resolve this through a versioned registry migration and compatibility tests.

### High-level workflow

Pioneer / Merchant / Operator → identity and policy checks → application/API boundary → versioned asset and payment schemas → contract authorization and state transition → ledger/network adapter → event and evidence capture → reconciliation, monitoring, and governance review.

The application must never bypass contract authorization. External agents may prepare proposals or observations, but must not receive unrestricted signing or treasury execution authority.

## 4. Standards, architecture, and documentation map

### Architecture and integration
- [Master Architecture](docs/architecture/MASTER_ARCHITECTURE.md)
- [Seven-Layer Hybrid Stack](docs/architecture/SEVEN_LAYER_HYBRID_STACK.md)
- [Seven Colored Layers Source Mapping](docs/architecture/SEVEN_COLORED_LAYERS_SOURCE_MAPPING.md)
- [Economic Component Integration Map](docs/architecture/ECONOMIC_COMPONENT_INTEGRATION_MAP.md)
- [Cross-Repository Implementation Traceability Matrix](docs/integration/IMPLEMENTATION_TRACEABILITY_MATRIX.md)
- [Cross-Repository Review and Acceptance Matrix](docs/integration/CROSS_REPO_REVIEW_MATRIX.md)
- [External Component Compatibility Matrix](docs/integration/EXTERNAL_COMPONENT_COMPATIBILITY_MATRIX.md)
- [Branch Intake Inventory](docs/integration/BRANCH_INTAKE_INVENTORY.md)
- [Complete Branch Census](docs/integration/BRANCH_CENSUS.md)
- [Branch Head Audit](docs/integration/BRANCH_HEAD_AUDIT_2026-11-03.md)
- [Source Implementation Audit](docs/integration/SOURCE_IMPLEMENTATION_AUDIT_2026-11-03.md)

### Economic model and mathematics
- [Economic Mathematics](docs/economics/ECONOMIC_MATHEMATICS.md)
- [Monetary Model and Inflation Equations](docs/economics/MONETARY_MODEL_AND_INFLATION_EQUATIONS.md)
- [Monetary Model, Inflation, and Equations](docs/economics/MONETARY_MODEL_AND_INFLATION_EQUATIONS.md)
- [Economic System Integration Blueprint](docs/economics/ECONOMIC_SYSTEM_INTEGRATION_BLUEPRINT.md)
- [End-to-End Economic Lifecycle](docs/economics/END_TO_END_ECONOMIC_LIFECYCLE.md)
- [Treasury, Revenue, and Distribution Model](docs/economics/TREASURY_REVENUE_AND_DISTRIBUTION_MODEL.md)
- [Internal and External Value Bridge](docs/economics/INTERNAL_EXTERNAL_VALUE_BRIDGE_SPEC.md)

### Standards and evidence
- [Versioned Schema Registry](docs/standards/SCHEMA_REGISTRY.md)
- [Asset and Token Lifecycle](docs/standards/ASSET_TOKEN_LIFECYCLE_AND_LAUNCHPAD.md)
- [Oracle Data Quality and Governance](docs/standards/ORACLE_DATA_QUALITY_AND_GOVERNANCE.md)
- [Commerce Valuation and Provenance](docs/standards/COMMERCE_VALUATION_AND_PROVENANCE_STANDARD.md)
- [AI Agent Capability and Safety](docs/standards/AI_AGENT_CAPABILITY_AND_SAFETY_STANDARD.md)
- [Pi Testnet1 Network Profile](docs/standards/PI_TESTNET1_NETWORK_PROFILE.md)
- [Testnet1 Release Gates and Mainnet Readiness](docs/standards/TESTNET1_RELEASE_GATES.md)
- [OUSD Test-Only Asset Profile](docs/standards/PiRC-OUSD-TEST.md)

### External desktop and distribution references
- [SoloHost package contract](https://github.com/pi-node/solohost/blob/main/skills/solohost-package/references/contract.md)
- [SoloHost package skill](https://github.com/pi-node/solohost/blob/main/skills/solohost-package/SKILL.md)
- [Hermes SoloHost reference package](https://github.com/pi-node/solohost/tree/main/skills/solohost-package/examples/hermes)
- [pi-node repository](https://github.com/pi-node/pi-node) — current public README reports 0.5.4; team-provided Desktop target 0.6.4 remains to be verified on-device.
- [External Component Compatibility Matrix](docs/integration/EXTERNAL_COMPONENT_COMPATIBILITY_MATRIX.md)

### Application and developer integration
- [PiRC API server](artifacts/api-server)
- [Vercel Pi Platform Setup](docs/deployment/VERCEL_PI_PLATFORM_SETUP.md)
- [Unity Sphere API and registry documentation](https://github.com/Ze0ro99/project-unity-sphere-0e2c810d/tree/main/docs/api)

## 5. Economic model: quantities, value, inflation, and limits

The project separates external observed price, internal reference value, delivered utility, collected revenue, reserve coverage, settlement liquidity, token supply, and velocity. These are different measures and must not be conflated.

### Illustrative ratio — arithmetic, not a peg

For research parameters P_i = 314,159 and P_e = 0.0314159:

\[
S = \frac{P_i}{P_e} = 10,000,000
\]

This is a mathematical ratio only. It does **not** authorize converting, redeeming, swapping, or settling one Pi at either value, and it does not establish a 10,000,000× arbitrage mechanism. Any economic use requires defined units, enforceable obligations, independently verified revenue/liquidity, eligibility, and an explicit conversion policy.

### Revenue-funded allocation

For distributable utility/revenue U and eligible participant weight w_i:

\[
B_i = U \cdot \frac{w_i}{\sum_j w_j}
\]

Preconditions: U ≥ 0, finite non-negative weights, a positive denominator, and eligibility resolved before calculation. Use integer atomic units, deterministic remainder allocation, and the invariant Σ B_i = U.

### Inflation and monetary discipline

The project distinguishes consumer-price inflation from token-supply growth. Supply expansion is not itself proof of consumer-price inflation; price effects depend on demand, velocity, productive output, market structure, and expectations. See the dedicated mathematical note for definitions, assumptions, and limitations.

## 6. Contract and API lifecycle

Every standard-to-code mapping must identify the normative specification and revision, acceptance criteria and invariants, contract crate and public interface, storage schema and authorization matrix, unit/integration/boundary/adversarial tests, threat model and dependency/toolchain versions, network profile, deployment transaction, contract ID, code hash, verification timestamp, and independent review status.

Use the lifecycle:

PROPOSED → SPECIFIED → IMPLEMENTED → TESTED → TESTNET_VERIFIED → AUDITED → MAINNET_VERIFIED

No state may be skipped. A source path or build success does not establish deployment or audit status.

### Current contract audit warning

The SmartContracts default-branch audit reports 106 Rust source files but only four distinct Rust file contents by Git blob SHA, with large groups of numbered crates reusing templates. Treat those crates as scaffolds unless their independent behavior, authorization, storage, tests, and invariants are demonstrated. The integration branch contains newer reference modules for registry, oracle observations, and reserve attestations; they remain un-deployed and require validation. See the [SmartContracts audit](https://github.com/Ze0ro99/SmartContracts/blob/main/docs/CONTRACT_COVERAGE_AND_SECURITY_AUDIT.md).

## 7. Pi Desktop 0.6.4 compatibility preparation

SoloHost and Hermes are treated here as components referenced by the team's **Pi Desktop 0.6.4 release context**. Their current role in this project is a **compatibility-preparation and capability-demonstration exercise**.

This statement does not mean their source repositories have been imported, that a production integration exists, or that compatibility has been independently certified. The compatibility proof must record:
1. exact desktop release and runtime/platform;
2. component identity, version, and source provenance;
3. supported API/protocol and capability negotiation;
4. authentication and permission boundaries;
5. network, filesystem, process, and signing access requested;
6. test cases, logs, expected/actual outcomes, and known limitations;
7. reproducible evidence and reviewer sign-off.

Until those records exist, label the relationship **PREPARATION / NOT VERIFIED**. Do not grant signing, wallet, treasury, deployment, or destructive filesystem capabilities merely to demonstrate compatibility. See [Pi Desktop 0.6.4 Compatibility Preparation](docs/architecture/PI_DESKTOP_064_COMPATIBILITY_PROFILE.md).

## 8. Branch strategy and integration workflow

The 2026-11-03 branch census records **577 branch refs and 558 unique head commits** across the three repositories at census time. A branch name is not a feature specification and a unique commit is not automatically safe to merge.

Required intake sequence:
1. enumerate branch refs and deduplicate by commit SHA;
2. compare each unique head with its repository base;
3. inspect changed files and commit history;
4. classify changes as standards, economics, contracts, APIs, UI, workflows, or deployment;
5. map every accepted change to an owner, standard, tests, and evidence;
6. reject or isolate destructive, over-privileged, secret-bearing, or non-deterministic automation;
7. integrate in small, reviewable PRs;
8. run repository-native checks and cross-repository compatibility tests;
9. preserve original branches and history;
10. merge only after required reviews and checks pass.

Do not bulk-merge all branches. Some are duplicates, stale snapshots, automated repair branches, dependency updates, or workflows with destructive behavior. The branch census and intake/risk reviews are inventories and triage inputs, not blanket approval.

## 9. Security, secrets, and operations

- Never commit secret values, private keys, API tokens, seed phrases, or signing material.
- Keep credentials in GitHub/Vercel encrypted secret stores and scope them by environment.
- Use separate sandbox, Testnet, and production credentials.
- Fail closed when required credentials or network identity are missing.
- Require idempotency, replay protection, amount/product validation, and server-side payment verification.
- Require explicit allowlists, human approval, dry-run mode, and rollback plans for deployment.
- Do not activate workflows that harvest all branches, delete source directories, or deploy every discovered WASM artifact.
- Treat OUSD as test-only until issuer, reserve, custody, legal, and redemption evidence is independently established.
- Treat PiDEX market cards and local simulations as simulations unless venue, liquidity, and transaction execution are verified.

## 10. Development and validation

Use the repository's pinned package manager, lockfiles, toolchains, and workflow definitions. Typical checks include documentation/schema validation; TypeScript typecheck and frontend/API builds; Rust formatting, workspace tests, and target-specific WASM builds; contract authorization and invariant tests; API health, payment fail-closed, and idempotency smoke tests; cross-repository schema compatibility tests; dependency, secret, and static security scans.

A local pass is not a hosted deployment. A CI pass is not an independent security audit. A Testnet transaction is not Mainnet verification.

## 11. Contribution checklist

Every pull request should include the relevant PiRC standard(s) and revision, ownership boundary and affected repositories, schema/interface compatibility impact, threat model and permissions changed, tests and reproducible commands, evidence links and limitations, and migration/rollback/release notes where applicable.

Preserve source branches. Prefer focused PRs over broad merges. Do not commit secrets. Do not describe proposed or simulated capabilities as live.
