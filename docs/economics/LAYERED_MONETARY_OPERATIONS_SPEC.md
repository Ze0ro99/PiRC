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

The source proposal currently describes these seven color roles. The universal accounting scale defined in Section 3 applies to every fungible layer, independently of each layer's economic value. The PiGold ratios in the layer table are separate conversion-policy parameters, not CAS denominations:

| Layer | Proposed role | Monetary treatment |
|---|---|---|
| Red / Governance | Governance and policy | Prefer governance registry/voting rights; do not assume a transferable reward token |
| Orange | Exchange/market access | Proposed baseline 100 Orange per 1 PiGold reference unit; independent pool and market-depth checks |
| Yellow | Internal/external balancing utility | Proposed baseline 1,000 Yellow per 1 PiGold reference unit; independent pool and oracle checks |
| Green / PiCash | Daily payments and commerce | Daily-use payment asset; proposed baseline 100,000 PiCash per 1 PiGold reference unit |
| Blue / PiBank | Banking/institutional workflows | Service/ledger gateway by default; proposed baseline 10,000 PiBank per 1 PiGold reference unit if tokenized; separate custody/legal boundary |
| Indigo | Premium reserve | Independent asset and reserve accounting; never mix with Purple |
| Purple | Mined-Pi provenance and external bridge | Proposed baseline: 10,000,000 Purple subunits per mined-Pi unit and 10 PiGold reference units; expansion tier requires escrowed migration and approval |

Red/Governance has no fixed PiGold conversion: governance weight is earned from verified pioneer contribution under a capped policy. OUSD remains a separate test asset. It has no implied USD backing, peg, redemption or reserve. The proposed layer ratios and escrow-gated Purple expansion schedule are detailed in [LAYER_RATIO_ESCROW_AND_STABILITY_POLICY.md](LAYER_RATIO_ESCROW_AND_STABILITY_POLICY.md). PiDEX is the exchange execution module. PiGold coordinates route discovery and policy checks. Neither replaces the per-asset ledger.

The existing source mapping contains legacy unit statements (including 10,000 or 10,000,000 subunits per Pi) and incomplete conversion rules for several layers. This specification supersedes those conventions for the common accounting interface: **1 whole unit of every fungible ecosystem asset = 10,000,000 canonical accounting subunits.** This is a denomination and precision rule only; it does not give the assets equal prices, equal purchasing power, parity, collateral, or redemption rights. Legacy constants such as 3.14, 314, 3,141, 31,140 and 314,159 are algorithm inputs/reference labels only until a canonical versioned registry defines their units and semantics. No automatic value conversion is inferred.

## 3. Canonical units and arithmetic

### 3.1 Universal ecosystem accounting denomination

For every fungible asset in every layer:

- 1 whole asset unit = 10,000,000 canonical accounting subunits (CAS).
- 1 CAS = 0.0000001 whole asset unit.
- 0.25 asset units = 2,500,000 CAS.
- 1.0000001 asset units = 10,000,001 CAS.

This rule applies uniformly to PiCash, PiBank if it is later approved as a token, Governance if a voting token is approved, Orange, Yellow, Indigo, Purple, OUSD test assets and any further fungible layer token. Non-fungible service entitlements, account records and governance decisions are not token denominations and must not be forced into this unit model.

CAS is a common precision/ledger interface, not a common value. One CAS of asset A is not equal in value to one CAS of asset B. Never add balances across asset IDs.

### 3.2 Contract-decimal adapter and normalization

The common interface MUST expose amounts in integer CAS while preserving each deployed contract's actual immutable decimal setting. The asset registry stores both `canonical_subunits_per_unit = 10,000,000` and `contract_decimals`.

For contract decimals d:
- If d = 7, one contract atomic unit maps to one CAS.
- If d < 7, convert contract atomic units to CAS by multiplying by 10^(7-d).
- If d > 7, convert CAS to contract atomic units only when exactly representable; otherwise reject the amount or retain the remainder in a separately auditable precision accumulator. Never silently round away user value.

On reads, convert contract atomic amounts to CAS using checked integer arithmetic. On writes, convert CAS to contract atomic units under the exactness rule above, then enforce the contract cap and balance. The adapter MUST be reversible for all accepted amounts and tested at zero, one CAS, maximum values and decimal boundaries. It MUST NOT change a deployed contract's decimals or reinterpret historical balances.

