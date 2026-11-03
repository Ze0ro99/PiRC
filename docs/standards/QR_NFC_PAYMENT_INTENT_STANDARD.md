# QR / NFC Payment Intent Standard

**Status:** Proposed security standard. **Network:** Pi Testnet only.

QR codes and NFC tags are untrusted transport channels for a bounded, signed payment intent. They are never wallets, signing devices, or authorization to transfer funds.

## Payload envelope

Required fields:
- `schema`, `version`, `network_id`
- `merchant_app_id`, `merchant_key_id`
- `order_id`, `product_id`, `valuation_id`
- `asset_id`, `amount_atomic`, `quantity`, `fee_policy_id`
- `nonce`, `issued_at`, `expires_at`
- `callback_uri` (allowlisted scheme/domain only)
- `signature`

Use a canonical serialization and a reviewed signature scheme supported by the wallet/platform. Reject unknown critical fields and unsupported schema versions.

## Validation

Wallet/app must validate:
1. network and asset match the active Testnet configuration;
2. merchant identity and signature;
3. amount, quantity, fee and valuation revision;
4. nonce uniqueness and intent expiry;
5. callback/deep link against an allowlist;
6. no duplicate order settlement or prior nonce consumption.

Display merchant, product, quantity, asset, total and fee before the user confirms in the wallet. Scanning alone must never sign or submit.

## QR-specific threats

Test malformed symbols, truncated payloads, substituted merchant IDs, lookalike URLs, malicious deep links, screenshot replay, expired intents and payload tampering.

## NFC-specific threats

Treat tag data as attacker-controlled. Test cloning, relay, tag replacement, interrupted reads, NDEF parser edge cases and stale payloads. NFC proximity is not proof of merchant identity or payment completion.

## Backend/contract idempotency

Bind a nonce to the merchant, order and payer. Consume it atomically with settlement or reservation. Repeated API callbacks, RPC retries and duplicated events must not create duplicate charges. Keep replay records for at least the payment-intent validity and dispute window.

## Privacy and key safety

Never encode seed phrases, private keys, bearer tokens, user PII, or reusable signing authorization. Do not log complete customer-bound payloads. A payment intent must be short-lived and narrowly scoped.
