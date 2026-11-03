# Cross-Repository Implementation Traceability Matrix

**Status:** Release engineering control document  
**Repositories:** PiRC, SmartContracts, Unity Sphere  
**Rule:** A specification is not implemented merely because a document, branch, API route, contract crate or UI label exists.

## 1. Evidence states

Use exactly one state per feature and environment:

| State | Meaning | Minimum evidence |
|---|---|---|
| PROPOSED | Idea or research concept | Proposal link and owner |
| SPECIFIED | Normative behavior is documented | Versioned specification and schemas |
| IMPLEMENTED | Code exists in the owning repository | Commit SHA, code path and reviewer |
| TESTED | Automated tests pass | CI run URL, test command and artifact |
| TESTNET_VERIFIED | Behavior observed on named test network | Network ID, transaction/ledger reference, timestamp and readback |
| SECURITY_REVIEWED | Threat model and security review completed | Review record, findings and disposition |
| MAINNET_VERIFIED | Production behavior independently evidenced | Mainnet transaction, code/WASM hash, release approval and monitoring |
| BLOCKED | A required dependency or gate is unresolved | Blocking issue, owner and next action |

Never skip a state based on a README, screenshot, branch name, API health response or contract-instance existence alone.

## 2. Ownership and source of truth

| Domain | Normative owner | Implementation owner | Evidence owner |
|---|---|---|---|
| Economic standards and value taxonomy | PiRC | Unity Sphere adapters | PiRC maintainers |
| Asset lifecycle and registry schema | PiRC | SmartContracts + Unity Sphere | Cross-repository reviewers |
| OUSD token behavior | PiRC specification | SmartContracts | Contract reviewers |
| OUSD registry and TEST ONLY presentation | PiRC specification | Unity Sphere | API/UI reviewers |
| Oracle policy | PiRC | SmartContracts + approved adapters | Oracle/security reviewers |
| Payment intent and commerce events | PiRC | Unity Sphere + wallet/contract adapters | Integration reviewers |
| Settlement contracts | PiRC interface specification | SmartContracts | Contract/security reviewers |
| PiDEX simulation and execution boundary | PiRC policy | Unity Sphere | Market-integrity reviewers |
| Treasury/revenue/distribution | PiRC economic specification | Application and contract owners | Accounting/legal reviewers |
| Release manifest and gates | PiRC | CI in all repositories | Release owner |

## 3. Required traceability record

Every feature must have a row containing:
- stable feature ID and specification version;
- source branch/ref and immutable commit SHA;
- owning repository and implementation path;
- API/schema/contract interface version;
- unit, integration and adversarial test references;
- CI run URL and result;
- environment/network identifier;
- deployment transaction and ledger reference, if deployed;
- contract ID, WASM/code hash and issuer evidence, if applicable;
- security findings, reviewer and approval;
- operational owner, monitoring and rollback plan;
- current state and unresolved blockers.

Unknown values must be `null` or `UNVERIFIED`; do not fill gaps with inferred values.

## 4. Minimum feature coverage

| Feature | PiRC specification | SmartContracts implementation | Unity Sphere integration | Required evidence before activation |
|---|---|---|---|---|
| Seven-color mapping | Source mapping and mismatch record | Registry constants/tests | Registry and logo routes | Mapping tests; Gold/Indigo discrepancy explicitly retained |
| Internal/external value separation | Value taxonomy and bridge spec | No automatic conversion contract | Typed quote and valuation APIs | Schema tests, quote expiry, UI disclosure |
| OUSD test token | Test-only profile | Capped admin-mintable reference token | Test-only registry/UI | Contract tests, WASM build, test deployment readback |
| Oracle | Quorum/freshness/deviation policy | Feed/round verification | Source adapters and health | Adversarial tests and signed round evidence |
| PiCash | Payment/commerce standards | Settlement interfaces where needed | Merchant/payment workflow | End-to-end Testnet transaction and reconciliation |
| Pi Bank | Custody/treasury controls | Multisig/timelock interfaces | Institutional operations UI | Legal authority, custody evidence, security review |
| PiDEX | Market-integrity and liquidity policy | Pool/swap contracts where implemented | Simulation and routing | Verified pools, liquidity, execution, slippage and user consent |
| Treasury | Revenue and distribution model | Treasury controls | Accounting/reconciliation | Collected revenue evidence and independent reconciliation |
| AI agents | Capability and safety policy | On-chain authorization boundaries if applicable | Read-only scoped agent tools | Permission tests; no autonomous signing |
| V18 metrics | Metric definitions and denominators | Event emission as applicable | Reconciled event pipeline | Deterministic aggregation tests and data-quality report |

## 5. Cross-repository compatibility gates

- Pin Rust toolchain, Soroban SDK, WASM target, JavaScript runtime, frontend framework and Python runtime.
- Record Pi protocol version independently from Soroban SDK and application release versions.
- Treat endpoint reachability as connectivity evidence, not protocol compatibility or deployment proof.
- Validate network passphrase and network identifier at every transaction boundary.
- Generate and compare contract interface/spec artifacts between implementation and consumers.
- Fail CI on schema incompatibility, missing required evidence, secrets, unsafe dependency drift or unreviewed Mainnet configuration.
- Require reproducible build artifacts and content hashes for release candidates.

## 6. Current known coordination state

The companion pull requests SmartContracts #1091 and Unity Sphere #30 have been merged according to GitHub PR metadata. PiRC #342 remains open and is the outstanding architecture/specification PR. Their merge status does not by itself prove that every integration test, deployment, security review or Mainnet gate has passed.

Before declaring the ecosystem complete, re-run CI on the current default branches and pin the exact merge commits and dependency versions in the release manifest.

## 7. Release sign-off

- [ ] All feature rows have an owner, implementation path and evidence state.
- [ ] No feature is marked TESTNET_VERIFIED without a transaction/readback reference.
- [ ] No feature is marked MAINNET_VERIFIED without independent production evidence.
- [ ] No reserve, issuer, price, peg or redemption claim is inferred from a symbol or UI label.
- [ ] All three repositories use compatible schema and interface versions.
- [ ] Security, dependency, secret-scanning and reproducible-build gates pass.
- [ ] Rollback and incident response are documented.
- [ ] Human maintainers approve release promotion.
