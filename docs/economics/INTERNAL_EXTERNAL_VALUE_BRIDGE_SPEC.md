# Internal and External Value Bridge Specification

**Status:** Proposed normative design for review  
**Scope:** PiRC economic reference model and application integration  
**Execution mode:** Disabled by default; simulation and Testnet only  
**Authority:** Community proposal; not official Pi Network monetary policy

## 1. Objective

Define a safe interface between internal reference values, merchant utility prices, observed external market prices, accounting values, collateral marks and legally redeemable liabilities. The bridge is a typed valuation and payment workflow. It is not an automatic currency converter and must never turn a reference value into a cash claim.

## 2. Non-negotiable value domains

| Value domain | Meaning | Required provenance | May settle a payment? |
|---|---|---|---|
| Internal reference | Application/program accounting coordinate | Policy ID, version, effective interval | No, not by itself |
| External market quote | Observed price on a named venue and pair | Venue, pair, timestamp, source, confidence | Only when explicitly approved for the use case |
| Merchant utility quote | Amount accepted for a named product/service | Merchant, product, quote ID, expiry, terms | Yes, after user approval and supported settlement |
| Accounting value | Reporting value under a stated method | Methodology, period, source | No, reporting only |
| Collateral mark | Risk-adjusted value after haircuts and limits | Price source, haircut, liquidity, concentration | No, risk calculation only |
| Redeemable liability | Enforceable obligation of a named issuer | Issuer, legal terms, custody and settlement evidence | Only through the issuer's authorized redemption process |

A single numeric field named `price` is prohibited across these domains. APIs must use explicit typed objects and currency/unit identifiers.

## 3. GCV and sovereign multiplier scenario handling

A scenario may define an internal reference of USD 314,159 and an external observation of USD 0.0314159. Their arithmetic ratio is 10,000,000. The ratio is a scenario parameter only. It does not establish a market target, conversion entitlement, collateral value, reserve, or redemption right.

The following actions must not be triggered by this ratio:
- wallet balance mutation, mint, burn or transfer;
- automatic conversion between mined Pi and externally acquired Pi;
- creation of a debt, deposit, reserve or redemption liability;
- collateral valuation without an independent approved methodology;
- a claim that a user can realize the internal reference in USD.

Any future conversion mechanism requires a separate issuer-authorized specification, explicit source and destination assets, rate source, fees, limits, slippage, user consent, compliance review, settlement proof and reconciliation.

## 4. Quote contract

Every quote must include:
- `quote_id`, `schema_version`, `created_at`, `expires_at`;
- `value_type`, `amount`, `unit`, `asset_id`, `network_id`;
- `source`, `source_timestamp`, `source_reference`, `confidence`;
- `merchant_id` and `product_id` when applicable;
- `policy_version`, `terms_hash`, `status`.

Amounts must be decimal strings or integer base units with explicit decimals. Binary floating-point values are prohibited for settlement and accounting.

## 5. Internal-to-external workflow

1. Resolve the asset and network from the versioned registry.
2. Resolve the requested value domain; reject ambiguous or untyped values.
3. Obtain an external observation only from configured sources and only when the use case requires it.
4. Validate source identity, pair, timestamp, freshness, positive value, decimal precision, confidence and deviation limits.
5. Create a merchant quote or scenario result; never overwrite the internal reference with an external quote.
6. Bind the quote to an expiring payment intent and immutable terms hash.
7. Present fees, amount, network, asset, expiry and refund terms to the user.
8. Require explicit wallet/user authorization.
9. Submit only to the selected environment and supported settlement adapter.
10. Verify transaction finality/readback before marking the order paid.
11. Reconcile chain, application and merchant records using idempotency keys.
12. Emit immutable audit events and metrics from reconciled records only.

## 6. Provenance classes and conversion firewall

Track source class separately from current owner and current balance. Suggested classes are `MINED`, `MIGRATED`, `PURCHASED`, `EARNED`, `MERCHANT_RECEIVED`, `BRIDGED` and `ISSUED`. These labels are application-level evidence and do not imply that a fungible on-chain balance retains protocol-enforced provenance.

A provenance record must include the evidence type, source transaction/ledger, observation time, confidence and verification state. Do not infer legal ownership or source class from a wallet address alone. When evidence is unavailable, set provenance to `UNKNOWN`.

A conversion firewall must reject implicit cross-class conversion. Explicit conversions require policy authorization, source/destination identifiers, a deterministic rate record, user consent, compliance controls, settlement evidence and reconciliation.

## 7. Economic settlement and treasury