Each contract MUST publish immutable `asset_id`, `symbol`, `decimals`, `max_supply_atomic`, and a metadata/version hash. Cross-asset conversion is not a decimal conversion: it requires an explicit quote containing input/output asset IDs, integer CAS amounts, algorithm/version, source, venue/pool, fee, slippage bound, expiry, network ID and policy version.

### 3.3 Value algorithm is separate from denomination

The amount in CAS describes quantity only. The algorithm computes the value/quote for that quantity using asset-specific inputs, such as accepted market observations, utility demand, verified settlement activity, liquidity depth, risk haircuts, reserve evidence and governance-approved parameters.

A general quote interface may be represented as:

`ValueQuote(asset, amount_CAS, t) = amount_CAS × UnitValue(asset, t) / 10,000,000`

All terms must use declared integer scales and a documented rounding rule. `UnitValue` is asset-specific, time-stamped and versioned; it is not copied from another layer. If inputs are stale, insufficient, unverified or outside policy bounds, return NO_QUOTE rather than inventing a value. GCV, IPPR and QWF are not direct wallet conversion instructions or mint/burn triggers.

### 3.4 Fixed-point scales

- Basis points (bps): 10,000 bps = 100%.
- Parts per million (ppm): 1,000,000 ppm = 100%.
- Oracle price scale: explicit integer nano-USD or another declared scale.
- Rates MUST carry a scale and rounding rule in the schema.
- Every API, event, dashboard and payment intent MUST declare the asset ID and whether amount is CAS or contract atomic units.

Use checked integer multiplication/division. Reject overflow, underflow, negative values, booleans, NaN, infinity, unknown asset IDs and zero denominators. Specify floor/ceiling/nearest for each calculation. Allocation remainders use largest remainder and stable-ID tie-breaking.

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
- universal 10,000,000 CAS denomination across all fungible layers; contract-decimal adapter exactness for decimals below/equal/above 7; cap and supply accounting;
- unauthorized mint/burn, cap overflow, zero/negative/boolean/overflow inputs;
- exact mint/burn event and total-supply conservation;
- transfer, allowance, expiry and burn_from authorization;
- CAS/contract-atomic round-trip, precision remainder rejection, decimal mismatch and cross-asset addition rejection;
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

The current release matrix records the colored assets as unmapped/not deployed; PiGold as a registry/route validator; OUSD as a test-only asset; and PiDEX source as not proof of live pools. The seven-layer proposal also contains legacy denomination conflicts; the universal CAS rule and adapter are proposed here but have not yet been implemented in deployed contracts. Therefore:
- do not mint any layer yet;
- do not assume PiBank or PiGovernance is a fungible token;
- do not enable cross-layer swaps before verified pool balances and quotes;
- do not publish numeric issuance/burn percentages until per-layer policy approval;
- do not represent testnet assets as native Pi or redeemable USD.

This standard is ready for review and implementation planning, not authorization to deploy, initialize, mint, burn, transfer, add liquidity or trade.


## 13. Live market reference, asset-specific value and oracle controls

A market observation is an input to a versioned valuation function; it is not itself a token balance, a guaranteed purchasing-power amount, or a mint instruction.

For a market price quoted in USD per whole Pi, define:

- `P_Pi_USD(t)`: accepted USD/Pi observation at time t, normalized to a declared fixed-point scale.
- `CAS_PER_Pi = 10,000,000`: the accounting denomination.
- `MarketIndex_Pi(t) = P_Pi_USD(t) * CAS_PER_Pi`: a project-defined index score, with an explicit scale and version.

For the illustrative user-supplied observation `P_Pi_USD = 0.0642`:

`MarketIndex_Pi = 0.0642 * 10,000,000 = 642,000`

The result is an index score only. It is not 642,000 USD, not 642,000 Pi, and not automatically spendable CAS. The multiplication must not be used as an inverse exchange-rate formula.

The dimensionally correct indicative conversion for a USD-denominated purchase is:

`Pi_amount = USD_amount / P_Pi_USD`

`CAS_amount = Pi_amount * 10,000,000`

At the illustrative 0.0642 USD/Pi observation, a 100 USD item corresponds to approximately 1,557.632398 Pi, or 15,576,323,987 CAS before fees and rounding. The quote MUST use the accepted oracle price, exact fixed-point arithmetic, fee, slippage limit, expiry and a verified executable route. The example is not a live price assertion.

