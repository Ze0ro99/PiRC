# Dynamic IPPR, QWF and Four Economic Gates

**Status:** Proposed Testnet reference standard; requires maintainer review and cross-repository conformance.  
**Scope:** PiRC economic reference index, PiRC-101 alignment, Oracle inputs, commerce velocity and utility constraints.  
**Network:** Pi Testnet1 only.  
**Authority:** Community engineering proposal; not official Pi Network monetary policy, a price guarantee, a redemption commitment or proof of collateral.

## 1. Corrected dynamic reference

The internal purchasing-power reference (IPPR) must not be a hard-coded USD amount. Its raw market-linked reference is recalculated from a validated current Pi/USD market observation:

`IPPR_raw(t) = P_exchange_median(t) × QWF(t)`

The baseline QWF is `10,000,000`. For example, PI/USD = `$0.0314159` is represented as `31,415,900` nano-USD; multiplying by QWF yields `314,159,000,000,000` nano-USD, or `$314,159` per Pi as an internal reference index. The market quote is expressed in USD per PI, and the result is a reference USD-unit per PI under this proposal. For deterministic implementations, use integer nano-USD per PI and integer arithmetic:

`raw_ippr_nano_usd_per_pi = median_price_nano_usd_per_pi * qwf_multiplier`

This makes the reference move with the market price. A price change must propagate to the next accepted quote/epoch; it must never silently remain a fixed legacy amount.

## 2. PiRC-101 reflexive controller

The archived PiRC-101 source describes QWF as a governed base multiplier of 10^7 with bounded adjustment informed by economic velocity and TVL/liquidity, and an IPPR reference around USD 2.248M in that historical snapshot. That fixed number is not the live formula and must not be carried forward as a constant.

The intended control boundary is:

`QWF_next = clamp(QWF_current * (1 + adjustment_rate), QWF_min, QWF_max)`

Any QWF adjustment must be discrete, versioned, proposal/governance approved, and backed by published input metrics. The exact `adjustment_rate`, `QWF_min`, `QWF_max`, epoch, TVL definition and PiRC-101 `Phi` function must be taken from an approved canonical PiRC-101 revision. Until pinned and reviewed, the multiplier remains the 10,000,000 baseline and no autonomous QWF changes are permitted.

The reference controller may apply a bounded `guardrail_bps` to produce a risk-adjusted index. It is a reporting/gating factor only; it is not a minting instruction.

## 3. Oracle aggregation and freshness

- Require at least three independent venue/source observations.
- Normalize pair and quote currency to PI/USD before aggregation.
- Retain venue, pair, bid/ask, depth, volume, timestamp, confidence and source identity.
- Use a deterministic median; reject duplicate venues, zero/negative values, future timestamps and stale observations.
- Default reference implementation policy: maximum age 120 seconds and maximum deviation 1,500 bps from the median. These are conservative Testnet defaults, not immutable protocol constants; governance must version any changes.
- A failed quorum, stale feed or deviation breaker makes the quote unavailable. Do not fall back to a hard-coded price.

## 4. Four additional economic gates

All gates are independently observable. A market-linked IPPR number may be displayed as a reference, but any credit expansion, REF issuance, merchant settlement or claim of spendable purchasing power must remain blocked unless the required gates pass.

### Gate 1 — Oracle and market integrity
Three or more independent sources, correct PI/USD units, freshness, sequence/replay protection, bid/ask and depth checks, deviation limits and source-health status. Failure => STALE/QUARANTINED; no new active quote.

### Gate 2 — Real utility and goods/services supply
Require active verified merchants, available listings/inventory, fulfilled orders, product/service evidence, accepted settlement terms and measured supply capacity. Exclude mock listings, cancelled orders, synthetic volume, circular trades and unfulfilled promises. No verified supply => reference-only; no expansion.

### Gate 3 — Economic velocity and accessible liquidity
Measure settled eligible transaction value over a defined window divided by average relevant money stock; separately report completed orders, repeat purchase, inventory turnover, settlement latency, PiDEX depth, slippage and concentration. Exclude self-transfers, wash/circular volume, duplicate events and unresolved settlements. Liquidity must be available in the same asset, venue and settlement window. No activity or insufficient depth => gate closed.

