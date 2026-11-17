# Cross-Repository Source, Branch, CI and Testnet Evidence Audit — 2026-11-17

## Scope and method

Reviewed current default-branch trees, open pull requests, branch references, selected historical and current GitHub Actions runs, Testnet deployment manifests, PiRC economic/release standards, SmartContracts Soroban sources, Unity Sphere integration/registry sources, and the connected Supabase project's migration/security state.

This is a source and evidence audit, not a security certification, deployment attestation, market valuation, or Pi Core Team approval. Status terms are evidence-scoped: OBSERVED, IMPLEMENTED, TESTED, TESTNET_VERIFIED, BLOCKED and UNKNOWN.

## 1. Live branch inventory

Branch API pagination returned the complete current branch lists:

| Repository | Branch refs | Unique head SHAs within repository | Duplicate head refs |
|---|---:|---:|---:|
| Ze0ro99/PiRC | 186 | 168 | 18 |
| Ze0ro99/SmartContracts | 306 | 306 | 0 |
| Ze0ro99/project-unity-sphere-0e2c810d | 207 | 206 | 1 |
| Total | 699 | 680 (sum of per-repository unique heads) | 19 |

The earlier 2026-11-04 census recorded 604 refs. The current inventory is 95 refs larger. Earlier flags for divergent branches, nested snapshots, privileged automation and secret/environment review remain historical review leads; they were not recomputed across every current head in this pass. Do not mass-merge, mass-delete, force-push, or automatically deploy branches. Use exact head SHAs, diffs, ownership, source type and tests before selectively importing work.

The PiRC default tree contains a very large .migration-backup subtree with copied repositories, dependency caches and nested historical workspaces. Treat it as archived input, not a live build workspace. Do not delete it without a separate content-hash, dependency, provenance and retention audit.

The current default-branch trees contain approximately 35,835 entries in PiRC, 696 in SmartContracts and 22,301 in Unity Sphere. The PiRC .migration-backup subtree alone accounts for 26,478 entries. A filename-only environment/key inventory found 24 .env.example templates in PiRC, zero matching paths in SmartContracts, and 17 .env.example templates plus two empty PEM placeholder files in Unity Sphere. No non-example .env file was found by that path filter. This is not a full content/history secret attestation; the Gitleaks workflow's invalid-range issue is being corrected in Unity PR #93 by switching to a full-history checkout.

## 2. Current open pull-request and CI snapshot

### PiRC

- PR #386 — Next.js 16.4.6 dependency update. Merged by squash after both workspace build and documentation/Netlify checks passed; merge commit cc f53a50d11db6d7e6a2ed73d4a8c706af611090 (without the space: ccf53a50d11db6d7e6a2ed73d4a8c706af611090). Post-merge Workspace Build, Documentation/Netlify and GitHub Pages deployment checks are running.
- PR #384 — layered monetary operations Testnet1 specification. Current head 2335f04e24930fe84f5e068ba98c0ae41cc80edd; documentation validation and Netlify build passed. The Vercel check for project pi-rc failed because the deployment is subject to the Verified Commits policy; this is a platform protection gate, not evidence of an application build failure. The pirc-zero and pi-rc-rfnx Vercel checks and Netlify preview passed. Do not bypass Verified Commits.
- PR #380 — grouped web dependency updates; workspace/API/documentation builds passed on its head, but GitHub reports mergeable=false (merge conflict). Resolve against current main and rerun checks before consideration.
- PR #328 — sharp update; workspace and documentation builds passed on its head, but GitHub reports mergeable=false (merge conflict). Resolve against current main and rerun checks before consideration.
- PR #325 — source-map-js update; workspace and documentation/Netlify workflow runs passed, but combined commit status still reports Vercel pi-rc, pirc-zero, pi-rc-rfnx and Netlify preview failures. It remains unmerged until those failed contexts are reconciled.

Main after merge commit 16bba2731072ddc71d4b9e42f5593581e0ddcf43 had successful PiRC Workspace Build and Documentation/Netlify Build Validation runs 44066536951 and 44066536836.

For this audit branch, the latest pi-rc Vercel preview is BLOCKED by the project's Verified Commits setting (deployment dpl_Gz6J7qJURJva3WFuxwfZ4pKxsS1J); the latest pi-rc-rfnx preview is QUEUED (dpl_WNDN1sDbvyMLxFhYwi1utPtRtLE9). Both have target=null, so neither is a production deployment. A previous preview for an earlier audit commit reached READY, but that does not supersede the latest head.

