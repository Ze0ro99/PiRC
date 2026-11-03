# Treasury, Revenue Recognition and Distribution Model

**Status:** Proposed accounting/control model. Not a banking, custody, investment, or redemption authorization.

## Separate ledgers

Maintain separate subledgers for customer funds/payables, merchant settlements, platform revenue, fees, refunds/chargebacks, operating expenses, treasury assets, restricted reserves, token liabilities and application credits. Do not net customer funds against operating revenue.

## Revenue recognition

Recognize revenue only when earned under the documented service contract and reconciled against settlement evidence. Gross merchandise value (GMV) is a commerce throughput measure, not platform revenue. Exclude pending, cancelled, refunded, disputed, synthetic and circular transactions from recognized revenue.

## Distributable surplus

For period t:
- R_t: collected, reconciled earned revenue;
- C_t: verified operating costs;
- P_t: refunds, chargebacks, taxes and required provisions;
- L_t: required liquidity and risk reserves.

D_t = max(0, R_t - C_t - P_t - L_t).

D_t is a model output. It is not automatically distributable; governance, contractual, legal and solvency checks must pass first.

## Participant allocation

For eligible participant i, proposed allocation B_i = D_t * w_i / sum(w_j). Publish weight definitions, eligibility, anti-Sybil controls, caps, vesting, exclusions, dispute process and deterministic rounding. A participant contribution score is not a financial claim unless a valid enforceable program creates one.

## Reserve and redemption claims

Reserve coverage is reportable only when reserve assets are independently evidenced, owned/controlled by the obligated issuer, unencumbered, liquid in the relevant settlement window and reconciled to legally redeemable liabilities. A dashboard label or oracle quote is not reserve evidence. If no legally redeemable liability exists, report reserve coverage as NOT_APPLICABLE.

## Governance controls

Two-person approval for treasury movements, role separation, transaction limits, daily reconciliation, immutable audit trail, key rotation, incident pause, independent review and documented withdrawal/settlement policy are required before any value-bearing operation.

## Prohibited representations

Do not call the module a bank or imply deposit insurance, guaranteed yield, fixed parity, cash redemption, or reserve backing without the relevant license, contracts and independently verifiable evidence.
