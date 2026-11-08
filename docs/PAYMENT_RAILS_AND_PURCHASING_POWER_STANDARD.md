# Unified Payment Rails and Purchasing-Power Accounting Standard

**Status:** PROPOSED / IMPLEMENTATION REQUIREMENTS. This document does not certify a payment-provider integration, PCI compliance, biometric identity, Pi payment, bank connection, or Testnet deployment.

## 1. Purpose and scope

Define one application-facing payment intent and reconciliation model for QR, NFC, Pi Platform payments, Visa, Mastercard, bank/open-banking transfers, hosted payment providers, digital wallets and device-local biometric approval. Payment rails are adapters around a common intent; they are not interchangeable settlement networks.

The standard covers merchant checkout, wallet authorization, external payment capture, refunds, chargebacks, FX observations, internal unit accounting, ledger settlement and audit evidence.

## 2. Non-negotiable separation of value domains

Never collapse these values into one price or balance:

- **External market observation:** timestamped CEX/DEX quote with venue, pair, bid/ask, depth, currency, source and confidence.
- **Internal utility reference:** governed unit reference used for eligible in-ecosystem goods/services. It is not a cash redemption promise or guaranteed exchange price.
- **Merchant quote:** itemized price, currency, quantity, tax, fees, expiry and accepted rails.
- **Payment amount:** amount authorized/captured by a named provider in its settlement currency.
- **Chain amount:** integer atomic units for a named token contract and network.
- **Accounting amount:** booked amount, FX source, valuation time, rounding policy and liability classification.

Market movement may update a governed valuation snapshot or merchant quote after freshness, quorum, deviation and risk checks. It must not rewrite historical transactions, mutate token balances, silently reprice an already-authorized intent, or convert internal reference units into a guaranteed USD amount.

Persist the original quote and its market snapshot. If the quote expires or exceeds configured deviation, require a new quote and explicit customer approval.

## 3. Canonical payment intent

Every rail MUST map to a versioned payment intent with at least:

- `intent_id`, `idempotency_key`, `schema_version`, `created_at`, `expires_at`.
- `merchant_id`, `customer_ref` (pseudonymous), `order_id`, line items and fulfillment reference.
- `network_id`, `asset_id`, token contract ID and decimals only when a chain asset is involved.
- Amount as integer minor/atomic units plus ISO-4217 currency or explicit token-unit metadata; never use floating point for settlement.
- Quote ID, valuation snapshot ID, FX source, timestamp, spread, fees, rounding mode and expiry.
- Requested rail, provider reference, authorization/capture/refund state and settlement reference.
- Risk decision, consent scope, policy version, audit correlation ID and reconciliation status.

State machine:
`CREATED → QUOTED → CUSTOMER_APPROVED → AUTHORIZED → CAPTURED → SETTLED → RECONCILED`.

Alternative terminal or compensating states include `EXPIRED`, `DECLINED`, `CANCELLED`, `REVERSED`, `REFUND_PENDING`, `REFUNDED`, `CHARGEBACK`, `DISPUTED` and `MANUAL_REVIEW`. A webhook or client redirect alone cannot advance an intent to `SETTLED`.

## 4. Rail adapters

### 4.1 QR and NFC

Use signed, short-lived, single-use payment intents. The QR/NFC payload should contain an opaque intent reference or authenticated URI, merchant identity, expiry and integrity signature—not card PAN, CVV, private keys, biometric templates or unnecessary personal data. Resolve the full order and amount server-side. Bind NFC tap/QR scan to the same intent and prevent replay with nonce, expiry and idempotency controls.

Dynamic QR is preferred for amount-specific checkout. Static merchant QR requires customer confirmation of merchant and amount before authorization.

### 4.2 Pi Platform / Pi wallet

Pi authentication and wallet-address binding are not transaction-signing authority. Request payment scope only after an explicit customer payment action. Verify payment completion and server-side callbacks using the supported Pi Platform flow; bind the payment to one order and handle incomplete, cancelled and developer-approved states idempotently. Do not imply that a Pi wallet address alone authorizes arbitrary Soroban transactions.

### 4.3 Visa and Mastercard

Card acceptance MUST be performed by a properly contracted/acquiring PSP or gateway. Prefer provider-hosted checkout or hosted fields and provider-issued tokens. The application MUST NOT store or log PAN, CVV/CVC, PIN, track data or raw authentication secrets. Keep card data out of PiRC, SmartContracts and Unity Sphere repositories and client logs.

Require provider authentication, webhook signature verification, replay protection, idempotency, authorization/capture separation, settlement reports, refund and chargeback handling, currency/fee disclosure and reconciliation against provider settlement references. Apply PCI DSS scope reduction and obtain the applicable acquirer/PSP compliance evidence; do not claim PCI compliance merely because tokenization is used.

3-D Secure / issuer step-up is controlled by the provider and issuer risk decision. A successful redirect is not proof of capture or settlement.

### 4.4 Bank transfers and other digital rails

Use provider-specific adapters for bank transfer, open banking, local payment methods and digital wallets. Each adapter must declare supported countries/currencies, settlement finality, refundability, dispute window, fees, limits, KYC/AML responsibilities, webhook model and availability. Unknown or unsupported methods remain disabled rather than falling back to an unrelated rail.