Every asset has its own `UnitValue(asset,t)` and valuation policy. PiCash, PiBank (if tokenized), Indigo, Purple/Pi and OUSD must never inherit Pi's USD quote by symbol, color, or denomination. A common CAS scale does not create parity. The merchant's item price is a separate quote in a declared settlement currency and may be updated independently of the market index.

Oracle observations MUST include source/provider, pair, network/domain, round or sequence, observed-at timestamp, received-at timestamp, decimals/scale, confidence or quorum metadata, and policy version. Reject stale, future-dated, duplicated, replayed, outlier, low-liquidity or insufficient-quorum observations. Use a bounded update cadence and circuit breakers; if the feed is unavailable or diverges beyond policy, freeze new conversions and return NO_QUOTE. Chainlink EVM feeds are not directly callable from Soroban; any bridge/relayer requires authenticated, domain-separated and replay-protected messages. An oracle reading is not proof of bank funds or merchant delivery.

## 14. Merchant sale, OUSD issuance and fiat redemption lifecycle

The following is a target workflow, not a claim that the integrations or reserves currently exist.

1. A merchant publishes an item with an amount and currency (for example, USD 100), inventory reference, merchant identity, expiry and accepted payment rails.
2. The quote service obtains current approved observations and calculates one or more asset-specific payment quotes. The buyer sees the exact asset, CAS amount, fees, route, minimum received, expiry and refund terms.
3. A payment intent is created with an idempotency key. The payment provider or chain transaction is verified server-side. A browser callback, oracle price, QR scan or wallet screenshot is not settlement proof.
4. Once the sale is finalized, the system records the merchant receivable and the buyer payment as separate ledger events. It does not mint OUSD merely because an item was sold or because an oracle reports a USD price.
5. If the merchant requests fiat payout, a licensed/contracted payout provider confirms the beneficiary, currency, fees, compliance checks and settled bank transfer. Only then may the matching OUSD liability be retired/burned, according to the redemption contract and accounting policy. If payout fails or is pending, the liability remains outstanding and the burn must not occur.
6. If external funds enter the ecosystem and OUSD issuance is contemplated, issuance is allowed only after independently verified, settled funds are received into the designated reserve/custody account, the liability is recorded, the issuer policy and cap are checked, and the mint is authorized. A pending transfer, card authorization, exchange quote, merchant sale or oracle price is not a reserve inflow.
7. If a user pays through PiCash, PiBank service, Purple/Pi, another layer or a card rail, PiGold may coordinate route discovery and policy checks. The selected execution rail performs the transfer/swap/payment. PiGold does not pool or custody the funds. Each pool retains its own pair reserves and accounting identity.
8. Refunds, card chargebacks, bank returns and payout reversals create linked compensating ledger entries. They must not erase the original sale or silently mint/burn an unrelated layer.

For an item listed at USD 100 and a merchant asking for `0.00001` units of a particular asset, the implied unit value of that asset is USD 10,000,000 per whole token (before fees). That value is valid only if the asset's own approved pricing policy and executable liquidity support it; it must not be inferred from Pi's market price or from the 10,000,000 CAS denomination.

### 14.1 OUSD liability invariant

For a redeemable USD-denominated test liability, maintain a distinct liability ledger and reserve evidence:

`OUSD_outstanding <= verified_eligible_USD_reserves_after_haircuts`

This inequality is a conservative release invariant, not proof of legal redemption or a stablecoin peg. The reserve record must identify custodian/provider, account reference (non-secret), currency, settled amount, encumbrances, haircut, reconciliation timestamp and independent evidence. If reserve verification, provider settlement, reconciliation or issuer authorization is missing, OUSD mint amount is zero and fiat redemption is disabled.

### 14.2 PiGold route coordinator and pooled liquidity

PiGold is the route graph/coordinator across independently managed pools and payment rails. It may compare route cost, depth, latency, settlement certainty and risk, but MUST NOT represent all pools as one fungible balance sheet. A route such as Pi -> PiCash -> OUSD -> fiat is valid only when every conversion edge has an active pool/provider, independent reserves or settlement capacity, a fresh quote, and a defined failure/compensation path. No route may count the same reserve twice or assume that a bank or exchange will accept an asset.

Bank cards, Visa/Mastercard, Banxa, Onramper or any other named provider remain disabled until an actual commercial integration, jurisdictional eligibility, provider approval, signed API/webhook verification, reconciliation and compliance review are evidenced. Naming a provider in a design is not evidence of a partnership or connection.
