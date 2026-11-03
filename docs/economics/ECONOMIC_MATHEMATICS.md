# Economic Mathematics and Fixed-Point Rules

Status: research model. Parameters are not official Pi prices or guarantees.

## 1. Dual-value ratio
For internal reference parameter Pi and external observed market price Pe: S = Pi / Pe. With illustrative Pi = 314159 reference USD-units and Pe = 0.0314159 USD per PI, S = 10,000,000. This is arithmetic only; it does not establish conversion, redemption, arbitrage, market price or purchasing power. Units and economic meaning of Pi must be defined before production use.

## 2. Weighted utility allocation
Bi = U * wi / sum(wj). Preconditions: U >= 0; weights finite and non-negative; denominator positive; eligibility determined before allocation. For integer atomic units, distribute rounding remainder deterministically (largest remainder with stable participant-ID tie-break). Invariant: sum(Bi) = U after remainder allocation. Reject zero total weight and invalid inputs.

## 3. Quantity-theory velocity indicator
V = (P * Q) / M. This is an analytical indicator, not network TPS or block speed. Define period, price index, transaction scope, money-supply definition and treatment of repeated/internal transfers. Avoid double-counting circular transfers.

## 4. Reserve coverage
CR = eligible independently verified reserve value after haircuts / legally redeemable outstanding liability. If liability is zero, report NOT_APPLICABLE, not infinity. A ratio above one does not prove liquidity, legal ownership, absence of liens or immediate redemption capacity.

## 5. Settlement liquidity
LR = available liquidity in the same asset, venue and settlement window / required settlement. Exclude inaccessible or encumbered liquidity.

## 6. Oracle deviation
D = abs(Pnew - Pref) / Pref. Quarantine observations if reference is zero, data is stale, units differ or deviation exceeds an asset-specific threshold. Thresholds must be documented and governance-controlled.

## 7. Fixed-point rules
Use integer atomic token units. Rates use explicit scale factors selected per interface. Use checked arithmetic; reject overflow/underflow. Specify rounding direction for every division. Do not use binary floating point in consensus-critical arithmetic. Test boundaries, zero denominators, maximum supply, decimals mismatch and rounding conservation.

## 8. Version naming
Do not use V18 as a synonym for velocity or a network protocol until its source proposal defines it. Keep network protocol, SDK version, application release and economic model version separate.