### SmartContracts

- PR #1121 — test-only OUSD reserve/liability controller, head 072f6db1b83da436848b95e90503b08a841a5e0e. The inspected runs passed: OMNI SmartContracts Pipeline 44063672532, read-only Rust CI 44063672547, CodeQL 44063672620, Economic Contract Validation 44063672580, and PiRC reference contract checks 44063672582.
- PR #1120 — layered mint/burn, weights, liquidity and velocity documentation, head c8e74df4152f672dfdf016a6a9a96886381b1fef. OMNI and CodeQL passed, runs 43928453700 and 43928453660. It is documentation-only and does not prove that the economic controls are implemented on-chain.

PR #1121 is still Draft. Green CI does not close the contract-level gaps in section 4 below. Do not deploy or enable mint/burn/redemption from this source alone.

### Unity Sphere

- PR #92 — versioned PiGold purchasing-power reference adapter, head 45627dd9929b058b204a36c9d522a85b1470f144. Frontend build, layer-math tests, secret scan, static-site build and proposal-table validation all passed: 44063252763, 44063252822, 44063252804, 44063252825 and 44063253010.
- PR #89 — PiDEX AMM rounding correction, head 54e5d66ec9392cd2822345ef1e84b69398aa17d9. The dedicated contract CI failed at cargo fmt -- --check; unit tests and Wasm build were skipped. The failure is formatting, not a demonstrated arithmetic-test failure. It remains unapproved until formatting is fixed and the tests/build run.
- PR #91 — Black dev-dependency update; secret scan passed, but no Python test/build workflow was triggered by the changed paths, so only limited CI evidence exists.
- PR #70 and #69 — Go dependency updates; both failed the read-only Go modules validation because go vet reported many unkeyed struct literals across existing Stellar Horizon source/tests. The job also logged missing key_value_store and duplicate-key database errors during test setup. Do not merge until the Go validation baseline is repaired and rerun.

Historical Unity Sphere secret-scan failures on runs 43951634033, 44077549993, 44077609093 and 44077676531 were caused by Gitleaks receiving an invalid Git revision range and scanning approximately zero bytes. They are not confirmed secret findings. Unity PR #93 changes checkout to fetch full Git history; its latest Gitleaks run 44078041951 passed and scanned approximately 5.60 KB of changed commits with no leaks. This is a valid PR-range scan, not a full-repository-history attestation. A separate full-history credential-exposure review remains prudent because historical audit notes flagged tracked environment templates and key-file paths.

## 3. Pi Testnet1 deployment evidence

The SmartContracts manifest deployments/testnet1/asset-deployment-manifest.json currently declares:

- deployment_enabled is false;
- registry contract status is NOT_DEPLOYED;
- all seven canonical layer contract_id values are null;
- deployment transaction, deployed WASM hash, contract IDs, initialization, issuer and balance read-backs are null;
- source packet registry status is SOURCE_DECLARED_NOT_CHAIN_VERIFIED;
- zero verified contract instances in the recorded source packet probe.

Unity Sphere's read-only probe run 43606786908 verified Pi Testnet identity at ledger 27701412, with RPC protocol 28 and Horizon supported protocol 29. It then returned NOT_FOUND for all seven supplied layer contract IDs on Pi Testnet. The supplied Stellar Expert Testnet transaction references are a separate evidence domain and were not independently verified as Pi Testnet deployments.

Decision: all seven layers remain disabled/unverified for Pi Testnet. Do not activate balances, PiDEX pools, deposits, swaps, withdrawals, or minting using those source-declared IDs. A G-account public key is not a Soroban C-contract ID. A successful network identity probe is not a contract deployment.

The PiRC acceptance harness and Unity read-only workflow explicitly do not sign, deploy, mint, transfer or create liquidity. The Unity deploy-pi-layers-to-testnet workflow is explicitly disabled. The activate_contracts workflow is a read-only network identity probe. The SmartContracts settlement workflow is manual and requires an explicit confirmation input; no such deployment is claimed here.

## 4. Contract source review and remaining blockers

### PiDEX AMM

The SmartContracts source implements a two-asset constant-product pool, 30 bps fee, integer output calculation, minimum-output protection, pause control, share accounting and reserve checks. Its quote_amount_out already uses floor(reserve_out * amount_in_after_fee / (reserve_in + amount_in_after_fee)). The AMM is pair-specific; it is not a multi-asset settlement network. Source and unit tests do not establish a deployed pool or funded liquidity.

