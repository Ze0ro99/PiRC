# Upstream PiRC Feedback, Economic Model, and Integration Gap Analysis

**Assessment date:** 2026-11-03  
**Status:** Community research and implementation guidance; not an official Pi Network specification.  
**Scope:** Selected upstream PiRC proposals, pull requests, and open issues, translated into testable integration requirements.

## 1. Executive assessment

This note consolidates recurring themes from upstream PiRC discussions. It does not claim that any proposal has been adopted by Pi Network or that any proposed token, price, reserve, payment flow, or contract is live.

Five connected workstreams emerged:

1. **Economic allocation and liquidity controls:** PiRC #45 (closed without merge) proposes a 10,000,000:1 Weighted Contribution Factor (WCF), fee-funded rewards, and a quadratic liquidity guardrail. Review feedback asks for architectural compatibility, realistic stress testing, and separation of a conceptual Solidity model from a Soroban implementation.
2. **Subscription lifecycle:** PiRC #413 (open draft at review time) describes a revised PiRC2 contract. Its security note identifies an approve-expiry mismatch between simulation and execution. This must remain an explicit acceptance gate.
3. **Payment outcomes and events:** Issue #357 proposes payment result states and subscription lifecycle events, but does not yet define stable event identity, ordering, replay handling, or terminal-state semantics.
4. **Engagement rewards and Sybil resistance:** Issue #69 proposes weighted actions, reputation, rate limits, and user-visible rewards. It needs measurable evidence rules and explicit caps; time-on-page and click counts alone do not prove human activity or utility.
5. **PiPower and launch fairness:** Issue #11 asks how staking/engagement power scales, how initial prices are set, and how oversubscription is handled. These remain design questions, not settled protocol behavior.

Recommended sequence: define units and accounting invariants → publish versioned schemas → build deterministic reference calculations → implement contract behavior → test adversarial cases → connect APIs and events → collect Testnet evidence → independent review.

## 2. Upstream review register

| Reference | State observed | Main contribution | Required follow-up |
|---|---|---|---|
| PiRC PR #45 — PiRC2 / WCF | Closed, not merged | 10^7 WCF concept, fee-funded rewards, quadratic liquidity factor, conceptual EVM model | Replace unsupported solvency/yield conclusions with reproducible scenarios; separate policy from chain implementation |
| PiRC PR #413 — subscription revamp | Open draft | New service/subscription records, shared allowance pool, bounded processing, timelocked upgrades, security notes | Reproduce and resolve simulation/execution approval-expiry mismatch; validate allowance accounting and transitions |
| PiRC PR #401 — Micron standard | Open | Proposed micro-unit nomenclature | Define atomic-unit conversion, precision, rounding and serialization; do not imply a new protocol denomination without adoption |
| PiRC PR #382 — Visual Builder | Open | No-code builder proposal and PiRC3 interaction concepts | Treat UI as a client of versioned APIs; require server-side verification and safe transaction simulation |
| PiRC Issue #357 — Payment result/event standard | Open | Payment result enum and subscription event names | Add event IDs, transaction/ledger references, idempotency, schema version and replay semantics |
| PiRC Issue #69 — Engagement rewards | Open | Weighted engagement, caps, anti-spam, reputation and dashboards | Define verifiable action proofs, abuse model, reward budget and appeal/correction path |
| PiRC Issue #11 — PiPower scaling | Open | Requests anti-whale scaling, price discovery and oversubscription safeguards | Publish formulas, bounds, allocation rules and stress tests |

**State caution:** GitHub metadata is a point-in-time observation. Re-check status, reviews, and head commits before using this register as a release record.

## 3. Economic accounting model

### 3.1 Keep distinct quantities separate

Do not conflate external market observations, internal reference parameters, merchant prices and delivered utility, collected protocol fees, distributable net revenue, reserve assets and legally redeemable liabilities, settlement liquidity for a named asset/venue/window, token supply, and transaction velocity.

An internal reference value is not a redemption promise. A market quote is not proof of executable liquidity. A reserve attestation is not proof of custody or unencumbered ownership.

