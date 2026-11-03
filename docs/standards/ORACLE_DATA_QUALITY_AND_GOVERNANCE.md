# Oracle Data Quality, Aggregation and Governance Standard

**Status:** Proposed standard. **Network:** Pi Testnet only.

## Feed identity

Each feed is identified by feed ID, asset/service ID, base unit, quote unit, geography, source class, methodology version, update interval and authorized consumer contracts. A feed for one unit or region must not be silently reused for another.

## Observation envelope

Each observation includes source ID, observed value in integer/fixed-point form, unit, observed-at time, received-at time, sequence, source signature, evidence reference and schema version. Store provenance and reject unsigned sources where signatures are required.

## Validation pipeline

1. Authenticate source and verify signature.
2. Validate units, decimals, range and schema.
3. Check timestamp and maximum age.
4. Enforce monotonic sequence per source.
5. Detect duplicates and replay.
6. Apply source-specific outlier/deviation rules.
7. Aggregate only eligible independent sources.
8. Publish value, dispersion, quorum count, confidence/data-quality state and timestamp.
9. Consumer verifies authorized reporter/quorum and freshness on-chain.

## Aggregation policy

The feed owner must define minimum independent reporters, quorum, aggregation method (median or explicitly justified alternative), maximum spread, deviation threshold, stale-feed behavior and emergency fallback. Multiple endpoints controlled by one operator are not independent reporters.

Do not publish a single-source feed as decentralized. Do not convert a fiat quote into collateral or redemption value without a separate legal and risk policy.

## Circuit breakers

On stale data, quorum loss, excessive deviation, unit mismatch, signature failure or sequence regression: freeze value-dependent writes, mark the feed unavailable, emit an incident event and preserve last-known value only as stale display data. Never silently continue settlement using stale price.

## Governance and operations

Reporter addition/removal, threshold changes, feed upgrades and emergency unpause require scoped authorization, audit log, timelock where appropriate, and independent review. Maintain key rotation, monitoring, incident runbook and recovery tests.

## Required tests

Signature forgery, replay, stale data, source collusion, reporter outage, outlier, unit mismatch, decimal mismatch, timestamp skew, sequence rollback, quorum boundary, RPC outage, contract pause and recovery.
