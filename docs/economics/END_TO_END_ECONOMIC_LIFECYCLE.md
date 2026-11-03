# End-to-End Economic Lifecycle

**Status:** Proposed system specification. **Execution scope:** Pi Testnet only.

## 1. System actors

- Pioneer / customer: discovers a product, reviews the price and authorizes payment.
- Merchant / application: publishes products, sets terms, fulfills orders and handles disputes.
- Application issuer: submits a token proposal and remains accountable for disclosures and token policy.
- PiRC standards layer: defines schemas, governance, economic policy and acceptance gates.
- Soroban contract layer: enforces deterministic state transitions and authorization.
- Oracle / data provider: supplies timestamped observations with provenance; it does not guarantee value.
- Indexer / API: reads chain events, reconciles state and serves privacy-filtered data.
- AI assistant: supports discovery, explanation and monitoring; it cannot autonomously authorize financial actions.
- Maintainer / reviewer: approves standards, releases and privileged operations.

## 2. Canonical lifecycle

`Discover -> Quote -> Reserve -> Authorize -> Settle -> Verify -> Fulfil -> Reconcile -> Measure -> Dispute/Refund (if needed)`

### Discover
The catalog returns product, merchant, asset, availability and current valuation revision. Listings are not offers to redeem tokens for fiat.

### Quote
The merchant creates a time-bounded quote. The quote freezes product ID, quantity, asset ID, integer atomic amount, fee breakdown, valuation revision, expiry and cancellation terms.

### Reserve
The order service reserves inventory using an idempotency key. Reservation expiry and stock release must be deterministic.

### Authorize
The wallet verifies network, merchant signature, asset, amount, fee, nonce and expiry. The user explicitly approves the exact transaction. A QR/NFC scan is never authorization.

### Settle
The payment contract or wallet submits a Testnet transaction. Duplicate callbacks and retries must be idempotent. No floating-point amounts.

### Verify
The backend independently reads the transaction/event from the correct Testnet RPC/Horizon source, verifies success, destination, asset, amount, memo/reference and network, and persists a reconciliation record.

### Fulfil
Merchant fulfillment follows verified settlement and business rules. A client-side success page is insufficient evidence.

### Reconcile
Daily reconciliation compares order DB, chain events, merchant ledger, fees, refunds and outstanding reservations. Differences become explicit exceptions; never silently overwrite history.

### Measure
V18 metrics are computed from deduplicated, settled, reconciled events. Publish the time window, denominator, exclusions, source and data-quality status.

### Dispute / refund
Disputes preserve the original valuation and settlement event. Refunds are separate authorized compensating transactions referencing the original order and policy.

## 3. State machines

Order: `DRAFT -> QUOTED -> RESERVED -> PAYMENT_PENDING -> PAID -> FULFILLED`; alternative terminal states: `EXPIRED`, `CANCELLED`, `DISPUTED`, `REFUNDED`.

Payment intent: `CREATED -> SIGNED -> PRESENTED -> APPROVED -> SUBMITTED -> CONFIRMED`; failure states: `EXPIRED`, `REJECTED`, `FAILED`, `REPLACED`.

Token launchpad: use the PiRC1 crosswalk. Subscription: use PiRC2; recurring charge remains disabled until expiry/revocation semantics are aligned and tested.

Every transition records actor, prior state, next state, policy version, event time, correlation ID and evidence hash. Enforce allowed transitions server-side and, where value is at risk, contract-side.

## 4. Accounting and conservation

Maintain separate ledgers for:
- customer payment obligations;
- merchant payable and platform fees;
- refunds and chargebacks;
- treasury cash and verified reserves (if any);
- token supply and mint/burn events;
- inventory reservations and fulfillment;
- application utility credits.

For each asset and period, reconcile opening balance + inflows - outflows = closing balance. Token supply changes require explicit authorized mint/burn events. Internal reference values must never create ledger entries or alter balances.

## 5. Revenue and distribution policy

Define collected revenue R, verified operating costs C, refunds/chargebacks/taxes/provisions P, and required liquidity reserve L. Distributable surplus is max(0, R - C - P - L). GMV is not revenue; uncollected orders, speculative price appreciation and circular transfers are excluded.

Any participant allocation requires a published eligibility policy, anti-Sybil controls, weights, caps, vesting, dispute process and jurisdictional review. It is not a yield promise.

## 6. Failure handling

- RPC outage: retain pending state, retry with bounded exponential backoff, then reconcile; do not duplicate payment.
- Indexer lag: show pending verification, never mark paid based on stale cache.
- Oracle stale/deviation: quarantine observation and fall back only to an explicitly approved policy; never silently use a stale value.
- Contract pause: stop new writes and expose incident status; preserve read-only access where safe.
- Merchant unavailable: expire or cancel reservation according to signed terms.
- Data correction: append compensating event and preserve audit history.

## 7. Required end-to-end tests

Test successful purchase, expired quote, wrong network, wrong asset, amount tampering, duplicate nonce, replayed webhook, delayed ledger visibility, RPC outage, merchant cancellation, partial fulfillment, refund, dispute, subscription cancellation race, issuer rejection, oracle staleness, contract pause, and reconciliation mismatch.