### Gate 4 — Collateral, solvency and settlement
For any issued REF or redeemable liability, independently verified eligible reserves after haircuts must cover outstanding liabilities under the approved risk policy. Validate custody, encumbrance, legal issuer, redemption terms, concentration, exit queue and settlement read-back. A zero-liability denominator is NOT_APPLICABLE, not infinite coverage. Under-collateralization, missing evidence or uncertain finality => no issuance/settlement; fail closed.

## 4A. Four interoperable gateway services

These are four software/API gateways implementing the four economic gates; they are not four new tokens or independent sources of monetary authority.

1. **Market Data Gateway:** accepts signed venue observations, normalizes PI/USD pairs, computes the median, enforces freshness/quorum/deviation, and publishes immutable quote IDs and expiry.
2. **Utility & Commerce Gateway:** connects merchant catalogues, verified listings, inventory, product/service evidence, buyer orders, fulfilment, refunds and merchant-accepted asset quotes.
3. **Velocity & Liquidity Gateway:** consumes reconciled settlement events, calculates declared-window turnover/velocity, order/repeat-purchase metrics, PiDEX depth, spread, slippage and concentration.
4. **Solvency & Settlement Gateway:** verifies reserve attestations, liabilities, haircuts, exit queues, network identity, transaction finality and canonical read-back; it alone may return settlement-eligible status after all required checks.

Each gateway exposes versioned request/response schemas, network_id, observed_at, expires_at, policy_version, evidence references, correlation IDs and idempotency keys. Gateways communicate through typed events and stable asset IDs. The client must not bypass a gateway or infer PASS from a successful HTTP response. A failed dependency propagates a fail-closed status. PiRC owns standards; SmartContracts owns on-chain enforcement; Unity Sphere/Lovable consume the versioned API contracts. All writes remain Testnet1-only.

## 5. Economic loop and feedback controls

The measurable loop is:

`External market observations -> Oracle quorum -> dynamic IPPR reference -> merchant quote and available goods/services -> user-authorized payment intent -> Testnet settlement -> finality/read-back -> reconciliation -> eligible collected revenue -> costs/refunds/taxes/reserves -> approved utility investment -> more goods/services and fulfilled demand -> measured velocity/liquidity -> governed QWF review`

Publish separate metrics; do not collapse them into a single opaque score:
- goods/services: active merchants, active listings, inventory quantity/value by asset, fulfilled units, delivery/quality evidence;
- demand: unique buyers, completed orders, repeat purchase, cancellation/refund/dispute rates;
- velocity: settled transaction value / average relevant supply for a declared window;
- liquidity: same-asset accessible depth, spread, slippage and concentration;
- solvency: reserve coverage, liabilities, exit queue and stress loss;
- performance: quote age, oracle quorum, checkout p50/p95 and settlement latency.

GMV is not collected revenue. Forecast supply, uncollected invoices, internal circular transfers and token appreciation are not distributable resources.

## 6. Four gate outputs and statuses

Each gate returns `PASS`, `FAIL`, `STALE`, `NOT_APPLICABLE` or `REVIEW_REQUIRED`, with evidence references and timestamps. The aggregate status is the strictest failed state. A reference-only index must never be rendered as a wallet balance, redeemable USD value, collateral claim or guaranteed merchant purchasing power.

## 7. Implementation and security invariants

- Fixed-point/integer arithmetic only; no binary floats for prices, balances, ratios or settlement.
- Store market quote and IPPR reference as separate typed values.
- Every quote carries asset, pair, venue/source, observed_at, expires_at, policy version, network and confidence.
- Never mutate Pi wallet balances or mint/burn/transfer because IPPR changed.
- Never create a liability or promise redemption from the multiplier.
- Payment amount is the merchant's accepted asset-denominated quote, not IPPR multiplied by a wallet balance.
- Only reconciled, collected revenue may fund utility allocation.
- Mainnet remains disabled. Testnet artifacts must carry explicit Testnet1 provenance.

## 8. Reference implementation

- `reference/dynamic_ippr.py`
- `tests/test_dynamic_ippr.py`

The reference implementation calculates the median market-linked IPPR, enforces oracle freshness/quorum/deviation, and evaluates the four gates. It intentionally does not deploy contracts, submit payments, issue REF, custody assets, or claim the gates have been satisfied by live network evidence.