### 3.2 Revenue waterfall

For a defined accounting period, define:
- G_t: gross protocol fees actually collected and reconciled;
- R_t: refunds and chargebacks;
- O_t: operating costs;
- T_t: taxes and statutory obligations;
- C_t: previously due contractual obligations;
- Q_t: reserve contribution approved by policy;
- U_t: amount available for discretionary distribution.

Net distributable amount:

    U_t = max(0, G_t - R_t - O_t - T_t - C_t - Q_t)

Deficit:

    D_t = max(0, R_t + O_t + T_t + C_t + Q_t - G_t)

The system MUST NOT create a negative distribution, borrow implicitly from future periods, or mint tokens to make the accounting identity balance. Every input must link to a reconciled ledger record or versioned, auditable off-chain evidence.

### 3.3 Fee calculation

For fee-bearing eligible volume V_t and fee rate f_t:

    G_t = V_t * f_t

This describes assessed fees only. Collected fees can differ because of failed settlement, refunds, exemptions, or unpaid invoices. Reconcile assessed, collected, refunded, and outstanding values independently.

Illustration only: 50,000,000 Pi eligible volume at a hypothetical 0.5% fee gives 250,000 Pi assessed fees. This is not a forecast, guaranteed yield, or evidence that such volume or fee collection exists.

### 3.4 Deterministic distribution

For eligible participant i with validated weight w_i:

    B_i* = U_t * w_i / sum(w_j)

For integer atomic units, use largest-remainder allocation:
1. calculate each exact rational share;
2. allocate the integer floor;
3. distribute remaining atomic units by descending fractional remainder;
4. break exact ties by a stable canonical participant identifier.

Required invariants:

    w_i >= 0; sum(w_i) > 0; B_i is a non-negative integer
    sum(B_i) = U_t

Reject invalid inputs, zero denominators, overflow, duplicate participant IDs, and ineligible recipients. Rounding and tie-break rules are part of the normative specification.

## 4. Weighted Contribution Factor: safe formulation

### 4.1 Why a fixed 10^7 multiplier is insufficient

A constant such as 10^7 does not prove that externally purchased balances have negligible influence, that mined balances are uniquely identifiable, or that the system is solvent. A multiplier needs a defined unit, denominator, eligibility policy, provenance source, and funding source.

A fungible token balance cannot be reliably separated into mined and purchased units merely by adding an application-level label. If the base ledger does not expose enforceable unit-level provenance, use a clearly defined account/claim/attestation model and disclose its limitations. Do not claim every Pi unit carries an origin flag unless the protocol actually supports that property.

### 4.2 Bounded, concave participant weight

Candidate research function:

    w_i = e_i * q_i * r_i * min(w_max, (m_i / m_0)^alpha)

where:
- e_i in {0,1}: eligibility after policy checks;
- q_i in [0,1]: verified quality/compliance factor;
- r_i in [0,1]: bounded reputation factor with appeal/correction;
- m_i: eligible, evidence-backed contribution measure;
- m_0 > 0: documented normalization constant;
- 0 < alpha < 1: concave contribution curve;
- w_max: hard per-participant cap.

This is a candidate for comparative testing, not a recommendation to publish KYC data as a score. Eligibility inputs must be privacy-preserving, purpose-limited, reviewable, and governed. Sybil splitting remains possible; caps and concavity reduce concentration but do not independently solve identity abuse.

### 4.3 Concentration diagnostics

For normalized shares s_i = w_i / sum(w_j):

    HHI = sum(s_i^2)
    N_eff = 1 / HHI

HHI and effective participant count are diagnostics, not fairness proofs. Report top-1, top-10, Gini coefficient, HHI, effective participant count, and reward share by eligibility cohort in every stress run.

### 4.4 Compare models before selection

Compare at minimum:
- linear: w_i = m_i;
- square-root: w_i = sqrt(m_i);
- capped concave: w_i = min(w_max, (m_i/m_0)^alpha);
- tiered: published bands with transition smoothing.

