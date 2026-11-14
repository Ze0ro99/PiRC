# Deterministic Economic Weights, Rates, and Settlement Rules

## Scope

This document specifies reproducible reference mathematics for the PiRC economic engine and PiGold route policy. It does not establish a Pi Core Team policy, an oracle feed, a redeemable price, or a deployed contract. All monetary quantities are integer atomic units and every result must retain its asset identifier and period.

## 1. Eligibility is a gate, not a weight

For participant (i), define a binary eligibility gate:

[
E_i \in \{0,1\}
]

The gate is true only when every mandatory policy check passes (identity/KYC state where legally required, provenance, authorization, contribution evidence, sanctions/compliance controls where applicable, and period eligibility). A high score cannot override a failed gate.

## 2. Weighted score in basis points

Each factor input (x_{ik}) and factor weight \(\alpha_k\) is an integer in basis points:

[
0 \le x_{ik},\alpha_k \le 10{,}000,
\qquad \sum_k \alpha_k = 10{,}000
]

The participant score is:

[
q_i = \left\lfloor
\frac{\sum_k x_{ik}\alpha_k}{10{,}000}
\right\rfloor
\]

The implementation is `reference.economic_engine.weighted_score_bps`. The factor set and weights must be explicitly supplied by a versioned, approved policy; the reference engine does not invent or silently default weights. Missing factors, mismatched keys, floating-point values, or weights that do not sum to 10,000 are rejected.

## 3. Distributable amount and allocation

For a single declared asset and accounting period:

[
D = R - C - T - L - S - K
]

where (R) is collected revenue, (C) operating costs, (T) taxes/statutory obligations, (L) due liabilities/refunds, (S) reserve replenishment, and (K) already committed distributions/capex. If deductions exceed revenue, the period is underfunded and settlement fails closed; it is never silently clamped to zero.

Effective allocation weights are:

[
w_i = E_i q_i
\]

The atomic amount for each participant is calculated using largest-remainder apportionment:

[
a_i = \left\lfloor \frac{D w_i}{\sum_j w_j} \right\rfloor
]

Unassigned atomic units are distributed by descending fractional remainder, with ascending stable participant ID as the deterministic tie-break. This guarantees:

[
\sum_i a_i = D
]

The reference implementation is `allocate_weighted` plus `allocate_largest_remainder`. An ineligible participant receives zero regardless of score. A positive distribution with no positive eligible score is rejected.

## 4. Oracle rates and IPPR/QWF

The existing reference model uses independent venue observations, integer nano-USD prices, a median aggregator, and fail-closed source checks. Its reference defaults are at least 3 independent sources, maximum age 120 seconds, and maximum deviation 1,500 bps. These are model parameters, not a live Pi oracle guarantee; production values require an approved, versioned policy and independently verified source independence.

For accepted observations:

[
P_{ext} = \operatorname{median}(P_1,\ldots,P_n)
\]

[
IPPR = P_{ext} \times 10{,}000{,}000
\]

QWF is a separate state variable; it must not be conflated with IPPR. The reflexive constraint is:

[
\Phi = \frac{L_n \times IPPR}{QWF}
\]

The code uses integer fixed-point scales and rejects stale, future-dated, duplicate-venue, zero-price, insufficient-quorum, and excessive-deviation observations. A passed reference gate is not evidence of a live oracle, market liquidity, redemption, or settlement.

## 5. Pair-pool quote arithmetic

A pair-specific constant-product pool may calculate its fee-adjusted input and output using integer arithmetic:

[
I_{net}=\left\lfloor\frac{I(10{,}000-f)}{10{,}000}\right\rfloor
\qquad
O=\left\lfloor\frac{R_o I_{net}}{R_i+I_{net}}\right\rfloor
\]

where (I) is input atomic amount, (f) is the pool fee in bps, and (R_i,R_o) are that pool's reserves. The route must enforce caller-supplied minimum output and slippage limits. Quotes are invalid if the pool is unverified, paused, stale, or reuses a reserve-accounting identifier in another route leg.

This formula describes quote arithmetic only. The actual deployed contract interface and implementation must be inspected and tested before an adapter can claim compatibility. PiGold routes across independent pair pools; it does not merge reserves or create an implicit cross-layer conversion.

## 6. Rate and policy change controls

- No binary floating-point arithmetic for balances, fees, weights, supply, reserve ratios, or oracle prices.
- All scales, asset decimals, fee limits, rounding rules, and policy versions must be explicit.
- Weight changes require an approved policy version and effective period; historical allocations retain the policy version used at calculation time.
- Oracle source set, freshness, quorum, deviation, and circuit-breaker changes require the same versioned approval.
- A missing or stale rate is `UNKNOWN`; the route or settlement must stop rather than reuse an unbounded stale value.
- Never mix amounts from different assets without an explicit, independently verified conversion quote.
- Accounting allocation, submitted transaction, confirmed ledger event, and independent balance readback remain separate states.

## 7. Validation vectors

The Python unit tests cover exact weight sums, bounded factor values, eligibility gating, stable tie-breaking, atomic-unit conservation, underfunded periods, reserve coverage, and signed supply growth. The CI result for a particular commit is authoritative; this document alone is not a test result.
