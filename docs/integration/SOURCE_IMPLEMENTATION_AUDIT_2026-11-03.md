# Source Implementation Audit — 2026-11-03

## Scope and evidence
This review inspected live GitHub branch references and selected source files from `omni-v2-main`, `v2.1`, `divine_justice`, and the default branches of the three repositories. The exhaustive branch-head inventory is in [BRANCH_HEAD_AUDIT_2026-11-03.md](BRANCH_HEAD_AUDIT_2026-11-03.md). A branch name, registry label, deployment report, or README claim is not deployment proof.

## Branch inventory
- PiRC: 155 branch refs.
- SmartContracts: 276 branch refs.
- Unity Sphere: 146 branch refs.
- Total: 577 branch refs.

Large tree snapshots include vendored Cargo registry files, build artifacts and `target/` outputs. Those are not application features and must be excluded from source-of-truth decisions. Identical branch head SHAs are deduplication candidates for content review, but branch references and divergent history must be retained.

## Confirmed source observations

### PiRC
- `omni-v2-main/README.md` describes Rust, Solidity, TypeScript, React and Node.js and lists `src/`, `docs/`, `contracts/`, and `archive/`.
- The root `Cargo.toml` inspected on `omni-v2-main` declares package `rwa_verify`, edition 2024 and `soroban-sdk = 26.0.0`.
- `PiRCDivineJustice.sol` is a minimal Solidity demonstration with an administrator and a constant validation string. It is not a complete justice/governance system.
- `pirc103_amm_engine.rs` in the inspected architecture path contains repeated crate attributes and a demonstration swap that returns 99% of the input; it is not a complete AMM.
- `deployment_reports/STELLAR_DEPLOYMENT_REPORT.md` lists token names and audit claims but the inspected report has blank token contract addresses. Do not treat its “verified” labels as independent deployment evidence.
- `CONTRACTS_REGISTRY.json` labels many entries “Deployed”; those entries need contract-ID, network, transaction, WASM hash and live invocation evidence before the status can be treated as verified.

### SmartContracts
- The default branch has a Rust workspace with `contracts/*` members and pins `soroban-sdk = 22.0.11`.
- The inspected `contracts/pirc_103/src/lib.rs` is a basic balance/subscription example. It lacks checked arithmetic for balance addition, positive-amount validation, replay/allowance controls, events and a complete token standard interface.
- The inspected `contracts/pirc_260/src/lib.rs` stores asset metadata and ownership. It needs authorization/initialization hardening, metadata validation, lifecycle rules, events and tests before production use.
- The existence of many numbered crate directories is not evidence that all PiRC proposals are implemented or tested.

### Unity Sphere
- The default branch is a Vite/React application with PiDEX, Testnet, Oracle, Governance, Economics and other screens.
- `src/lib/exchange.ts` explicitly seeds market prices/candles with local pseudo-random data and implements orders in client-side state. The current exchange UI is a simulation, not a live on-chain exchange.
- `src/lib/market-index.ts` depends on a Supabase Edge Function named `market-index`. Live pricing depends on that deployed function, its venue adapters, secrets/configuration and operational health; client code alone does not prove live feeds.
- `src/pages/Testnet.tsx` includes fabricated-looking contract-ID placeholders and sends contract IDs through Horizon account lookup. A Horizon account 404 does not establish that a Soroban contract is undeployed.
- `src/data/layers.ts` contains an issuer string with a zero character (`...J6S05...`), while the inspected registry and Stellar config use `...J6SO5...`. Stellar StrKey uses the Base32 alphabet and does not accept digit zero. This discrepancy must be corrected and tested.
- `src/lib/pi.ts` distinguishes Horizon mainnet and testnet endpoints, but its account/asset helpers are not Soroban contract-state verification.
- `vite.config.ts` includes public Supabase fallback configuration. This is not equivalent to a server secret, but production configuration must be reviewed; do not place service-role keys or private credentials in Vite client bundles.
- A tracked root `.env` exists in the inspected tree. Its contents were not opened; verify it contains no credentials and rotate any exposed secrets.

## Required corrections and gates
1. Keep market simulation visibly separate from live exchange execution. Do not create real-looking fills, transaction hashes or balances without chain evidence.
2. Correct the issuer StrKey discrepancy against a verified registry source and add StrKey validation tests.
3. Separate Horizon account endpoints from Soroban RPC contract-state checks. If Pi's target environment has no supported Soroban RPC, show “not verifiable on this network” rather than treating Horizon 404 as proof of non-deployment.
4. Remove placeholder contract IDs from production verification lists. Only load contract IDs from a network-scoped registry with deployment evidence.
5. Require evidence per contract: network/passphrase, contract ID, deploy transaction, WASM hash, SDK version, protocol range, admin, initialization transaction, successful read/write invocation and tests.
6. Resolve Soroban SDK version drift (PiRC inspected 26.0.0, SmartContracts workspace 22.0.11, PiDEX docs 22.x) through explicit per-crate compatibility and CI matrix. Never claim protocol v28 compatibility based only on a comment.
7. Review vendored `.cargo/registry`, `target/`, generated artifacts and duplicate nested repositories. Keep dependencies in lockfiles and exclude build outputs from source branches.
8. Do not call OUSD a backed stablecoin until issuer, reserve custody, legal redemption rights, independent attestations and operational redemption tests are evidenced. Test token must be clearly marked TEST_ONLY.
9. Treat Chainlink compatibility as a design/adaptor requirement, not a native Soroban deployment claim. Verify feed source, network availability, licensing, freshness, quorum and signed message verification.
10. All production or banking claims require legal, security and operational evidence; architecture proposals do not create regulatory authorization or Pi Core Team endorsement.

## Status vocabulary
- `PROPOSED`: documented idea, no verified implementation.
- `PROTOTYPE`: code exists but not fully tested or integrated.
- `TESTED_LOCAL`: deterministic local tests pass.
- `TESTNET_DEPLOYED`: verified deployment and invocation on named testnet.
- `MAINNET_DEPLOYED`: verified mainnet deployment with transaction and code hash.
- `AUDITED`: independent audit report tied to exact artifact hash.
- `PRODUCTION_READY`: all release, security, operational, legal and governance gates passed.

Never promote a component to a higher status based on a branch name or a manually written report alone.