Test whale concentration, Sybil splitting, low-activity participants, account recovery, late entrants, provenance uncertainty, and eligibility-rule changes. Do not describe a model as anti-whale without quantitative adversarial results.

## 5. Liquidity and reserve guardrails

### 5.1 Dimensional analysis is mandatory

A proposed expression such as:

    Phi = ((AvailableExit / (Supply / QWF)) / Gamma)^2

is not implementation-ready until every term's units and meaning are defined. AvailableExit must be a value or quantity in a named asset and window; Supply/QWF must have a compatible unit; Gamma must be a dimensionless threshold or a quantity with matching units. Otherwise the expression can be computed while remaining economically meaningless.

### 5.2 Dimensionless liquidity coverage

A safer generic research metric is:

    LCR_t = L_t_eligible / X_t_stress

Eligible liquidity L_t_eligible and stressed outflow X_t_stress must be measured in the same asset, venue scope, and settlement horizon. Exclude locked, encumbered, inaccessible, stale, or non-executable balances.

A bounded throttle can then be defined:

    Phi_t = min(1, (LCR_t / LCR_target)^2)
    U_t_allowed = U_t * Phi_t

with LCR_target > 0. This is a conservative policy throttle, not proof of solvency, a floor price, a peg, or a redemption guarantee. Define the stress model, data sources, stale-data behavior, and governance authority. If liquidity data are unavailable or stale, fail closed for discretionary payouts.

### 5.3 Reserve coverage is a separate test

    CR_t = R_t_eligible_haircut / L_t_legally_redeemable

If legally redeemable liability is zero, report NOT_APPLICABLE, not infinity. A high ratio does not prove title, custody, lack of liens, market depth, or immediate redemption capability. Reserve attestations must name the attestor, evidence period, assets, valuation method, haircuts, encumbrances, liabilities, and expiry.

## 6. Monetary activity and velocity

A conventional velocity indicator is:

    V_t = (P_t * Q_t) / M_t

P_t Q_t is nominal transaction value during period t; M_t is the explicitly defined average money stock over the same period. Document price basis, asset scope, transaction population, and treatment of internal transfers. Remove duplicate events and avoid counting both sides of a transfer as separate economic output.

Velocity is not TPS, ledger close time, or proof of utility. Increased transfer frequency may reflect circular transfers, bots, arbitrage, or repeated movements without new goods/services.

## 7. Subscription contract: lifecycle and acceptance gates

### 7.1 Allowance accounting

For subscriber a with live subscriptions S_a, intended shared allowance:

    A_a_target = sum(reserved_s for s in S_a_live)

Each charge must satisfy:

    0 < charge_s <= price_s
    charge_s <= reserved_s
    expectedPeriodEnd_s = storedPeriodEnd_s

On successful charge:

    reserved_s' = reserved_s - charge_s
    periodEnd_s' = periodEnd_s + periodLength_s

The contract must ensure one successful charge per subscription period, fixed merchant destination, subscriber cancellation, bounded batch size, and no charge outside the permitted window.

### 7.2 Simulation/execution expiry mismatch

PR #413's security note describes an approve expiry rounded to a 720-ledger bucket crossing a bucket boundary between simulation and execution, causing signed authorization to fail. The PR estimates 0.1–0.4%; independently reproduce this before using it as a production reliability metric.

Acceptance requirements:
- reproduce the boundary case in a deterministic test;
- assert exact approve amount and expiry in simulation and submitted invocation;
- classify auth mismatch separately from insufficient balance, allowance loss, and contract rejection;
- bound retries and require fresh simulation and fresh user authorization;
- never silently resubmit with changed authorization data;
- record retry count and terminal outcome without exposing secrets.

Potential alternatives include signing an explicit expiry value as an input and validating it against a safe ledger window, or using a deterministic expiry rule identical across simulation and execution. Check any alternative against Soroban authorization semantics and network TTL limits; this note does not select one without implementation evidence.

### 7.3 Subscription state machine