Only collected, reconciled revenue may enter distributable-surplus calculations. Let:
- `R_t`: collected and reconciled operating revenue;
- `C_t`: verified costs, refunds, chargebacks, taxes and provisions;
- `L_t`: required liquidity and risk reserves;
- `D_t = max(0, R_t - C_t - L_t)`: distributable surplus.

An illustrative allocation is `B_i = D_t * (w_i / sum(w_j))`, where `w_i` is an approved contribution weight. This is a model, not a user entitlement, yield promise or token-price mechanism. GMV, uncollected invoices, circular transfers and speculative appreciation are not revenue.

## 8. OUSD boundary

OUSD remains a test-only reference asset. It has no verified issuer, USD peg, backing, redemption, market price or production authorization. It must be represented as a distinct test asset with a null contract identifier until a specific test deployment is independently verified. No internal/external price bridge may imply OUSD is worth one USD.

## 9. Failure and circuit-breaker behavior

Reject or pause when:
- quote or oracle data is stale, future-dated, malformed, replayed or outside deviation bounds;
- network identity or asset contract identity cannot be confirmed;
- quote expiry has passed or terms hash differs;
- settlement finality cannot be established;
- idempotency key is reused with different payload;
- accounting reconciliation detects unexplained variance;
- issuer, custody, reserve or redemption evidence is missing for a feature that requires it.

Failures must be visible, auditable and fail closed. No retry may create a second economic effect.

## 10. Acceptance tests

- [ ] Internal reference and external quote are stored and displayed as separate value types.
- [ ] GCV/multiplier scenario calculation cannot mutate balances or create liabilities.
- [ ] Quote schema rejects missing units, source, timestamps and network identifiers.
- [ ] Expired and replayed quotes are rejected.
- [ ] Oracle stale/future/outlier observations trip the configured circuit breaker.
- [ ] Payment status changes to settled only after authoritative readback.
- [ ] Duplicate requests are idempotent.
- [ ] GMV is excluded from recognized revenue until collection and reconciliation.
- [ ] OUSD is labeled TEST ONLY and has no implied USD value or redemption path.
- [ ] Mainnet actions remain disabled pending separate authorization and evidence.


## 12. Dynamic market-linked IPPR reference

The IPPR reference is dynamic, not a fixed USD constant. Under the proposed PiRC-101-aligned Testnet controller, calculate it from a validated multi-source PI/USD median:

`IPPR_raw(t) = median(P_exchange(t)) * QWF(t)`

The baseline QWF is 10,000,000. The exact units, quote freshness, source quorum, outlier policy and QWF governance version must accompany every result. See `docs/standards/DYNAMIC_IPPR_QWF_AND_FOUR_ECONOMIC_GATES.md`.

This dynamic reference does not replace the merchant's accepted asset-denominated price and does not create a redeemable balance. The four gates (oracle integrity, real utility supply, velocity/liquidity, and collateral/settlement solvency) control whether any credit expansion or settlement workflow may proceed. If evidence is absent, stale or under-collateralized, fail closed. The reference can remain informational only.

The intended commerce feedback loop is:

Merchant goods/services/technology → accepted utility quote → authorized payment intent → supported settlement → reconciliation → earned revenue recognition → costs/refunds/provisions/liquidity reserves → governed distributable surplus → approved ecosystem utility and service investment → more available goods/services → measured completed demand and velocity.

Use the revenue equation from the Treasury model, not gross merchandise volume:

`D_t = max(0, R_t - C_t - P_t - L_t)`

Any participant allocation must be computed from eligible, reconciled distributable resources and conserve atomic units after deterministic rounding. This model is a proposal and does not imply a guaranteed token value, fixed parity, or Pi Core Team policy.



External CEX/DEX observations are part of the project's economic information environment and may inform merchant quote presentation, market-risk controls, accounting views, and a separately governed pricing policy. They do not replace the internal reference schedule automatically. A quote must remain typed by venue, pair, timestamp, source, confidence, and policy version. It cannot mutate wallet balances, create redemption liabilities, or rewrite an internal reference value without a separately authorized specification and user-approved settlement flow.

The intended commerce feedback loop is:

Merchant goods/services/technology → accepted utility quote → authorized payment intent → supported settlement → reconciliation → earned revenue recognition → costs/refunds/provisions/liquidity reserves → governed distributable surplus → approved ecosystem utility and service investment.

Use the revenue equation from the Treasury model, not gross merchandise volume:

`D_t = max(0, R_t - C_t - P_t - L_t)`

Any participant allocation must be computed from eligible, reconciled distributable resources and conserve atomic units after deterministic rounding. This model is a proposal and does not imply a guaranteed token value, fixed parity, or Pi Core Team policy.
