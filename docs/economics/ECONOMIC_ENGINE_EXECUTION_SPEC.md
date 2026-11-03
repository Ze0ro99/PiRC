# Economic Engine — Executable Specification

**Status:** Reference implementation and deterministic tests; not a production treasury, price oracle, wallet, or Pi Network policy.

## Source of truth

- Reference implementation: `reference/economic_engine.py`
- Unit tests: `tests/test_economic_engine.py`
- CI command: `python -m unittest discover -s tests -p 'test_economic_engine.py' -v`
- Monetary equation background: [Monetary Model and Inflation Equations](MONETARY_MODEL_AND_INFLATION_EQUATIONS.md)

## Accounting model

For one declared asset and one accounting period, all amounts are non-negative integer atomic units:

`distributable = collected_revenue - operating_costs - taxes - due_liabilities_and_refunds - reserve_replenishment - committed_distributions_and_capex`

The engine rejects an underfunded period rather than clamping the result to zero. This makes an accounting deficit observable and prevents a distribution from disguising a solvency failure. Forecast revenue, uncollected invoices, hypothetical token prices, and modeled TVL are not collected revenue.

## Allocation algorithm

1. Validate stable participant IDs and non-negative integer weights.
2. Require a positive sum of weights for a positive distribution.
3. For each participant, compute `floor(total * weight / sum(weights))` with integer arithmetic.
4. Rank fractional remainders descending; break equal-remainder ties by ascending participant ID.
5. Award remaining atomic units in that order.
6. Assert that the sum of allocations equals the input total.

The allocation is deterministic for the same inputs and conserves every atomic unit. Eligibility proofs, anti-Sybil decisions, disputes, contribution scoring, and authorization remain upstream policy decisions; the reference engine does not claim to solve identity or eligibility.

## Invariants

- **I-1 Unit discipline:** each period has one asset ID; amounts are integers in that asset's atomic units.
- **I-2 Solvency:** distributable resources are defined only when all senior obligations fit within collected revenue.
- **I-3 Conservation:** sum(allocation) equals distributable resources exactly.
- **I-4 No hidden minting:** the engine has no issuance or balance-minting operation.
- **I-5 Fail closed:** negative values, floats, booleans, empty IDs, zero denominators, and underfunded periods are rejected or explicitly marked not applicable.
- **I-6 Determinism:** rounding and tie-breaking are stable and documented.
- **I-7 Measurement separation:** token-supply growth is not labeled consumer-price inflation; reserve coverage with zero redeemable liabilities is NOT_APPLICABLE.

## Run locally

Requires Python 3.10+ and no third-party packages:

```sh
python -m unittest discover -s tests -p 'test_economic_engine.py' -v
```

The test suite covers net revenue, insolvency, largest-remainder allocation, zero weights, empty populations, invalid numeric types, reserve coverage, supply growth, and period settlement conservation.

## Cross-component integration contract

- PiRC owns this specification and test vectors.
- SmartContracts must independently implement the same invariants using checked integer arithmetic and contract authorization; Python results are reference vectors, not evidence that a deployed contract conforms.
- Unity Sphere must send atomic-unit decimal strings with an explicit asset ID and schema version, then display the returned accounting state without converting an internal reference ratio into a payment amount.
- Oracle observations may provide prices or reserve valuations, but may not rewrite collected revenue, liabilities, allocation weights, or contract authorization.
- Asset provenance and eligibility must be resolved before participant weights are passed to the engine.
- Contract, API, and UI versions must be recorded in the implementation-evidence registry.

## Explicit non-goals

This engine does not establish Pi market price, redeemability, collateral, identity, legal reserve status, official protocol rules, or mainnet deployment. Those require separate evidence and authorized systems.
