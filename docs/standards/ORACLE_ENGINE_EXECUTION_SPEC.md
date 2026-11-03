# Oracle Engine — Execution Specification

**Status:** Proposed protocol specification. The observation envelope is schema-backed; cryptographic verification, quorum operation, and on-chain integration remain implementation gates until independently tested.

## 1. Canonical observation

Each observation must bind all security-relevant fields into one canonical payload: schema and version, feed ID, base asset, quote asset, integer value and scale, source ID, monotonically increasing source sequence, observed-at time, expiry time, venue/context fields, and signing-key ID. The signature is computed over the canonical payload excluding the signature field itself. Implementations must select and pin one canonicalization algorithm (recommended: RFC 8785 JSON Canonicalization Scheme) and one signature algorithm per feed policy; no implementation may silently accept alternate serialization.

The signature proves control of a configured key, not the truth of the reported value. Key rotation and revocation must be versioned and auditable.

## 2. Validation pipeline

1. Validate against `schemas/v1/oracle-observation.schema.json`.
2. Resolve feed policy, accepted source IDs, asset pair, scale, signature algorithm, and active key ID.
3. Canonicalize the signed payload and verify the signature.
4. Reject observations where `observed_at` is in the future beyond configured clock skew, `expires_at <= now`, expiry precedes observation, or age exceeds the feed's max-age.
5. Reject duplicate observation IDs and source sequence values less than or equal to the last accepted sequence for that source/feed. Persist accepted sequence state atomically.
6. Validate base/quote assets and scale exactly; never mix USD, USDC, Pi, or other quote units without a separate conversion feed and explicit conversion policy.
7. Apply source-specific liquidity, volume, venue, deviation, and outlier controls.
8. Require the configured independent-source quorum before publishing an aggregate.
9. Publish the aggregate with constituent observation IDs, accepted/rejected counts, policy version, calculation timestamp, and quality state.

Any failure must produce a typed rejection reason and must not update the last-good value. Stale values may be exposed for diagnostics but must be marked stale and cannot authorize settlement.

## 3. Freshness, sequencing, and replay

- Each feed declares `max_age_seconds`, `max_future_skew_seconds`, and the expected sampling interval.
- Sequences are monotonic per `(feed_id, source_id, signing_key_epoch)`; a key rotation must not reset sequence state without an explicit migration.
- Duplicate delivery is idempotent only when observation ID, sequence, and payload hash all match.
- Same sequence with a different payload is a conflict and quarantines that source until reviewed.
- Clock freshness does not replace sequence checks; sequence checks do not replace freshness.
- Use a monotonic local clock for timeout measurement and UTC timestamps for signed evidence.

## 4. Aggregation and manipulation resistance

A feed policy must declare a minimum number of independent sources, source concentration limits, maximum pairwise deviation, outlier handling, liquidity minimums, and a fallback policy. Independence means independently controlled data/signing infrastructure; multiple keys controlled by one operator do not count as independent sources.

For a price feed, a robust default candidate is the median of accepted, pair-compatible observations after source and liquidity filters. A trimmed mean may be used only when the policy pins the trimming fraction and deterministic rounding. The policy must specify what happens when the quorum fails: return `UNAVAILABLE` or retain a visibly stale last-good value for display only. Do not silently fall back to a single source.

A deviation check can use integer arithmetic: compare `abs(new - reference) * 10000` to `reference * max_deviation_bps`, with checked multiplication and a strictly positive reference. Reject or quarantine outliers; never silently clip them into the accepted range.

## 5. Oracle output and consumer rules

The published aggregate must include feed ID/version, asset and quote IDs, integer value/scale, constituent observation IDs and hashes, accepted-source count, quorum threshold, calculation method, last-updated time, expiry, and quality status (`GOOD`, `DEGRADED`, `STALE`, `UNAVAILABLE`, `QUARANTINED`).

Contracts and APIs must consume only a configured feed ID and policy version. A value from the oracle is an observation, not proof of collateral, legal redemption, market-wide price, or a right to convert an internal reference parameter. Oracle output must never directly alter collected revenue, liabilities, provenance, or allocation eligibility.

## 6. Minimum conformance tests

- valid signature accepted; modified signed field rejected
- expired and future-dated observations rejected
- duplicate ID and replayed sequence rejected
- same sequence/different payload quarantined
- revoked or wrong feed key rejected
- wrong base/quote pair and scale rejected
- quorum below threshold returns unavailable
- median and tie handling deterministic
- deviation and integer-overflow boundaries fail closed
- one operator with multiple keys cannot satisfy independent-source quorum
- stale last-good value cannot authorize settlement

## 7. Implementation boundary

PiRC owns this standard and schema. SmartContracts owns any on-chain verification/consumer implementation and must document cryptographic and gas constraints. Unity Sphere owns source adapters and must preserve signatures, source IDs, sequence values, timestamps, and rejection states end-to-end. A successful JSON-schema check is not a cryptographic or runtime conformance test.
