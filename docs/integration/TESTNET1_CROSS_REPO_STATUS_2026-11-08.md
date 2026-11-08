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
| [SmartContracts](https://github.com/Ze0ro99/SmartContracts/pull/1108) | #1108 | Canonical PiDEX AMM/test-asset crates, focused contract tests and settlement test-auth fix | Open Draft; CodeQL, OMNI discovery, reference-contract tests and economic vectors passed, but full workspace compilation/test failed |
| [Unity Sphere](https://github.com/Ze0ro99/project-unity-sphere-0e2c810d/pull/52) | #52 | Pi wallet-address binding, shared connection state, Testnet1 identity guard, asset probe guard, fail-closed PiDEX, identity-gated multi-contract event inbox and source pins | Open Draft; frontend build, Deno static check, API tests, static artifact and secret scan green; publishing was skipped; live runtime still pending |

Current reviewed heads: PiRC #369 current head `805611770159170e9498fd79845bd892f3f0b16b`; SmartContracts #1108 current head `8f361062c39c8502cdf0dcdf7c998b6ce9425433`; Unity Sphere #52 current head `8e292abb4251054edc910d609a4df25ee96fce10`. These are review pins, not release approvals; refresh after every new commit. These PRs do not deploy contracts, activate liquidity, enable Soroban signing, or authorize Mainnet writes.

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
- SmartContracts PR #1108 now adds focused AMM and test-asset unit tests; their latest CI is still running.
- The active `contracts/subscription` implementation is currently only a scaffold and does not match the recurring-billing API described by its README. PR #1108 adds an explicit warning; do not use it as a PiRC-2 authorization source.
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
9. A complete PiRC-2 subscription implementation whose active source, README, ABI and tests agree, followed by cross-contract authorization tests.
10. Idempotent event decoding, transaction finality and contract-state reconciliation.
11. Asset issuer/metadata/supply synchronization with network and ledger provenance.
12. Independent security review, monitoring and rollback evidence.

Unknown values must remain `null` or `UNVERIFIED`. No address, screenshot, branch name, API health response or successful frontend build may be substituted for deployment evidence.


## 11. CI evidence refresh — 2026-11-08

The latest inspected SmartContracts #1108 check set is mixed, not green:
- Passed: CodeQL (Rust/actions), OMNI contract discovery/import, reference-contract tests, shared economic-vector validation and subscription deep audit.
- Failed: `Compile and test Soroban workspace` (workflow run 42488268545). The `pirc-economic-settlement` test suite reports 12 failures with Soroban host `Error(Auth, ExistingValue)` / `frame is already authorized`. This is an authorization-test harness failure requiring diagnosis; do not dismiss it or mark the workspace green.
- Skipped: Testnet deployment verification and registry synchronization. These skipped jobs are not deployment evidence.

The latest inspected Unity Sphere #52 checks passed for frontend build, Deno static checks, API tests, publish-artifact build and secret scan. The GitHub Pages publish job was skipped; no hosted release was verified.

PiRC #369 has only a successful Vercel preview-comment check in the inspected check set; this is not a schema/documentation validation result. The new payment-rails standard is proposed documentation and still requires schema crosswalk, review and implementation.



## 12. Post-merge status refresh — 2026-11-08 15:45 UTC

This section supersedes earlier statements in this historical status record that described the following pull requests as open or their checks as pending.

### 12.1 Merged source changes

| Repository | PR | Merge commit | Result |
|---|---:|---|---|
| PiRC | #369 | `e8c2b2bf4f67b0f1fda29c34ead0804e66fb96ff` | Cross-repository Testnet1 status and payment-rails standard merged |
| PiRC | #370 | `79f4568e4846529e7bd6c3e82dc101c0b001086e` | PiRC-2 registry RPC metadata aligned to Pi Testnet RPC |
| SmartContracts | #1108 | `2bca4658f58dc097085f1956d87a5f7f3b756a05` | Canonical PiDEX AMM and test-asset source merged |
| SmartContracts | #1110 | `80cd65e707bc0bf54f4ab2fe33f5691a07b711fb` | Delegated-burn total-supply test expectation corrected |
| SmartContracts | #1111 | `8200713e49979820593b50a34421ce2fe28072b2` | PiRC packet source registry imported without claiming deployment |

### 12.2 Current CI evidence

- SmartContracts #1110: the complete Soroban workspace compile/test job, economic-vector validation, Rust/Actions/Python analysis, subscription deep audit and CodeQL completed successfully. The earlier failing assertion was a test expectation error: mint 500, transfer 100 (no supply change), then burn 25; Alice holds 375 and total supply is 475.
- SmartContracts #1111: source-registry import, analysis, CodeQL and master summary completed successfully. Deployment-verification and per-contract deployment jobs were skipped; this is not deployment evidence.
- PiRC #370: workspace typecheck/build, schema/Netlify validation and SonarCloud checks completed successfully.
- Unity Sphere #52 remains open at head `14ef9974d040c8fdc8807b992b8b5002e9c5ac37`. Its inspected build, tests, Deno static check, API tests and secret scan are green. The manual release-readiness workflow has not been run.

### 12.3 Current Testnet activation blockers

The verified read-only Pi Testnet profile is `https://api.testnet.minepi.com` and `https://rpc.testnet.minepi.com`, with passphrase `Pi Testnet`; the recorded Soroban protocol is 28 and Horizon reports support through protocol 29.

The supplied issuer reference `GA3ECRFJ6SO5BW6NEIKW3ACJXNG5UNBTLRRXWC742NHUEDV6KL3RNEN6` is a Stellar StrKey G-account public key, not a Soroban C-contract ID. The repository records it as a source-declared issuer account only. Account existence, signer control and issuer/admin authority remain unverified.

The last recorded live read-only probe found 0/7 registered layer contract instances. The deployment manifest therefore correctly keeps all seven canonical asset contract IDs null and deployment disabled. No balances, reserves, liquidity or token issuance can be treated as live or synchronized.

Before activation, the project still requires:
1. An explicitly authorized, isolated Testnet-only signer and a protected credential reference; no signer secret may enter source control or client bundles.
2. Seven approved color-to-layer registry mappings, preserving the unresolved Gold/Indigo history.
3. Reproducible WASM artifacts and hashes, deployment transactions, contract IDs, initialized-state and issuer/admin readback for every allowlisted contract.
4. A complete PiRC-2 implementation and ABI/client authorization tests.
5. A supported Soroban signing/submission flow separate from Pi SDK account authentication.
6. XDR decoding, transaction finality, idempotent event reconciliation and canonical settlement-state checks.
7. Completion of the 17 route-page localization migration and review of every advertised locale before enabling non-English selection.
8. Pi Browser/Sandbox runtime verification and served-build provenance.

### 12.4 Release boundary

Unity Sphere #52 is a source-integration PR, not a Testnet deployment attestation. Keep it open until its source checks and intended scope are reviewed; do not infer live PiDEX operation from green frontend/API CI. Simulation balances, orders and liquidity must remain visibly simulated. Mainnet signing, deployment, issuance, payment capture and writes remain disabled.

No deployment, signing, issuance, liquidity creation or Mainnet write is authorized by this status refresh.
