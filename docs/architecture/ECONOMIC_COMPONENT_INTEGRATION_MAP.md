# Economic Component Integration Map

**Status:** Proposed integration contract. This map identifies ownership and data flow; it does not claim that every integration is already implemented.

## Component ownership

| Component | Source of truth | Input | Output | Required control |
|---|---|---|---|---|
| PiRC standards | PiRC | proposals, evidence, policy decisions | versioned specs and schemas | maintainer review |
| Asset registry | PiRC schema + contract state | issuer submission, review | canonical asset record | issuer authorization |
| Product catalog | Unity Sphere | merchant listing | product and availability | merchant authentication |
| Valuation service | Unity Sphere + approved sources | product, quote, evidence | versioned valuation | source, timestamp, expiry |
| Payment-intent service | Unity Sphere | order and valuation | signed QR/NFC intent | nonce, expiry, signature |
| Wallet authorization | Pi wallet/user | payment intent | user-approved transaction | explicit user action |
| Settlement contract | SmartContracts | authorized transaction | deterministic state/event | access control, idempotency |
| Soroban RPC/Horizon | Pi Testnet | transaction/ledger request | network evidence | network identity validation |
| Event indexer | Unity Sphere | chain events | normalized events | cursor, deduplication |
| Reconciliation | Unity Sphere | DB + chain + merchant ledger | exceptions and balances | append-only corrections |
| V18 analytics | Unity Sphere | reconciled commerce events | raw metrics and reports | defined window/denominators |
| Oracle service | SmartContracts + approved adapters | signed observations | verified feed state | quorum, freshness, deviation |
| AI agent | Unity Sphere | read-only scoped context | recommendations/alerts | capability policy |
| Release controller | PiRC + CI | pinned artifacts and evidence | Testnet release candidate | human approval |

## Canonical event envelope

Every cross-component event should carry:
- `event_id`, `event_type`, `schema_version`, `occurred_at`;
- `network_id`, `correlation_id`, `idempotency_key`;
- `producer`, `subject_id`, `asset_id` where relevant;
- `payload_hash`, `evidence_refs[]`, `privacy_class`.

Consumers must reject unknown critical schema versions, deduplicate by event ID/idempotency key, and preserve original event time and source. Do not use an event received timestamp as the ledger timestamp.

## Data flow

1. Merchant creates a product and valuation revision.
2. Quote service creates an expiring payment intent bound to the valuation hash.
3. QR/NFC presents the signed intent.
4. Wallet validates network and terms; user approves.
5. Contract/wallet submits settlement on Testnet.
6. Indexer observes the canonical chain event and verifies transaction success.
7. Order service transitions to paid only after readback.
8. Merchant fulfillment is recorded.
9. Reconciliation produces trusted event rows.
10. V18 metrics aggregate only reconciled events.
11. AI may summarize or flag anomalies but cannot change ledger state.
12. Release controller packages source SHAs, artifact hashes, tests and Testnet evidence.

## Failure boundaries

No service may infer another service's success from an HTTP 200 alone. Each state-changing boundary requires a stable idempotency key and a read-after-write verification strategy. All services must carry an explicit network identifier. Testnet and Mainnet data stores, signer identities, contract IDs and API credentials must be isolated.
