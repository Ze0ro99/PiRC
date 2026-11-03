# Integrated Release Acceptance Checklist

Use this checklist for each tagged integration release. A checked item must link to evidence for the exact commit or build.

## A. Specification and schemas
- [ ] PiRC requirement IDs and revisions are pinned.
- [ ] JSON Schemas validate positive and negative fixtures.
- [ ] API, contract, and event schemas are version-aligned.
- [ ] Breaking changes have migration notes and a major-version decision.
- [ ] Gold/Indigo remains explicitly unresolved unless a reviewed ADR closes it.

## B. Economic engine
- [ ] All amounts are integer atomic units with declared asset and scale.
- [ ] Collected revenue is evidenced and separated from forecasts/quotes.
- [ ] Senior obligations are deducted before distribution.
- [ ] Underfunded periods fail closed.
- [ ] Allocation is deterministic and conserves all atomic units.
- [ ] Zero-weight, duplicate-ID, invalid-ID, overflow, zero-denominator, and boundary cases are tested.
- [ ] Period replay is rejected.
- [ ] Contract state and emitted settlement events reconcile.

## C. Contracts
- [ ] Soroban SDK and Rust toolchain are pinned.
- [ ] Contract initialization is one-time.
- [ ] Authorization is tested for every privileged transition.
- [ ] Negative and adversarial paths are tested.
- [ ] Storage expiry and upgrade behavior are documented and tested.
- [ ] WASM build artifacts are reproducible and checksummed.
- [ ] Independent security review covers the exact release commit.

## D. Oracle and reserve evidence
- [ ] Signature algorithm and canonicalization are pinned.
- [ ] Key rotation/revocation and sequence replay are tested.
- [ ] Freshness, quorum, outlier, and stale-feed behavior are tested.
- [ ] Reporter independence is evidenced.
- [ ] Reserve report scope, auditor, timestamp, hash, exceptions, and custody evidence are recorded.
- [ ] Attestation is not described as independent proof of custody.

## E. Unity Sphere and API
- [ ] Client values cannot set authoritative revenue, reserve, eligibility, or distributable totals.
- [ ] API schema validation and authentication tests pass.
- [ ] Idempotency and duplicate submission are tested.
- [ ] RPC timeout, ambiguous submission, rejected transaction, and failed readback are tested.
- [ ] No signer secret is exposed to browser/client code or logs.
- [ ] Network and contract IDs are explicit and allowlisted.
- [ ] UI displays evidence state and timestamp, not unsupported LIVE/ACTIVE claims.

## F. Network and runtime
- [ ] Network name, passphrase, RPC URL, and protocol profile are pinned.
- [ ] Testnet transaction hash and final status are recorded.
- [ ] Contract address and deployed WASM hash are independently read back.
- [ ] API readback matches on-chain state and event values.
- [ ] Pi Desktop 0.6.4 compatibility has a reproducible runtime test, if claimed.
- [ ] Mainnet readiness is separately reviewed; Testnet success is not Mainnet proof.

## G. Security and operations
- [ ] Workflow permissions follow least privilege.
- [ ] No branch-harvesting, mass deployment, or automatic signing workflow is enabled.
- [ ] Secrets are environment-scoped and never committed.
- [ ] Deployment requires manual approval and an allowlisted manifest.
- [ ] Rollback, pause, incident, and key-compromise procedures are documented.
- [ ] Monitoring alerts on stale data, failed readback, replay, and invariant violation.

## H. Evidence bundle
- [ ] Exact source commit SHAs for all three repositories.
- [ ] CI run URLs and test summaries.
- [ ] Dependency lockfiles and toolchain versions.
- [ ] Artifact hashes and SBOM.
- [ ] Threat model and security review.
- [ ] Testnet transaction/readback evidence.
- [ ] Known limitations and unresolved risks.
- [ ] Release owner and reviewer sign-off.

**Release rule:** any unchecked critical item blocks promotion to TESTNET-VERIFIED or MAINNET-VERIFIED as applicable. Do not substitute narrative status labels for evidence.
