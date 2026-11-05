# Cross-Repository Engineering Status — 2026-11-05

**Purpose:** Evidence-based status of the PiRC, SmartContracts, and Unity Sphere repositories after the latest integration and environment remediation work.

**Scope:** Repository state and hosted CI evidence only. This report is not a release certification, deployment attestation, financial audit, or Pi Core Team statement.

## 1. Exact repository baselines

| Repository | Main commit | State |
|---|---|---|
| PiRC | `db09230b0fa97c0a04283283c21c031c4ac8524b` | Documentation and standards control plane |
| SmartContracts | `114eecd7ce294d980e0765a88c3b070c080aee6f` | Soroban contract workspace; current hardening work is still in PR #1105 |
| Unity Sphere | `45b775fa9deb7432a1a3be97e93257ae5c5b2f37` | API/UI integration and static frontend |

These are the exact main-branch commits observed when this report was prepared. Refresh all SHAs before release.

## 2. Changes merged into Unity Sphere main

| PR | Merge commit | Verified result |
|---|---|---|
| #43 | `8dbe633f4c1696b4c0dc73eda994d628d651f859` | Pi Testnet-scoped UI/read-only contract verification and build workflow |
| #45 | `c4a24e6622e4f65733cd7b49a1f33b324474619e` | Disabled unsafe push-triggered orchestration and the broken automatic writer |
| #46 | `5bdd3465a4f3ca258908c92f240c6a8a85294940` | Build-only static publishing; GitHub Pages receives the verified `dist/` artifact only |
| #47 | `45b775fa9deb7432a1a3be97e93257ae5c5b2f37` | Removed tracked environment files and added sanitized example templates |

### 2.1 Automation and deployment boundary

- The push-triggered master synchronization writer is disabled.
- The legacy global contract injector is disabled; it previously rewrote Rust/Solidity source files and pushed to `main`.
- The legacy automatic-upgrade writer is disabled because its referenced script was absent.
- Static publishing now uses a read-only build job followed by a separate deployment job. Only the deployment job receives `contents: write`, and it publishes `dist/` to `gh-pages`; it does not push source changes to `main`.
- The Pages build uses the repository base path and React Router base URL.
- The build refuses to publish if environment or private-key files are present in `dist/`.

### 2.2 Environment-file remediation

Fifteen tracked `.env` / mode-specific environment files were removed from the current source tree. Sanitized `.env.example` and `.env.*.example` templates preserve the variable names while replacing secret-designated values with placeholders. The existing root `.gitignore` rules ignore populated environment files and allow example templates.

**Current-tree verification:** no populated `.env` files remain in Unity Sphere main. The current `gh-pages` tree contains only the built static site and no `.env`, `.pem`, or `.key` files.

**Important limitation:** deleting current copies does not erase earlier Git commits. Any real credentials previously stored in those files must be rotated at their providers. A coordinated history rewrite is a separate operation and must follow credential rotation.

### 2.3 Unity CI evidence

On main commit `5bdd3465a4f3ca258908c92f240c6a8a85294940`:
- Unity Sphere frontend build: PASS.
- Secret scan: PASS.
- Build and publish static site only: PASS.
- GitHub Pages deployment: PASS.

The PR #47 secret scan also passed. A subsequent main-branch secret-scan run was still in progress at the time of this report.

## 3. SmartContracts hardening — PR #1105

**PR:** [#1105](https://github.com/Ze0ro99/SmartContracts/pull/1105)  
**Head branch:** `fix/workspace-lock-and-reference-ci`  
**Latest observed head:** `9680f791ee1eceff704445f43379967c64b3d4c6)  
**Disposition:** Open; not merged into main.

The PR addresses failures found by executing the actual workspace checks:

1. Adds the seven workspace packages missing from the committed `Cargo.lock`, including `pirc-economic-settlement`.
2. Corrects Soroban `Vec::set` handling, which returns unit rather than a `Result`.
3. Corrects generated-client test calls that incorrectly used `.unwrap()` on unit-returning methods.
4. Corrects negative-path assertions to match the Soroban generated `try_*` client error shape.
5. Repairs registry, oracle, AI-oracle, quorum-oracle, proof-of-reserves, and OUSD test coverage affected by the generated-client API.
6. Groups economic-period proposal fields in a typed `PeriodProposal` contract type. This keeps the public contract entry point within Soroban's maximum parameter count.
7. Runs the reference-contract workflow on `main`, includes the quorum-oracle crate in tests/builds, and validates the committed lockfile with `cargo metadata --locked`.

### 3.1 Current validation state

The previous run established that:
- Shared economic fixture validation passed.
- Workspace compilation passed after the missing package records and ABI parameter grouping were added.
- Tests then exposed generated-client assertion mistakes and a separate Proof-of-Reserves test issue; these were corrected in subsequent commits.

At the latest head `9680f791ee1eceff704445f43379967c64b3d4c6`, Economic Contract Validation, PiRC reference contract checks, CodeQL, and the OMNI pipeline were still running. **No passing result is claimed for that latest head until those runs complete.**

The reference workflow currently reports the pre-existing rustfmt drift as a separate notice rather than silently mutating source files. A dedicated formatting cleanup remains outstanding.

## 4. PiRC status

PiRC main remains the standards, policy, schema, and cross-repository traceability authority. The current documentation validation and documentation/Netlify build workflows were observed passing on main commit `db09230b0fa97c0a04283283c21c031c4ac8524b`.

The standards coverage matrix remains an inventory, not proof of implementation. A standard is not considered implemented merely because a branch, file, or contract crate exists. Every mapping must point to a normative requirement, reviewed ABI, implementation, tests, and acceptance evidence.

## 5. Cross-repository interface implications

The economic settlement contract ABI has changed in PR #1105: `propose_period` now accepts a typed `PeriodProposal` payload rather than the earlier long positional argument list. The Unity Sphere adapter mapping still contains the earlier provisional signature and must be updated only after PR #1105 is merged and its ABI is pinned.

No API should sign or submit a transaction based on an assumed ABI. The required release sequence remains:
1. Merge reviewed contract implementation and tests.
2. Pin the generated Soroban spec/ABI and update the Unity adapter mapping.
3. Add API serialization and golden-vector parity tests against the pinned ABI.
4. Validate authorization, idempotency, replay, overflow, and read-back behavior.
5. Execute the documented Testnet runbook and capture transaction, code-hash, and read-back evidence.

## 6. Explicitly unverified

The work above does not prove:
- that any of the seven proposed layer contract IDs are deployed on Pi Testnet;
- that the issuer account is a Soroban contract;
- that OUSD is backed, redeemable, or a production stablecoin;
- that GCV is a bank redemption value or an externally enforceable price;
- that Oracle V2 has independent-source quorum or cryptographic reporter verification;
- that RAW Factory performs deterministic child-contract deployment and read-back;
- that physical possession proofs verify real device signatures;
- that PQ cryptography is implemented or production-ready;
- that any Mainnet transaction, payment, mint, liquidity deposit, or contract deployment has occurred.

## 7. Release disposition

**Status: INTEGRATION IN PROGRESS — NOT RELEASE CERTIFIED.**

Unity Sphere's unsafe automatic writers and source-root Pages publishing have been removed from the active main workflows. Tracked environment files have been removed from the current tree, and Pages now serves only the built static artifact. SmartContracts still requires successful completion of PR #1105's latest CI before its workspace hardening can be merged. The remaining branch import, contract-to-standard mapping, ABI handoff, Testnet verification, and independent security review remain open gates.
