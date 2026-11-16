# Layered Monetary Operations: Issuance, Burn, Units, Weights, Liquidity and Velocity

**Status:** Proposed engineering standard; review required before implementation.
**Execution scope:** Pi Testnet1 only.
**Authority:** Community project specification. It is not official Pi Network monetary policy, a price promise, a redemption commitment, a bank license, or evidence of deployed contracts or live reserves.

## 1. Design objective

The seven economic layers are interoperable parts of one application ecosystem. A user may move between daily commerce, institutional/banking workflows, governance, premium reserve functions and exchange routes. Interoperability does not mean that all layers share one token balance, one supply cap, one reserve, or one exchange rate.

The system MUST preserve:
- one canonical asset ID and one independent ledger/supply for each fungible asset;
- independent issuer/admin authority, decimals, cap, mint/burn rules and evidence;
- separate pool reserves and liabilities for every asset pair;
- explicit, expiring conversion quotes for every cross-layer asset exchange;
- a common routing and accounting interface without merging asset ownership or reserves.

PiGold is the coordinator/route registry. It is not a fungible token, issuer, custodian, reserve, AMM or proof of liquidity unless a separate audited implementation explicitly establishes those functions.

## 2. Layer map and functional boundaries

The source proposal currently describes these seven color roles:

| Layer | Proposed role | Monetary treatment |
|---|---|---|
| Red / Governance | Governance and policy | Prefer governance registry/voting rights; do not assume a transferable reward token |
| Orange | Mid-tier utility | Independent utility asset if approved |
| Yellow | High-tier utility | Independent utility asset if approved |
| Green / PiCash | Daily payments and commerce | Daily-use payment asset; independent supply and merchant acceptance |
| Blue / PiBank | Banking/institutional workflows | Service/ledger gateway by default; a token requires a separate decision and custody/legal boundary |
| Indigo | Premium reserve | Independent asset and reserve accounting; never mix with Purple |
| Purple | Mined Pi and fractions | Pi-denominated unit rail; 10,000,000 subunits per 1 Pi under this proposal |

OUSD remains a separate test asset. It has no implied USD backing, peg, redemption or reserve. PiDEX is the exchange execution module. PiGold coordinates route discovery and policy checks. Neither replaces the per-asset ledger.

The existing source mapping contains legacy constants and alternative unit statements (including 10,000 or 10,000,000 subunits per Pi and an incomplete conversion rule for several layers). These are not mutually interchangeable. This document resolves the engineering convention as follows: **10,000,000 atomic subunits = 1 Pi for the Purple/Pi-denominated rail only.** All other tokens use their own immutable contract decimals. Legacy constants such as 3.14, 314, 3,141, 31,140 and 314,159 are reference labels only until a canonical versioned registry defines their units and semantics. No automatic parity or conversion is inferred.

## 3. Canonical units and arithmetic

### 3.1 Pi denomination

For the Pi-denominated rail:

- 1 Pi = 10,000,000 atomic subunits.
- 1 atomic subunit = 0.0000001 Pi.
- 0.25 Pi = 2,500,000 atomic subunits.
- 1.0000001 Pi = 10,000,001 atomic subunits.

Store and transmit amounts as unsigned integer atomic units or decimal strings. Never use binary floating point for balances, supply, fees, weights, prices or settlement. Display formatting is a UI concern and must not change the stored integer.

### 3.2 Other token denominations

Each token contract MUST publish immutable `asset_id`, `symbol`, `decimals`, `max_supply_atomic`, and a metadata/version hash. For a token with d decimals:

`1 whole token = 10^d atomic units`.

A value in Pi atomic units cannot be added to or compared directly with another token's atomic units. Conversion requires an explicit quote containing input/output asset IDs, integer amounts, source, venue/pool, fee, slippage bound, expiry, network ID and policy version.

### 3.3 Fixed-point scales

- Basis points (bps): 10,000 bps = 100%.
- Parts per million (ppm): 1,000,000 ppm = 100%.
- Oracle price scale: explicit integer nano-USD or another declared scale.
- Rates MUST carry a scale and rounding rule in the schema.

Use checked integer multiplication/division. Reject overflow, underflow, negative values, booleans, NaN, infinity, mismatched decimals and zero denominators. Specify floor/ceiling/nearest for each calculation. Allocation remainders use largest remainder and stable-ID tie-breaking.

## 4. Issuance (mint) policy per layer

Minting is an authorized supply change, not a side effect of a price index, user transfer, pool deposit, velocity increase or UI action.

For each asset l and epoch t:

`S[l,t+1] = S[l,t] + M[l,t] - B[l,t]`

where:
- `S` = total supply in that asset's atomic units;
- `M` = successfully authorized mint amount;
- `B` = successfully executed burn amount.

Mandatory constraints:

`0 <= M[l,t] <= max_supply[l] - S[l,t]`

`M[l,t] <= approved_epoch_budget[l,t]`