~~~mermaid
stateDiagram-v2
    [*] --> Trial: subscribe with valid trial
    [*] --> Paid: subscribe without trial / first payment
    Trial --> Due: trial period ends
    Paid --> Due: paid period ends
    Due --> Paid: charge succeeds
    Due --> Due: charge fails / allowance unavailable
    Trial --> Cancelled: subscriber cancels
    Paid --> Cancelled: subscriber cancels
    Cancelled --> Ended: paid access window ends
    Due --> Stale: billing window expires
    Paid --> Ended: budget exhausted / period ends
    Trial --> Ended: trial ends without renewal
~~~

Define reversibility, authorized caller, failure-state behavior, and emitted event for every transition. Retryable must not mean repeating the financial side effect.

## 8. Payment results and event contract

Issue #357's proposed statuses are a useful start. A versioned event envelope should add fields required for deduplication and audit:

~~~json
{
  "schema_version": "1.0",
  "event_id": "stable-unique-id",
  "event_type": "payment.succeeded",
  "occurred_at": "2026-11-03T00:00:00Z",
  "network": "pi-testnet",
  "contract_id": "G...",
  "transaction_hash": "...",
  "ledger_sequence": 123456,
  "subscription_id": "sub_123",
  "idempotency_key": "merchant-order-123",
  "status": "SUCCEEDED",
  "amount_atomic": "50000000",
  "asset_id": "native-pi",
  "reason_code": null
}
~~~

Rules:
- event_id is unique and stable across delivery retries;
- transaction hash and ledger sequence are required for on-chain outcomes;
- amounts are integer atomic-unit strings, never floating-point JSON numbers;
- occurred_at is UTC RFC 3339; ledger sequence is the authoritative ordering key where available;
- consumers deduplicate by event_id and reconcile against chain state;
- delivery is at-least-once unless a stronger guarantee is demonstrated;
- an event is not proof of finality until the configured ledger/finality policy is satisfied;
- failed, cancelled, retry-scheduled, and already-processed outcomes are distinct;
- event payloads must not contain private keys, seed phrases, or unnecessary personal data.

Suggested status taxonomy:

| Status | Meaning | Financial side effect |
|---|---|---|
| PENDING | Accepted for processing, not yet final | None implied |
| SUCCEEDED | Chain transaction finalized under configured policy | Exactly one committed effect |
| FAILED | Terminal failure | No committed effect |
| RETRY_SCHEDULED | Retryable failure with bounded next-attempt policy | No new effect yet |
| CANCELLED | Cancelled before execution | No new effect |
| ALREADY_PROCESSED | Idempotency key already committed | Return original result; do not charge again |
| EXPIRED | Retry window closed | No new effect |

## 9. Engagement rewards and anti-abuse controls

For action class k, candidate evidence score:

    E_i,k = p_i,k * v_k * q_i,k

where p_i,k is a validated proof factor, v_k is the published action weight, and q_i,k is a quality factor. A daily capped score:

    E_i_day = min(E_max_day, sum(E_i,k))

Rewards must still be funded from a finite approved budget:

    Reward_i = U_t * E_i_day / sum(E_j_day)

Controls should include signed server-side action receipts, replay-resistant nonces, per-action cooldowns, lawful rate limits, anomaly review, transparent exclusions, and an appeal process. Clicks, session duration, and self-reported activity are weak signals and must not independently unlock material rewards.

## 10. PiPower, launch allocation, and price discovery

A launch specification must distinguish reference valuation from executable price; indicative price from clearing price; subscription demand from settled demand; token allocation from reward power; staking weight from contribution weight; oversubscription from failed settlement.

For capped allocation pool A and accepted demand weights d_i, a simple pro-rata allocation is:

    a_i = A * d_i / sum(d_j)

Apply per-account caps, eligibility, minimum allocation, deterministic rounding, and refunds of unfilled funds. If demand exceeds capacity, publish the rule before the sale and do not rely on privileged off-chain discretion.

A non-linear power model to evaluate is:

    Power_i = e_i * min(P_max, (stake_i/s_0)^beta) + lambda * E_i

with 0 < beta < 1, explicit units, a hard cap, and separately bounded engagement contribution. This is a research candidate, not an endorsed PiPower formula. Test whale concentration, stake borrowing, flash-loan timing, wash activity, Sybil splitting, and abrupt parameter changes.