### 4.5 Biometric approval

Biometrics are a local device-authentication or passkey-unlock mechanism, not a payment rail, payment instrument, proof of legal identity, or transferable credential. Prefer OS-managed biometric unlock of a passkey/private key. The application MUST NOT collect, transmit or store face/fingerprint templates or raw biometric samples. Store only the minimum provider/device assertion and consent/audit metadata required for the flow. Provide a non-biometric fallback and explicit step-up policy.

## 5. Oracle, market synchronization and purchasing power

Market data ingestion must retain source, venue, instrument, bid/ask, depth, timestamp, sequence, signature where available, and data-quality status. Use independent source quorum, freshness limits, deviation bounds, manipulation detection, circuit breakers and fallback-to-stale prohibition for executable quotes.

A governed valuation service may calculate a new reference snapshot. It must publish a versioned snapshot and effective time; contracts consume only an approved snapshot or bounded parameter update. No oracle may directly mint, burn, transfer user assets or alter historical balances.

For a basket of goods/services, keep unit quantity and market valuation separate. A quote may be expressed in currency and in internal utility units, but both values and the conversion snapshot must be visible. Preserve atomic-unit integer arithmetic, decimal metadata, deterministic rounding and supply conservation. Do not assert that a reference such as GCV is a market price, collateral value or redeemable liability.

## 6. Contract packaging and on-chain boundary

Soroban contracts should own only deterministic on-chain state transitions: authorized token transfers, escrow/settlement state, allowlisted asset references, replay protection, bounded fees and emitted events. Card PAN, PSP credentials, bank data, biometric data, full invoices and private customer information MUST remain off-chain.

Package each contract as a reproducible Rust workspace crate with pinned SDK/toolchain and lockfile, `cdylib` WASM artifact, generated interface/spec, unit and adversarial tests, deployment manifest, SBOM, source commit and SHA-256 artifact hash. Record per network: passphrase/network ID, protocol compatibility, deployment transaction, contract ID, deployed code hash, initialization state, admin/issuer authority, pause state and independent readback.

No contract is `TESTNET_VERIFIED` until deployed on the explicitly named Testnet, the transaction is confirmed, code hash and state are read back, and functional tests exercise the deployed instance. A successful local build or unit test is not deployment proof.

## 7. Security, privacy and financial controls

- Authenticate and authorize each state transition server-side; least privilege and separation of duties.
- Signed provider webhooks, timestamp tolerance, replay protection and durable idempotency keys.
- Amount/currency/merchant/order binding at authorization and capture.
- Rate limits, velocity controls, fraud screening and manual review paths.
- Explicit customer consent for amount, currency, rail, fees, FX and recurring charges.
- Double-entry accounting; immutable event journal; corrections through compensating entries.
- Refunds, reversals, disputes and chargebacks must not be modeled as deletion of the original payment.
- Secrets in server-side secret stores only; key rotation, audit trails and incident response.
- Minimize personal data and define retention/deletion policies per jurisdiction and provider.
- No autonomous agent may approve a payment, alter a quote, release escrow or use a production signer without a narrowly scoped, independently authorized policy.

## 8. Required test matrix

For every adapter test success, decline, timeout, duplicate request, duplicate/out-of-order webhook, invalid signature, expired intent, amount mismatch, currency mismatch, replay, partial capture, cancellation, refund, reversal, chargeback, provider outage, FX staleness, oracle deviation, rounding boundary and reconciliation mismatch.

For chain settlement test wrong network/passphrase, wrong contract, unauthorized caller, replay, pause, insufficient balance, slippage/minimum output, overflow, duplicate event, failed transaction, event/state mismatch and delayed ledger finality.

Use provider sandbox credentials and Testnet assets only. Never use live card details or Mainnet funds as fixtures.

## 9. Readiness and evidence states

Use `PROPOSED`, `SPECIFIED`, `IMPLEMENTED`, `SANDBOX_TESTED`, `TESTNET_VERIFIED`, `SECURITY_REVIEWED`, `AUDITED` and `PRODUCTION_VERIFIED`. Every promotion needs a pinned commit, workflow run, environment, test report, provider/network evidence, artifact hash and reviewer. Do not label a rail, wallet, contract, reserve, liquidity pool or payment method active without that evidence.

## 10. Cross-repository ownership

- **PiRC:** this normative standard, schemas, pricing/accounting policy, risk limits and release gates.
- **SmartContracts:** Soroban escrow/settlement/token contracts, authorization, events, deterministic arithmetic and tests. No card/bank/biometric payloads on-chain.
- **Unity Sphere:** checkout UI, QR/NFC intent creation, Pi SDK integration, PSP/bank adapters, server-side webhook processing, event inbox, market quote display, accounting journal and reconciliation.

All integrations use versioned schemas and pinned source/ABI revisions. The app must clearly distinguish simulated, provider sandbox, Testnet-verified and production-verified functionality.

---
This standard is an engineering proposal, not legal, financial, banking, payment-provider or compliance approval. Availability and permitted use of each rail depend on licensed providers, acquirers, jurisdiction, customer eligibility and independent review.