`M[l,t] = 0` when the issuer, cap, policy version, eligibility evidence, or network is unknown, stale, paused or unapproved.

A proposed emission budget may be computed as:

`M_budget[l,t] = min(remaining_cap, approved_rate[l] * eligible_basis[l,t])`

but `approved_rate[l]` and `eligible_basis[l,t]` are unset until a governance-approved policy defines the exact basis, epoch, cap, vesting, recipients and audit evidence. Do not infer rates from color constants, GCV, IPPR, QWF, external price or the 10,000,000 unit denomination.

### 4.1 Layer-specific mint authority

- Red/Governance: governance registry records votes/decisions. If a voting token is later approved, issuance is governed by a distinct voting-token policy and cannot mint treasury value.
- Orange and Yellow: issuer-authorized utility issuance only under their own caps, utility evidence and vesting schedule.
- Green/PiCash: issuance only for a defined daily-utility purpose and approved budget; merchant settlement does not automatically mint new PiCash.
- Blue/PiBank: banking/service operations do not mint a token by default. Any bank token needs an explicit issuer, custody, liability, redemption and compliance design.
- Indigo: premium/reserve-layer issuance requires a separate reserve/liability policy and independently verified backing if redeemability is claimed.
- Purple/Pi: no authority to mint Pi Network native Pi is implied. A project-issued test representation must be clearly labeled as a separate test asset and cannot impersonate native Pi.
- OUSD: test-only token; no stablecoin or USD claim. Its own contract cap applies.
- PiGold: no mint function or token supply is implied.

No global mint rate is allowed. Each asset has its own issuer, cap, budget, schedule and release state.

## 5. Burn policy per layer

Burning MUST be an explicit contract event with asset ID, amount, caller/authority, reason code, policy version and transaction evidence. A burn reduces that asset's total supply only after the contract state transition succeeds.

Allowed burn categories, if enabled by each asset policy:
1. voluntary holder burn;
2. explicitly disclosed protocol fee burn;
3. issuer-authorized supply retirement;
4. approved redemption retirement after the corresponding liability is settled.

A fee is not automatically burned. The policy must state whether fees are burned, paid to validators/service providers, retained by treasury, or split. A redemption burn must not occur before the redemption/settlement obligation is actually fulfilled. Do not burn one layer to simulate conversion into another.

For each asset:

`B[l,t] = B_voluntary + B_fee + B_retirement + B_redeemed`

with each term separately measured and bounded by available balances and contract authorization. All components are zero when the relevant burn path is disabled.

Burns are not revenue, collateral, reserve inflows or proof of demand. Report gross mint, gross burn, net supply change and circulating/locked/treasury balances separately.

## 6. Economic weights and distribution

Eligibility is a binary gate, not a score:

`E_i in {0,1}`

A failed mandatory check forces the participant's effective weight to zero. For eligible participants, factor values and factor weights are integer bps:

`0 <= x[i,k], alpha[k] <= 10,000`

`sum(alpha[k]) = 10,000`

`q_i = floor(sum(x[i,k] * alpha[k]) / 10,000)`

`w_i = E_i * q_i`

For a single asset and accounting period, distributable funds are:

`D = collected_revenue - operating_costs - taxes - due_liabilities_refunds - reserve_replenishment - committed_distributions_capex`

If D is negative, the period is underfunded and distribution MUST fail closed. For D >= 0:

`allocation_i = D * w_i / sum(w)`

Use integer largest-remainder apportionment so the sum of allocations equals D exactly. If D > 0 and sum(w) = 0, reject the allocation.

Factor weights are not universal layer weights. Maintain separate versioned policies for (a) participant contribution allocation, (b) risk/route priority, and (c) layer budget distribution. Each policy must publish factor definitions, bps weights, effective period, caps, eligibility gates, missing-data behavior, reviewer and approval evidence. No default percentages are silently assigned by this specification.

## 7. Velocity, turnover and economic activity

For asset l and declared window W:

`V[l,W] = Q_eligible_settled[l,W] / average_circulating_supply[l,W]`

where Q is the value of eligible settled transfers/payments measured in the same asset and unit. Report the window and supply definition. Also report separately:
- completed commerce orders and unique buyers/sellers;
- repeat purchase rate and inventory turnover;
- exchange turnover and pair-level volume;
- payment success and settlement latency;
- refund, reversal and dispute rates;
- concentration and self/circular transfer share.

Exclude self-transfers, duplicate/replayed events, wash/circular trades, unconfirmed settlements, cancelled orders, synthetic test fixtures and unresolved refunds from economic velocity. Do not equate V with TPS, ledger close time or network speed.

The PiRC IPPR reference remains:

`IPPR_t = median(accepted PI/USD observations) * 10,000,000`

QWF is a separate adaptive state; the reflexive reference is `Phi = (L_n * IPPR) / QWF`. Neither IPPR nor Phi changes token balances, supply, conversion amounts, mint budgets or burn amounts. QWF changes require a separately approved bounded policy.

