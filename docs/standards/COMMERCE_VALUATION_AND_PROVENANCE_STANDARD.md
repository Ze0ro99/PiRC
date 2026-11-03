# Commerce Valuation and Provenance Standard

**Status:** Proposed standard. **Network:** Pi Testnet only.

## Canonical principles

1. Product value, payment amount, fiat estimate, token price, reserve value, and market quote are distinct fields.
2. Settlement uses integer atomic units only. Never use floating-point arithmetic for amounts.
3. Every price revision is append-only and versioned. A purchase references the exact version accepted by the buyer.
4. Every lifecycle transition emits a traceable event; private personal data stays off-chain.
5. An oracle quote is evidence with a source and timestamp, not a guarantee of fair value or redemption.

## Valuation record

Required fields:
- `valuation_id`, `product_id`, `seller_app_id`, `revision`
- `unit`, `quantity_available`, `unit_price_atomic`, `asset_id`, `asset_decimals`
- `valuation_method`, `created_at`, `valid_until`
- `quote_source`, `quote_timestamp`, `confidence_bps` (optional)
- `evidence_hashes[]`, `review_state`, `supersedes_valuation_id` (optional)

Allowed valuation methods: seller-set, comparable-sales, oracle-assisted, governance-reviewed. Method and evidence must be visible to the user. Do not represent an AI-generated estimate as an oracle-signed price.

## Usage event

Every checkout/fulfilment/refund event references `valuation_id` and includes:
- order ID, product ID, app ID, quantity, payer/merchant pseudonymous references;
- asset ID, integer amount, fee amount, fee policy version;
- payment-intent nonce, idempotency key, event type and event timestamp;
- network ID, ledger/transaction reference, contract ID and event hash.

Events are append-only. Corrections are compensating events, not destructive edits.

## Product lifecycle

`DRAFT -> LISTED -> RESERVED -> PAID -> FULFILLED`

Alternative transitions:
- `LISTED/RESERVED -> CANCELLED`
- `PAID -> DISPUTED -> REFUNDED | RESOLVED`

A state transition must be authorized, idempotent, and validated against the prior state. No fulfillment based solely on a client-side success screen; verify chain settlement/readback and merchant fulfillment evidence.

## Storage model

On-chain: commitments/hashes, contract-enforced state, payment references and minimum fields required for dispute resolution.

Off-chain: product descriptions, photos, invoices, shipping details, customer information and bulky evidence. Store in access-controlled storage with retention/deletion policy; only publish salted or privacy-preserving commitments where appropriate.

## Valuation integrity

- Do not silently reprice an active payment intent.
- Expired quotes require a new intent and fresh buyer approval.
- Fiat reference conversion never changes the Pi amount automatically.
- Tax, delivery, platform fee and merchant price are separate line items.
- Refund amount and asset follow the original transaction terms and applicable contract policy.
