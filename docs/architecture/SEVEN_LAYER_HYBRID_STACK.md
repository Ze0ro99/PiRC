# Seven-Layer Hybrid Economic Stack

The seven layers form one controlled workflow with explicit interfaces. Color labels are visual identifiers only.

## L1 — Blue: Network and Settlement
Own network adapters, chain IDs/passphrases, RPC/Horizon configuration, transaction submission, confirmation tracking and reconciliation. Maintain separate Pi Mainnet, Pi Testnet, Stellar Mainnet and Stellar Testnet profiles. Pin protocol and SDK compatibility independently.

## L2 — Green: Pi Cash and Payments
Own payment intents, merchant invoices, quotes, authorization, settlement, refunds and reconciliation. Suggested state machine: CREATED, QUOTED, AUTHORIZED, SUBMITTED, CONFIRMED, SETTLED, FAILED, EXPIRED, REFUNDED. Every transition is idempotent and backed by a transaction reference or explicit failure reason. Proposed software module, not an official Pi product.

## L3 — Gold: Pi Bank and Treasury
Own accounting sub-ledgers, reserve records, treasury policy, custody integrations, multi-signature approvals and redemption workflow. Separate customer liabilities from treasury assets. Do not imply deposit-taking, insured balances, guaranteed yield or regulated banking. Stable assets require enforceable redemption rights, reserve custody and independent attestations.

## L4 — Orange: Hybrid Assets and PiDEX
Own asset registry, token metadata, issuer/contract verification, trading pairs, pool accounting, fee policy and market-integrity controls. Asset states: DISCOVERED, UNVERIFIED, VERIFIED_TESTNET, VERIFIED_MAINNET, SUSPENDED, RETIRED. A logo is not proof of legitimacy. Unverified assets are excluded from trading by default.

## L5 — Red: Economic Intelligence
Own fixed-point calculations, valuation labels, liquidity, velocity, risk and simulation. Every formula needs dimensional analysis, units, rounding rules, overflow bounds, invalid-input behavior and property tests. Market price, internal reference and redeemable value remain separate.

## L6 — Violet: Oracle and Interoperability
Own commodity/service feeds, market adapters, reserve attestations, source reputation, freshness windows, deviation limits, quorum and cross-network verification. Oracle output carries source IDs, timestamp, unit, quality flags and aggregation method. Chainlink is network-specific; do not assume EVM contracts run on Soroban.

## L7 — Charcoal: Governance, Identity and Security
Own proposal lifecycle, roles, multisig, timelocks, identity proofs, privacy, audit events, compliance configuration, incident response and release approval.

## Cross-layer transaction flow
1. L2 creates a payment intent and requests a quote from L5.
2. L4 validates the asset and route.
3. L6 supplies external data where required.
4. L7 validates roles, policy and risk limits.
5. L1 submits to the selected network.
6. L1 tracks finality; L2 reconciles merchant payment.
7. L3 records treasury/liability entries where applicable.
8. All layers emit correlated audit events with a shared operation ID.

## Mandatory message envelope
Every cross-service message includes schema_version, operation_id, correlation_id, created_at, environment, network_id, asset_id, amount_atomic, decimals, source, status and idempotency key. Never include secrets or unnecessary personal data.