## 8. Liquidity and reserve accounting

For every pool p, retain pair-specific reserves:

`R[p, asset_A]` and `R[p, asset_B]`

Never pool together balances from different pools or count the same reserve twice across a route.

Settlement liquidity ratio:

`LR = accessible_unencumbered_liquidity(asset, venue, window) / required_settlement(asset, venue, window)`

Reserve coverage for redeemable liabilities:

`CR = eligible_verified_reserves_after_haircuts / legally_redeemable_liabilities`

If liabilities are zero, CR is NOT_APPLICABLE. A high ratio alone does not prove custody, title, absence of liens, legal redemption or immediate exit capacity.

A constant-product pair quote may use:

`I_net = floor(I * (10,000 - fee_bps) / 10,000)`

`O = floor(R_out * I_net / (R_in + I_net))`

The contract must enforce minimum output, max slippage, pool status, reserve consistency, integer bounds and reentrancy/replay protections. A quote is not a fill. A UI-displayed TVL is not on-chain liquidity evidence.

PiGold may discover and validate a route graph, but every edge must reference a live, independently verified pair pool and a fresh quote. Route execution must be atomic where supported or explicitly model partial-fill and compensation behavior. Do not create implicit conversion edges or use IPPR/GCV as a swap price.

## 9. Cross-layer user routing

The user chooses the intended operation; the router recommends only routes that satisfy policy:

- Daily purchases: Green/PiCash or another merchant-accepted asset, with exact quote, fee and expiry.
- Banking/institutional workflow: Blue/PiBank service gateway, with explicit account/custody boundary; do not assume a PiBank token.
- Exchange/trading: PiDEX pair pools, depth, fee, slippage and route quote; user explicitly approves the exact input and minimum output.
- Governance: Red governance registry/voting process; never route governance rights as spendable cash.
- Premium/reserve workflow: Indigo only with its own reserve and liability evidence.
- Mined Pi/fractional unit handling: Purple/Pi rail using the 10,000,000 atomic-subunit denomination defined above.

A route must validate network ID, asset IDs, balances, pool/pair status, quote freshness, fee, min-out, slippage, policy version, user authorization and replay protection. The system must stop on a missing quote, stale oracle, mismatched network, unknown asset, insufficient same-asset liquidity or unverified pool. A scan, quote or route suggestion is not transaction authorization.

## 10. Required per-asset registry record

Before deployment or minting, each asset needs:
- canonical layer and asset ID;
- token/service classification and purpose;
- name, symbol, decimals and max supply in atomic units;
- issuer/admin public identity and authorization model;
- mint rate/budget, epoch, vesting, cap and allowed recipients;
- burn categories, fee split and retirement policy;
- transfer/allowance/pause/admin-rotation rules;
- pool pairs, fee bps, liquidity policy and oracle dependencies;
- governance policy hash and effective period;
- source commit, WASM hash, network, contract ID and deployment evidence;
- initial supply, mint/burn events and independent balance read-back.

Unknown values remain UNKNOWN/UNMAPPED; they are not filled with guesses. Source code alone is SOURCE_ONLY, not deployed or mint-ready.

## 11. Test and acceptance matrix

The Testnet1 suite must cover:
- each asset's independent decimals, cap and supply accounting;
- unauthorized mint/burn, cap overflow, zero/negative/boolean/overflow inputs;
- exact mint/burn event and total-supply conservation;
- transfer, allowance, expiry and burn_from authorization;
- decimal mismatch and cross-asset addition rejection;
- deterministic bps scoring and largest-remainder conservation;
- underfunded period and zero-weight rejection;
- velocity deduplication, circular-flow exclusion and window boundaries;
- stale/duplicate/outlier oracle observations and QWF policy bounds;
- pool reserve reconciliation, fee, min-out, slippage and route expiry;
- PiGold route with two or more verified pair pools without reserve double counting;
- wrong network, replay, duplicate callback and failed settlement reconciliation;
- pause, admin rotation, refund and emergency stop.

Acceptance requires pinned source, passing tests, reproducible Wasm build, independent Testnet1 deployment/read-back, and per-contract evidence. A passing simulation or source test does not prove live issuance, liquidity or settlement.

## 12. Explicit release blockers

The current release matrix records the colored assets as unmapped/not deployed; PiGold as a registry/route validator; OUSD as a test-only asset; and PiDEX source as not proof of live pools. The seven-layer proposal also contains legacy denomination conflicts. Therefore:
- do not mint any layer yet;
- do not assume PiBank or PiGovernance is a fungible token;
- do not enable cross-layer swaps before verified pool balances and quotes;
- do not publish numeric issuance/burn percentages until per-layer policy approval;
- do not represent testnet assets as native Pi or redeemable USD.

This standard is ready for review and implementation planning, not authorization to deploy, initialize, mint, burn, transfer, add liquidity or trade.
