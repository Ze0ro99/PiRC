# Changelog

All notable repository changes are documented here. Dates use ISO 8601.

## [3.2.0-rc.2] - 2026-11-03

### Added
- End-to-end economic lifecycle and cross-component integration map.
- Treasury revenue recognition and participant distribution controls.
- V18 metrics dictionary with explicit definitions and data-quality flags.
- Application-token launchpad lifecycle and supply invariants.
- Oracle data-quality, quorum, freshness and circuit-breaker standard.
- JSON Schema Draft 2020-12 contracts for payment intents, product valuations, commerce events and V18 metrics reports.
- Versioned schema registry and compatibility policy.
- Standard-library release validator and GitHub Actions validation workflow.

### Clarified
- Full commerce cycle from discovery through settlement, verification, fulfillment, reconciliation and metrics.
- GMV is not revenue; internal reference values are not redemption claims.
- Cross-repository ownership boundaries remain PiRC / SmartContracts / Unity Sphere.
- Testnet-only writes and separate Mainnet authorization.

### Validation
- CI workflow is newly added; successful execution is pending.
- Full contract, integration, Testnet, security and maintainer evidence remains outstanding.

## [3.2.0-rc.1] - 2026-11-03

### Added
- English-language Testnet1 network profile and environment requirements.
- PiRC1/PiRC2 implementation crosswalk and explicit unresolved lifecycle blockers.
- Product valuation and provenance event standard.
- QR/NFC signed payment-intent standard.
- AI-agent capability and safety boundaries.
- Testnet release gates and Mainnet promotion policy.
- V18 commerce velocity metrics and integration specification.
- Release-candidate scope, validation checklist, and promotion policy.

### Clarified
- V18 means commerce velocity and economic circulation; it is not a protocol version.
- Pi Protocol v28 is the compatibility baseline, subject to endpoint and SDK verification.
- GCV/internal reference values are not market prices or redemption guarantees.
- PiRC specifications and reference code are not official Pi Network approvals or production deployments.
- Pi Cash, Pi Bank, OUSD, reserves, fiat rails, and redemption are not represented as live or backed without evidence.

### Safety
- Testnet-only execution; Mainnet remains disabled pending evidence and explicit maintainer approval.
- No autonomous AI-agent signing or unreviewed contract migrations.
- Preserve source branches and seven-layer mapping; no blind branch merges.

### Validation
- This candidate is not a stable release. Repository-wide test, security, and Testnet evidence must be attached before promotion.
