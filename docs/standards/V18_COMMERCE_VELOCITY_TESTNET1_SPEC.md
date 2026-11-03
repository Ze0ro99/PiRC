# V18 Commerce Velocity, Pi Protocol v28, and Testnet1 Integration Specification

**Status:** Proposed implementation specification  
**Target:** Pi Testnet1 only  
**Protocol baseline:** Pi/Stellar protocol v28 compatibility profile  
**Normative dependencies:** PiRC1 launchpad/token issuance rules and PiRC2 subscription/service lifecycle rules, subject to canonical text and maintainer review  
**Important:** This is a community implementation proposal. It does not claim Pi Core Team approval, official PiRC status, live payment rails, production contracts, or redeemable asset value.

## 1. Goals and boundaries

Build a measurable commerce and application-token ecosystem connecting product listings, product valuation, QR/NFC checkout, payment intents, Soroban contracts, application tokens, subscription services, and AI-assisted operations.

All financial flows, token issuance, contract deployments, QR/NFC settlement, and agent-triggered actions MUST remain on Testnet1 until standards, contracts, security review, and network compatibility are independently verified.

Distinguish Pi-denominated product prices from fiat reference estimates; market quotes from internal indices; product valuation from token price and collateral value; testnet balances from real value; KYB records from integrated providers; app-token proposals from issued tokens; and contract-instance lookup from verified source, WASM hash, issuer authority, and audit status.

## 2. V18 Commerce Velocity Index

V18 is an application/economic throughput metric, not a ledger protocol version.

For a measurement window W, publish these independently:
- completed_orders: settled orders in W.
- unique_buyers, unique_sellers, active_apps.
- gross_product_value_pi: sum of settled product prices in Pi units.
- gross_product_value_usd_estimate: optional estimate with quote source and timestamp.
- median_checkout_latency_ms and p95_checkout_latency_ms.
- repeat_purchase_rate: buyers with at least 2 completed orders / unique buyers.
- inventory_turnover: units sold / average available inventory, where verifiable.
- payment_success_rate: successful settlements / valid payment intents.
- dispute_rate, refund_rate, reversal_rate.
- velocity_per_active_user: completed settled orders / unique active buyers.
- velocity_per_app: completed settled orders / active apps.

Do not collapse these into one opaque score. If a composite V18 score is displayed, publish its formula, weights, window, sample size, confidence interval, missing-data policy, and version. Exclude cancelled, expired, duplicated, replayed, and synthetic events from real-activity numerators. Testnet dashboards must label all values as test activity.

## 3. Product valuation and provenance ledger

Every product listing MUST carry a versioned valuation record:
- product ID, seller/app ID, category, unit and quantity.
- asking price and accepted price in the settlement asset.
- asset/network identifier and decimals.
- optional fiat reference quote, source, timestamp, and confidence.
- valuation method: seller-set, comparable-sales, oracle-assisted, or governance-approved.
- evidence references (invoice hash, catalogue record, delivery-proof hash); do not put personal data on-chain.
- validity interval, revision number, reviewer/attestation state.
- tax, shipping, and fees separately itemized.
- status: draft, listed, reserved, paid, fulfilled, disputed, refunded, cancelled.

At each meaningful use, append an immutable event referencing the valuation version used at checkout. Never overwrite historical valuation. Bind the event to product, seller, pseudonymous buyer reference, quantity, asset, amount, fee, order ID, payment-intent nonce, ledger/transaction reference, timestamp, and valuation-record hash.

The canonical asset amount is integer atomic units (stroops for Pi-compatible 7-decimal representation where applicable). Never use floating-point arithmetic for settlement. Fiat estimates are informational and must not silently alter the amount charged.

On-chain storage should hold the minimum verifiable commitment and state needed for contract enforcement. Larger product descriptions, receipts, and personal data belong in access-controlled off-chain storage, referenced by content hashes. Events must be auditable without exposing private customer data.

## 4. QR and NFC checkout

QR and NFC MUST transport a signed payment intent, not private keys or an unrestricted payment command.

Required payment-intent fields:
- schema/version, network ID, merchant/app ID.
- order ID, product/valuation hash, quantity, asset identifier, exact amount, fee policy.
- nonce, created-at, expires-at, callback/deep-link target.
- optional customer binding and refund/dispute policy.
- merchant signature and key ID.

Security requirements:
- Validate network and asset before displaying approval.
- Bind nonce to merchant + order + payer; reject replay and duplicate settlement.
- Enforce expiry and idempotency at API and contract layers.
- Show merchant identity, item, quantity, total, fee, and asset before wallet approval.
- Do not auto-sign or auto-submit a transfer from a QR/NFC scan.
- Treat NFC tag contents as untrusted; model cloning and relay threats.
- Never place seed phrases, secret keys, or signing credentials in QR/NFC.
- Refunds and cancellations are separate authorized contract actions, not edits to the original event.

## 5. PiRC1 and PiRC2 alignment

PiRC1 integration surface:
- Launchpad/app proposal intake and transparent token-creation lifecycle.
- App identity, issuer identity, token metadata, supply policy, allocation/vesting, disclosure, anti-rug controls, liquidity and risk warnings.
- Separate proposal, approved, deployed, active, paused, and retired states.
- Token deployment requires explicit issuer authorization and independent review; no agent may mint or list a token solely from an unreviewed app request.

PiRC2 integration surface:
- Service/subscription lifecycle and recurring service charges.
- Versioned service and subscription records, allowance/approval loss, idempotent cycle processing, trial/claim rules, cancellation, expiry, and clear error outcomes.
- A subscription is not a fungible app token. Keep service entitlements and token balances as separate state machines.

Pin the exact canonical PiRC1/PiRC2 text and contract revisions by commit SHA in the release manifest before declaring conformance. This proposal does not supersede canonical PiRC documents.

