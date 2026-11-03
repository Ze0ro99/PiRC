# PiRC v3.2.0-rc.1 — Sovereign Hybrid Economic Ecosystem

**Release channel:** Release Candidate  
**Target branch:** `integration/sovereign-hybrid-ecosystem`  
**Baseline protocol:** Pi Protocol v28 (compatibility baseline; not a claim of official certification)  
**Execution environment:** Pi Testnet only  
**Mainnet status:** Disabled / not approved

## Purpose

This release candidate consolidates the repository's economic architecture and implementation standards into an English-language review package. It is intended for reproducible engineering review, Testnet integration, and maintainer feedback. It is not an official Pi Network release, endorsement, financial product, or production deployment.

## Included architecture and specifications

- Sovereign hybrid architecture and seven-layer stack, preserving the existing seven-layer order and color mapping.
- Economic model and integration blueprint, separating external market quotes, internal reference values, utility measures, modeled indices, and redeemable claims.
- V18 commerce velocity as a set of measurable operational metrics, not a Pi protocol version or opaque score.
- Product valuation, append-only valuation/provenance events, source classification, and atomic-unit accounting.
- QR/NFC payment intents with expiry, nonce, replay protection, network binding, and explicit wallet confirmation.
- PiRC1 launchpad lifecycle and PiRC2 subscription crosswalk, including known unresolved expiry/recurring-charge semantics.
- Application-token issuance concepts and controlled launchpad lifecycle; issuer, supply, metadata, compliance, and contract authorization remain subject to implementation and review.
- AI-agent capability boundaries: read-only by default; no autonomous transfer, mint, refund, or issuer approval.
- Pi Testnet1 network profile, Testnet release gates, and separate Mainnet approval requirements.
- Branch intake, source implementation, and cross-repository review records.

## Economic safety and interpretation

- GCV and other internal reference values are proposals or model coordinates, not exchange prices, bank deposits, collateral, or redemption guarantees.
- No USD backing, reserve, custody, fiat rail, or redemption capability is asserted without verifiable issuer, legal, custody, reserve, and operational evidence.
- V18 reports raw measures (settled orders, unique participants, throughput, latency, repeat usage, turnover, success rate, refunds, and disputes). Any composite score requires a published formula, window, sample size, and source-quality rules.
- All financial and contract flows remain Testnet-only until each release gate is evidenced and approved.

## Validation status

This is a documentation and integration-baseline release candidate. Do not infer that every standard has a production implementation. Before promotion, attach reproducible evidence for:

1. Repository-wide formatting, type checks, unit tests, and security scans.
2. Soroban contract tests and deployment allowlist verification.
3. Pi Testnet endpoint, network passphrase, protocol compatibility, and RPC health checks.
4. End-to-end QR/NFC payment-intent, valuation persistence, provenance, and replay tests.
5. PiRC1/PiRC2 lifecycle tests, including resolution of approval expiry and recurring-charge semantics.
6. Oracle freshness, quorum/aggregation, deviation limits, and failure-mode tests.
7. Maintainer review, threat-model review, and an explicit Mainnet authorization decision.

## Promotion policy

The candidate must not be tagged as a stable release or deployed to Mainnet until the above evidence is attached, unresolved blockers are closed, and maintainers approve the promotion. Testnet success does not itself authorize Mainnet deployment.

## Key documents

- [Master architecture](../architecture/MASTER_ARCHITECTURE.md)
- [Seven-layer hybrid stack](../architecture/SEVEN_LAYER_HYBRID_STACK.md)
- [Economic mathematics](../economics/ECONOMIC_MATHEMATICS.md)
- [Economic system integration blueprint](../economics/ECONOMIC_SYSTEM_INTEGRATION_BLUEPRINT.md)
- [V18 commerce velocity specification](../standards/V18_COMMERCE_VELOCITY_TESTNET1_SPEC.md)
- [PiRC1/PiRC2 crosswalk](../standards/PIRC1_PIRC2_IMPLEMENTATION_CROSSWALK.md)
- [Valuation and provenance standard](../standards/COMMERCE_VALUATION_AND_PROVENANCE_STANDARD.md)
- [QR/NFC payment-intent standard](../standards/QR_NFC_PAYMENT_INTENT_STANDARD.md)
- [AI-agent safety standard](../standards/AI_AGENT_CAPABILITY_AND_SAFETY_STANDARD.md)
- [Testnet release gates](../standards/TESTNET1_RELEASE_GATES.md)