## 11. Cross-repository contract and API boundary

| Concern | Normative owner | Implementation owner | Consumer |
|---|---|---|---|
| Economic policy, equations, eligibility and rounding | PiRC | SmartContracts for enforced invariants | Unity Sphere |
| Subscription storage and authorization | PiRC contract spec | SmartContracts | Unity Sphere / Pi SDK adapter |
| Payment event schema | PiRC | SmartContracts event emission + backend indexer | Unity Sphere |
| Asset provenance and registry | PiRC schema | SmartContracts / trusted evidence adapters | Unity Sphere |
| Oracle observation policy | PiRC | Oracle contract and reporter service | Settlement and UI |
| User-facing workflows | PiRC interface requirements | Unity Sphere | Pioneer / merchant |

No UI or backend is authoritative for an on-chain financial outcome. Client-supplied amount, price, eligibility flag, or success status must be re-read or verified by a trusted server/contract boundary.

## 12. Required test matrix

| Area | Minimum tests | Release evidence |
|---|---|---|
| Revenue waterfall | Zero revenue, refunds exceed fees, negative net, missing evidence, duplicate ledger rows | Reconciled period fixture and conservation assertion |
| Allocation | Zero weights, duplicate IDs, overflow, exact ties, remainder, max participants | Deterministic golden vectors and property tests |
| WCF / contribution | Linear vs concave, whale, Sybil split, missing provenance, eligibility change | Scenario report with HHI/Gini/top-share |
| Liquidity | Asset mismatch, stale quote, encumbered reserve, zero outflow, stressed outflow | Dated source data, haircut rules, fail-closed test |
| Subscription | Duplicate process, period boundary, cancel race, allowance revoke, insufficient balance, TTL archive/restore | Contract tests and replay logs |
| Approve expiry | 719/720/721-ledger boundary and simulation-to-submit delay | Reproducible mismatch test; no silent retry |
| Events | Duplicate/out-of-order delivery, missing hash, retry, consumer crash | Schema validation and idempotent consumer tests |
| Engagement | Click spam, replay, Sybil split, bot burst, appeal/reversal | Adversarial fixtures and policy version |
| Launch allocation | Under/over-subscription, caps, rounding, failed payment, refund | Conservation and refund reconciliation |

## 13. Integration decisions and next actions

1. Keep PiRC as the normative source for equations, schemas, lifecycle requirements, and acceptance criteria.
2. Keep contract code and storage/authorization behavior in SmartContracts; do not duplicate contract implementation in documentation-only repositories.
3. Keep Unity Sphere as a consumer of versioned API/event contracts; never treat its UI state as financial truth.
4. Publish golden vectors for revenue waterfall, concave contribution weights, largest-remainder allocation, liquidity throttle, and subscription expiry boundary.
5. Resolve the subscription approve-expiry mismatch with a reproducible test and documented design decision before calling the new flow production-ready.
6. Add a versioned payment event schema and idempotent consumer tests before relying on webhook-style notifications.
7. Keep price, reserve, WCF, OUSD, and sovereign claims explicitly illustrative until independent evidence and governance authorization exist.
8. Require human review and explicit authorization before deployment, treasury action, signing, branch deletion, force-push, or merge.

## 14. References

- PiRC upstream PR #45: https://github.com/PiNetwork/PiRC/pull/45
- PiRC upstream PR #413: https://github.com/PiNetwork/PiRC/pull/413
- PiRC upstream PR #401: https://github.com/PiNetwork/PiRC/pull/401
- PiRC upstream PR #382: https://github.com/PiNetwork/PiRC/pull/382
- PiRC upstream Issue #357: https://github.com/PiNetwork/PiRC/issues/357
- PiRC upstream Issue #69: https://github.com/PiNetwork/PiRC/issues/69
- PiRC upstream Issue #11: https://github.com/PiNetwork/PiRC/issues/11

---
This document records a technical assessment of public community proposals. It is not financial, legal, or investment advice and does not represent Pi Network or Pi Core Team policy.