## 6. Application-token launchpad

Each app-token proposal must include:
- verified app/issuer identity and app domain.
- token name, symbol, decimals, purpose, utility and prohibited claims.
- total/max supply, mint/burn authority, allocation table, vesting and unlock schedule.
- treasury and liquidity policy, if any, with explicit test-only flags.
- transfer restrictions, pause/emergency controls, upgrade policy and timelock.
- disclosure of concentration, conflicts, risks, dependencies, and oracle sources.
- test suite, contract source commit, WASM hash, deployment network and instance ID.
- governance/review decisions and a versioned audit trail.

Launchpad states: DRAFT -> SUBMITTED -> REVIEW -> APPROVED_TESTNET -> DEPLOYED_TESTNET -> OBSERVATION -> ELIGIBLE_FOR_SEPARATE_REVIEW. No automatic promotion to Mainnet.

## 7. Soroban contract boundaries

Recommended independently testable modules:
1. ProductRegistry: product and valuation-version commitments.
2. CommerceEscrow: order reservation, payment confirmation, fulfilment, dispute and refund state.
3. PaymentIntentRegistry: nonce, expiry, idempotency and settlement references.
4. AppTokenFactory/LaunchpadRegistry: proposal lifecycle and approved test deployments.
5. SubscriptionAdapter: PiRC2 service lifecycle adapter; do not duplicate canonical subscription accounting.
6. CommerceMetrics: event indexing/aggregation interface; avoid expensive global on-chain counters.
7. AgentPolicyRegistry: capabilities, rate limits, allowlists, expiry and revocation.

Use role-based authorization, checked integer arithmetic, bounded inputs, replay protection, explicit storage TTL/extension strategy, deterministic events, and upgrade timelocks. A successful RPC call does not prove a contract is safe or economically sound.

## 8. AI agents

Agents may classify listings, detect duplicate products, summarize risk disclosures, estimate comparable prices, monitor stale quotes, reconcile events, and propose operational actions.

Agents MUST be read-only by default. Any write action requires:
- narrowly scoped capability and allowlist;
- policy checks and rate limits;
- human or authorized app approval for financial/issuer-sensitive actions;
- deterministic validation before submission;
- separate wallet signer that the agent cannot export or inspect;
- complete audit logs, trace IDs, and a kill switch.

Agents must not autonomously mint tokens, change prices after buyer approval, transfer assets, release escrow, approve issuers, or bypass KYB/compliance gates. AI valuation is advisory, not an oracle or proof of reserves.

## 9. Protocol v28 compatibility and automatic upgrade tracking

Pin the current protocol compatibility profile and SDK/toolchain versions in a machine-readable release manifest. CI should:
1. monitor authoritative Pi/Stellar protocol and SDK release sources;
2. open an update PR when a new release or network parameter change is detected;
3. run compile, unit, integration, contract, RPC compatibility, and regression tests;
4. produce a compatibility report and migration notes;
5. require maintainer approval before changing pinned versions or deploying contracts.

Automatic detection and PR generation are permitted. Automatic production upgrades, contract migrations, or Mainnet deployments are not. A Testnet1 canary must pass before a proposed release is eligible for broader review.

## 10. Testnet1 test matrix

Required suites:
- Protocol/RPC: Horizon and Soroban connectivity, network passphrase, protocol version, ledger close time, fee/reserve behavior, pagination and error handling.
- Contracts: initialization, authorization, integer overflow, state-transition safety, storage expiry, duplicate calls, replay, nonce expiry, cancellation, refund and dispute.
- Commerce: listing edits, valuation-version immutability, price/asset mismatch, partial quantity, stale quote, failed payment, duplicate webhook, fulfilment proof.
- QR/NFC: malformed payload, tampering, expiry, cloned tag, replay, wrong network, wrong asset, deep-link spoofing, user cancellation.
- Launchpad: issuer mismatch, duplicate symbol, supply cap, unauthorized mint, vesting boundaries, pause/unpause, disclosure completeness.
- PiRC2: allowance loss, cycle boundaries, trial reuse, cancellation, repeated process calls and charge idempotency.
- Agents: prompt injection from listings, poisoned metadata, tool overreach, policy denial, key isolation, audit completeness and kill switch.
- Load/resilience: throughput, p50/p95/p99 latency, queue backpressure, oracle outage, RPC outage, indexer lag and recovery.
- Security: dependency scanning, secret scanning, fuzz/property tests, static analysis and independent review.

## 11. Environments and release gates

- local: deterministic mocks and contract unit tests.
- ci: isolated ephemeral fixtures; no real credentials.
- testnet1: only permitted network for end-to-end tests and test token deployments.
- preview: UI/API preview; network explicitly pinned to Testnet1 or read-only mocks.
- production: disabled until separate approval, audit, policy, and deployment plan exists.

Environment variables must be documented by name and purpose, never committed with values. Use least-privilege credentials and separate signer services. No secret, seed phrase, private key, or bearer token may enter logs, QR/NFC payloads, or agent context.

Release gate requires reproducible builds, green required tests, contract source/WASM hashes, verified Testnet1 network identity, deployment transaction references, test report, rollback plan, and maintainer sign-off.

## 12. Open compatibility questions

Before marking this specification implemented:
- Confirm the exact official Testnet1 network passphrase, RPC/Horizon endpoints, and meaning of the team's Testnet1 label.
- Pin the canonical PiRC1 and PiRC2 documents and contract revisions.
- Confirm which v28 SDK/runtime combinations are supported by the target Testnet1 network.
- Define the V18 composite-score formula only after raw metrics and data quality are validated.
- Resolve the existing Gold/Indigo registry discrepancy without silently changing the seven-layer mapping.