Unity Sphere also contains a separate pidex_amm source copy (445 lines versus 550 lines in SmartContracts main); the two files are not identical. Unity PR #89 corrects the Unity copy's output-rounding formula to match the floor calculation already present in SmartContracts. Its current CI did not get past rustfmt, so that Unity copy is not yet build-verified on the PR head. Establish SmartContracts as the canonical contract source and require a pinned source commit/WASM hash before any deployment; do not deploy both copies independently.

### PiGold coordinator

The source registers pool metadata and route constraints, including unique pool and reserve-accounting identifiers. Its own source comments state that it does not custody tokens, aggregate balances, execute swaps or mint assets. It is a metadata/route-validation coordinator, not a custodian or liquidity pool. Each pool must retain independent reserves and accounting; do not double-count reserve balances across routes. Its pool records use persistent storage but the inspected source has no explicit extend_ttl call; add a tested TTL renewal/expiry and recovery policy before treating the registry as long-lived.

### OUSD token and reserve controller

- contracts/ousd_test_token is a permissioned test token with 7 decimals and a fixed cap of 10^16 atomic units (1 billion whole test tokens). Its source explicitly disclaims USD backing, peg, reserves and redemption.
- PR #1121 adds a test-only reserve/liability accounting controller. It records verifier attestations and evidence hashes; it does not inspect banks, prove external funds, mint/burn OUSD or execute payouts.
- The current controller has one happy-path lifecycle test. Before it can be considered safe even for a controlled test deployment, add negative tests for duplicate reserve evidence, duplicate payout evidence, unauthorized roles, mismatched payout amount, wrong beneficiary, replay, overflow, state transitions and storage/TTL behavior.
- The current source does not maintain a uniqueness key for reserve evidence or payout evidence, so the same evidence hash can be presented again under a new record. This is a replay/double-counting gap.
- Reserve and liability records currently use contract instance storage, with no explicit extend_ttl policy. The inspected PiDEX and PiGold sources also have no extend_ttl calls (PiDEX shares and PiGold pool metadata use persistent storage; AMM reserves/configuration use instance storage). Evaluate persistent storage, TTL renewal/expiry, growth limits and migration/recovery behavior across all three contracts before treating any of them as a long-lived ledger.
- Burn eligibility is only an accounting flag; there is no atomic cross-contract token burn or reconciliation proof.

### Layer economics

The seven-layer purchasing-power constants and PiGold weights remain project reference assumptions, not official Pi monetary policy, external market prices, cash redemption or guaranteed parity. The Purple 100-PiGold tier must remain unavailable until escrow migration, frozen snapshot, exclusive allocation, reconciliation, governance approval and activation evidence exist. Indigo and Red must not inherit invented cash conversion ratios. OUSD remains additional and test-only.

## 5. Supabase event ingestion state

The connected Supabase project is active and healthy. The remote migration history contains six migrations dated 2026-11-14: 20261114130949 create_pirc_testnet_event_ingestion; 20261114133347 add_service_role_only_policies_to_private_event_tables; 20261114133420 add_safe_read_only_portal_feed_rpc; 20261114133505 restrict_portal_feed_rpc_to_service_role; 20261114134217 add_idempotent_testnet_event_ingestion_rpc; and 20261114134235 remove_definer_privileges_from_portal_feed. The Unity Sphere main tree currently contains only three migration files (20260702104857, 20260720111150 and 20261108130000_pirc_soroban_event_inbox.sql); it does not contain the six migration versions reported by the remote project. The tracked 2026-11-08 migration creates public inbox/cursor tables, while the live database has differently shaped private inbox/cursor tables and a private service-role-only RLS policy. Reconcile this remote/local migration-history drift before further schema changes or production deployment.

Observed database state:

- private.pirc_soroban_event_cursors and private.pirc_soroban_event_inbox both exist and have RLS enabled.
- Each table has a service-role-only policy; the observed grants were limited to postgres and service_role.
- Both tables currently report zero live rows.
- The only matching public event-ingestion routine found was pirc_ingest_testnet_events, with SECURITY INVOKER.
- Supabase security and health advisors returned no lints. Performance advisor reported one unused pending-event index; with zero event rows this is informational, not a reason to remove it.

