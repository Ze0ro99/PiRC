# PiRC v3.2.0-rc.2 — Sovereign Hybrid Economic System

**Release channel:** Release Candidate 2  
**Repository:** `Ze0ro99/PiRC`  
**Branch:** `integration/sovereign-hybrid-ecosystem`  
**Protocol compatibility baseline:** Pi Protocol v28 (must be verified against live Testnet and SDK matrix)  
**Network policy:** Pi Testnet only; Mainnet disabled  
**Language:** English

## Release objective

Connect the economic system from product discovery through valuation, payment authorization, Testnet settlement, chain verification, fulfillment, reconciliation, treasury accounting, and V18 measurement. Provide machine-readable v1 schemas and automated documentation/schema checks.

## Added in RC.2

- End-to-end economic lifecycle and explicit order/payment state machines.
- Cross-component integration map with ownership, event envelope and failure boundaries.
- V18 metrics dictionary with numerator/denominator, units and exclusion rules.
- Application asset/token launchpad lifecycle and supply invariants.
- Oracle data quality, aggregation, freshness, quorum and circuit-breaker standard.
- Treasury revenue recognition and distribution model.
- Versioned JSON Schema Draft 2020-12 contracts for payment intents, product valuations, commerce events and V18 reports.
- Schema registry and compatibility/versioning policy.
- Python standard-library validator for schema structure and internal Markdown links.
- GitHub Actions workflow for pull requests to main and the integration branch.

## Architecture boundaries

PiRC is the normative specification and governance layer. SmartContracts owns executable contract logic and deterministic tests. Unity Sphere owns APIs, adapters, UI, indexers, reconciliation and analytics. This release does not claim all three repositories have been merged or all components deployed.

## Economic and security rules

- Pi, app tokens, test assets, fiat estimates, internal reference values, collateral marks and redeemable claims remain distinct.
- GMV is not revenue. Revenue must be collected, earned and reconciled.
- GCV-like values and sovereign multipliers are research parameters, not redemption or conversion instructions.
- V18 is a transparent vector of commerce metrics, not protocol v18 or an opaque score.
- QR/NFC transports signed, expiring intents; the user must approve payment in the wallet.
- AI agents are read-only by default and cannot autonomously sign, transfer, mint, refund, approve issuers or deploy contracts.
- Oracle feeds require source provenance, freshness, independent quorum and explicit stale/deviation handling.
- All write operations and contract deployments remain Testnet-only.

## Validation status

The schema and documentation validator has been added but has not yet produced a successful GitHub Actions run on this commit. Contract tests, full multi-repository builds, Testnet end-to-end transactions, security audits and maintainer acceptance are not yet evidenced by this release note. Do not describe this candidate as production-ready.

## Promotion requirements

1. CI passes on the final PR head.
2. All four schemas validate and API/contract implementations consume them.
3. SmartContracts and Unity Sphere PRs are reviewed against these contracts.
4. Pi Testnet network identity, protocol compatibility, deployments and transaction readbacks are recorded.
5. PiRC2 expiry/revocation/recurring-charge mismatch is resolved.
6. Oracle quorum, freshness and adversarial tests pass.
7. Maintainers approve the final scope.
8. Mainnet receives a separate security, operational and authorization process.
