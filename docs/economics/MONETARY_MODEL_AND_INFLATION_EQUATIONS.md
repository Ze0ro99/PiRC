# Monetary Model, Inflation, and Economic Equations

**Status:** Research and engineering reference. Equations are analytical tools, not Pi Network policy, price forecasts, or guarantees. Every metric must define its units, time window, population, data source, and exclusions before use.

## 1. Notation and unit discipline

| Symbol | Meaning | Required unit/context |
|---|---|---|
| M_t | Monetary/token units in the defined supply measure at time t | PI or other asset units; specify circulating/eligible/total |
| P_t | Price level or price index | Index points or currency per unit |
| Y_t | Real output / quantity of goods and services | Defined basket and period |
| V_t | Velocity of circulation | Turnovers per period under a defined transaction scope |
| Q_t | Value of eligible transactions | Currency value per period |
| P_e | Observed external venue price | Quote currency per PI, venue and timestamp |
| P_i | Internal reference parameter | Explicitly defined model unit; not assumed redeemable |
| U_t | Net distributable utility/revenue | Currency or asset units, net of obligations |
| S_t | Scenario ratio | Dimensionless only if numerator and denominator units are compatible |

Use integer atomic units for consensus-critical token arithmetic. Never rely on binary floating point for balances, fees, supply, allocation, or settlement.

## 2. Quantity equation and velocity

A simplified quantity identity is:

\[
M \cdot V = P \cdot Y
\]

For an explicitly defined transaction set, an empirical velocity indicator may be estimated as:

\[
V = \frac{Q}{\bar M}
\]

where Q is eligible transaction value during the period and M-bar is the average relevant money stock over that same period.

This is not network TPS, block speed, unique-user count, or proof of economic demand. Exclude self-transfers, circular flows, wash activity, duplicate events, and repeated internal bookkeeping unless the metric explicitly intends to count them. Document whether Q is gross or net and how settlement reversals are treated.

## 3. Inflation: price-level change versus supply growth

Consumer-price inflation over a period is:

\[
\pi_t = \frac{CPI_t - CPI_{t-1}}{CPI_{t-1}}
\]

For a multi-period annualized rate over n periods:

\[
\pi_{annualized} = \left(\frac{CPI_t}{CPI_{t-n}}\right)^{k/n} - 1
\]

where k is the number of periods per year (for monthly data, k=12). The CPI basket, weights, geography, and collection methodology must be specified.

Token-supply growth is a separate measure:

\[
g_M = \frac{M_t - M_{t-1}}{M_{t-1}}
\]

Do not label g_M as consumer-price inflation. New token issuance can affect prices, but the outcome depends on demand, velocity, real output, distribution, liquidity, market structure, and expectations.

A useful log-change approximation derived from MV=PY is:

\[
\pi \approx g_M + g_V - g_Y
\]

where g_V is velocity growth and g_Y is real-output growth. This approximation assumes consistent definitions and a stable identity over the measurement window; it is not a causal forecast. If output expands alongside supply, the price-level effect can differ materially from a case where output is fixed.

## 4. Revenue-funded distribution and solvency constraints

Define distributable resources conservatively:

\[
U_t = R_t - C_t - T_t - L_t - \Delta Res_t - K_t
\]

where R_t is collected and reconciled operating revenue; C_t is operating/service costs; T_t is taxes and statutory obligations; L_t is due liabilities and refunds; Delta Res_t is approved reserve replenishment; K_t is already committed distributions and capital expenditure.

Only if U_t ≥ 0 may a distribution calculation proceed. A forecast, invoice, token price, or uncollected receivable is not cash available for distribution.

For eligible participants with finite non-negative weights:

\[
B_i = U_t \cdot \frac{w_i}{\sum_j w_j}
\]

Require sum(w_j)>0. Calculate in integer atomic units, use a deterministic largest-remainder rule with a stable tie-break, and enforce:

\[
\sum_i B_i = U_t
\]

Eligibility, anti-Sybil controls, contribution evidence, caps, dispute windows, and appeal paths must be resolved before allocation.

## 5. Reserve coverage and settlement liquidity

Reserve coverage:

\[
CR = \frac{V_{eligible\ reserves\ after\ haircuts}}{L_{legally\ redeemable}}
\]

If the denominator is zero, report NOT_APPLICABLE, not infinity. A ratio above one does not prove ownership, absence of liens, legal enforceability, custody quality, valuation reliability, or immediate liquidity.

Settlement liquidity:

\[
LR = \frac{L_{available\ and\ unencumbered\ in\ same\ asset/venue/window}}{L_{required\ settlement}}
\]

Do not combine different assets, venues, or settlement windows without an explicit conversion and risk model. Exclude locked, pledged, inaccessible, or unverified liquidity.

## 6. External price, internal reference, and scenario ratio

The illustrative scenario:

\[
P_i = 314159, \quad P_e = 0.0314159
\]

\[
S = \frac{P_i}{P_e} = 10,000,000
\]

is arithmetic only. Before interpreting S, define the units and economic meaning of P_i, the source and timestamp of P_e, and whether both refer to the same asset and settlement basis. The ratio does not create a conversion right, redeemability, arbitrage opportunity, purchasing power, or a market price. Never implement a multiplier as a wallet conversion or payment amount without a separate, authorized, collateralized and legally valid mechanism.

For observed venue prices, retain venue, pair, quote currency, timestamp, bid/ask, depth, trade volume, outlier policy, and data quality. A single last-trade quote is not a robust market reference.

## 7. Oracle deviation and data quality

For a positive reference price:

\[
D = \frac{|P_{new} - P_{ref}|}{P_{ref}}
\]

Quarantine observations when the reference is zero, units or quote assets differ, timestamps exceed freshness limits, signatures fail, sequence numbers replay, or deviation exceeds an asset-specific governance-approved threshold. A single reporter is an observation source, not a decentralized quorum.

## 8. Fixed-point and rounding requirements

- Represent balances and token quantities in integer atomic units.
- Give every rate an explicit scale and decimal convention.
- Use checked multiplication/division and reject overflow/underflow.
- Specify floor, ceiling, or nearest rounding for each operation.
- Define deterministic remainder handling for allocations.
- Reject zero denominators and invalid/negative inputs.
- Test maximum supply, decimal mismatch, precision loss, stale data, replay, and boundary values.
- Keep display formatting separate from stored/accounting values.

## 9. Metric governance

Every published metric must carry a metric identifier and semantic version; formula and unit; data source and provenance; time window and sampling method; inclusion/exclusion and deduplication rules; quality status and last-updated timestamp; known limitations and responsible owner.

Do not compare metrics with different scopes or units. Do not present modeled values as actual reserves, solvency, inflation, collateral, yield, or live issuance.