The only deployed Edge Function found is pirc-portal-feed version 3 (ACTIVE, JWT verification enabled). Its read-only handler calls the pirc_portal_feed RPC, returns cursor/event observations and explicitly labels event finality NOT_VERIFIED; recent Pi Browser GET requests returned HTTP 200. The repository's pirc-soroban-event-ingest source is not present in the deployed-function list, so there is no evidence that an ingestion worker is deployed or polling. The deployed RPC reads the private tables, while the tracked 2026-11-08 migration creates public tables; the remote six-migration schema and tracked migration source are therefore materially different, not merely different migration counts. Before enabling a live poller, reconcile and commit the actual migration history, pin the exact contract allowlist and starting ledger, deploy and health-check the ingestion Edge Function, prove durable cursor advancement and idempotency, decode XDR against pinned ABI, verify transaction finality and contract/topic identity, read canonical contract state, and reconcile settlement digests. No events have been observed in the current tables.

## 6. Documentation and metadata consistency

The current release gates correctly require exact network identity, allowlisted reproducible WASM, manual approval, deployment transaction, contract ID, code-hash and initialized-state read-back, authorization tests, monitoring and rollback. Keep those gates normative.

Legacy Unity Sphere and PiRC public LIVE_MATRIX_REGISTRY.csv copies labeled seven supplied contract IDs and the Core account as ACTIVE with historical deployed dates, while the canonical assets/registry/pirc207-layer-registry.json explicitly marks the entries UNVERIFIED_REPOSITORY_CLAIM and NOT_FOUND_ON_PI_TESTNET_AT_LAST_PROBE. PiRC PR #387 (open Draft) now corrects both served public CSV copies while preserving their identifiers; archived full-repository snapshots are intentionally retained as historical snapshots. The legacy Unity Sphere .well-known/pi.toml has an invalid issuer string containing 0 in the StrKey alphabet position and describes currencies as live/official. MASTER_MANIFEST.md also claims the seven-layer environment is complete, verified and deployed on Pi and Stellar Testnets, despite the read-only Pi Testnet probe returning NOT_FOUND for all seven supplied contract IDs and no independently verified Stellar deployment. Unity Sphere PR #93 (open Draft) now preserves historical identifiers while withdrawing the unsupported ACTIVE/live claims, invalid currency metadata and unsupported manifest deployment claims.

The PiRC artifact CONTRACTS_REGISTRY.json contains 84 PIRC package records with status Deployed, but those records contain only a PIRC id, repository path and a quantum_audit boolean; none contains a contract ID, deployment transaction or WASM hash. Treat that status as a repository package lifecycle label, not as evidence of 84 on-chain deployments. The top-level master issuer and PIRC-2 subscription addresses in that file are also source declarations until separately read back on Pi Testnet.

The Gold/Indigo mapping remains unresolved. Preserve the source packet IDs and canonical seven-layer slots separately until a versioned governance-approved migration is accepted. Do not silently rename Gold to Indigo.

## 7. Required next work, ordered

1. Correct/withdraw legacy ACTIVE asset metadata and the invalid .well-known/pi.toml issuer listing; preserve all source IDs as unverified claims.
2. Reconcile Supabase remote migration history with tracked migration files and verify the Edge Function deployment version/configuration without exposing secrets.
3. Fix Rust formatting in Unity PR #89, then rerun contract tests and Wasm build.
4. Harden OUSD controller against duplicate evidence/replay, long-lived storage TTL, authorization negatives and token-burn integration; keep it Draft until independently reviewed.
5. Regenerate and review the Unity package lockfile; the previous PR #92 CI fallback to npm install is not a substitute for a reproducible committed lockfile.
6. Refresh the full branch audit with per-head diffs and duplicate blob analysis; import only selected unique features and leave backups/vendor snapshots quarantined.
7. Run Pi Testnet read-only identity and per-contract read-back immediately before any authorized deployment. Deployment must remain manual, single-network and allowlisted.
8. Only after verified deployment and balances exist, conduct small, explicitly approved test mints and read back balances/events. No minting is authorized by this audit.

## Safety boundary

This audit performs no Mainnet writes, no Testnet signing/deployment, no mint/burn/transfer/swap, no liquidity provisioning, no withdrawal payout, no secret retrieval, no branch deletion, and no PR merge. All Testnet operations remain read-only until separate explicit authorization and verified deployment evidence exist.
