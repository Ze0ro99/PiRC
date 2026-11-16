# Layer Ratios, Escrowed Migration and Monetary Scale Policy

**Status:** Proposed PiRC community policy, pending governance approval and contract implementation.
**Network scope:** Pi Testnet1 only for any future implementation.
**Authority boundary:** This document does not alter native Pi, promise a fiat value, authorize token issuance, or prove any asset/pool is deployed or backed.

## 1. Purpose and unit separation

The ecosystem uses three different concepts which MUST NOT be conflated:

1. **CAS denomination:** the common accounting precision interface is 10,000,000 canonical accounting subunits (CAS) per whole fungible asset unit. CAS is not a price.
2. **PiGold reference ratios:** layer-specific conversion ratios to one PiGold accounting unit. These are versioned economic policy parameters, not equal-value claims and not automatic swaps.
3. **External market value:** a time-stamped, asset-specific quote. It can change continuously and is never inferred from a layer's CAS amount or PiGold ratio.

Each cross-layer conversion must resolve an exact asset ID, policy version, quote, pair pool/provider, fees, slippage, expiry, network and authorization. If there is no verified executable liquidity route, return NO_ROUTE; do not post a synthetic conversion.

## 2. User-specified baseline layer ratios

The following ratios are recorded as the proposed baseline supplied for this project:

| Asset/layer | Baseline amount per 1 PiGold | Function | Conversion treatment |
|---|---:|---|---|
| Green / PiCash | 100,000 PiCash | Daily commerce and payments | Exact integer ratio, subject to a verified PiCash/PiGold pool or settlement route |
| Blue / PiBank | 10,000 PiBank | Banking and institutional workflow | Service gateway by default; token conversion only if a separately approved PiBank asset exists |
| Yellow | 1,000 Yellow | Internal/external balancing utility | Versioned ratio; require independent liquidity and oracle policy |
| Orange / exchange layer | 100 Orange | Exchange and market access | Pair-specific quote, market depth, fee and slippage checks |
| Red / governance | No fixed PiGold ratio | Contribution-based governance and voting | Non-transferable governance weight by default; never cash-convertible by implication |
| Purple / mined Pi bridge | 10,000,000 Purple atomic units = 1 mined-Pi unit; baseline 1 mined-Pi unit = 10 PiGold | Provenance/migration bridge | Escrow and migration proof required; no native Pi minting or supply editing |
| PiGold | 1 PiGold | Reference and route coordination unit | Must have its own asset definition if represented as a token; coordinator contract alone is not a token |

These are proposed internal ratios. They do not establish USD values, parity, legal redemption, issuer authorization or market liquidity. The registry must carry a version, effective ledger/time, approver, evidence hash and sunset/rollback policy.

### 2.1 Exact CAS arithmetic for the four layer ratios

For fungible layer assets using 10,000,000 CAS per whole unit, and a ratio R = layer whole units per 1 PiGold:

PiGold_out_CAS = floor(layer_input_CAS / R)

layer_change_CAS = layer_input_CAS - PiGold_out_CAS * R

The remainder must be retained for the user or rejected if the route cannot represent it. Never discard it silently. Inverse quotes use layer_input_CAS = PiGold_input_CAS * R, plus separately disclosed fees. Checked integer arithmetic and explicit rounding are mandatory.

Illustrative exact conversions before fees:
- 100,000 PiCash -> 1 PiGold.
- 10,000 PiBank -> 1 PiGold.
- 1,000 Yellow -> 1 PiGold.
- 100 Orange -> 1 PiGold.

A user holding 1 whole unit of each asset does not hold equal PiGold value: under this schedule their reference quantities are 1/100,000, 1/10,000, 1/1,000 and 1/100 PiGold respectively. These are accounting ratios only; execution still requires a pool/provider quote.

## 3. Red governance accrual

Red governance is earned from verified pioneer contribution, not purchased as a cash substitute. A policy may calculate:

raw_score_i = sum(verified_contribution_i,k * approved_weight_k)

governance_weight_i = min(account_cap, floor(raw_score_i * eligibility_factor_i))

Eligibility, contribution proofs, decay/period rules, caps, delegation, conflict-of-interest handling and snapshot height must be versioned. The score is not a token price and cannot be redeemed for PiGold. If a transferable governance token is later adopted, it requires a separate governance decision and security model; voting weight must not silently equal token balance.

## 4. Purple mined-Pi denomination and expansion

### 4.1 Baseline

The supplied baseline is:

- PURPLE_SUBUNITS_PER_MINED_PI = 10,000,000
- PIGOLD_PER_MINED_PI = 10
- Therefore 10,000,000 Purple subunits represent one mined-Pi unit, with a 10 PiGold reference conversion.

The Purple adapter must identify whether the input represents a project-issued test representation or a native Pi transfer record. A project contract can mint only its own authorized test asset; it cannot mint, re-denominate or change the supply of native Pi.

### 4.2 Proposed expanded denomination tier

The supplied expansion example is:

- New Purple denomination: 100,000,000 subunits per mined-Pi unit.
- New reference: 100 PiGold per mined-Pi unit.
- Expansion factor relative to baseline: 10x.

This must be implemented as a versioned redenomination/migration tier, not as an automatic tenfold increase in anyone's wealth or as permission to mint ten times more native Pi. The 100,000,000 figure describes the new subunit denomination/eligible migrated unit under the approved tier; it is not by itself evidence of 100,000,000 newly issued whole Pi.

### 4.3 Escrow-gated migration state machine

A scale upgrade is allowed only after the eligible migrated balance is placed under the specified escrow/lock control and independently reconciled. Required states:

PROPOSED -> SNAPSHOT_FROZEN -> ESCROWED -> RECONCILED -> APPROVED -> ACTIVATED

Failure states: REJECTED, DISPUTED, EXPIRED, ROLLED_BACK_BEFORE_ACTIVATION.

Required gates:
1. Freeze a deterministic snapshot at a named ledger and network ID.
2. Prove ownership/provenance and exclude duplicate, already-migrated, disputed, locked-elsewhere and ineligible balances.
3. Lock/escrow the eligible project-issued representation using a contract with authenticated release authority, replay protection and per-beneficiary records. Native Pi escrow is only possible if the native network mechanism explicitly supports it; never assume a project contract can lock native Pi held elsewhere.
4. Reconcile eligible_snapshot = escrowed_total = migration_credit_total in the declared atomic units, with all exceptions separately accounted.
5. Require independent read-back of escrow state, total supply, balances and code hash, plus governance approval and timelock.
6. Activate one immutable policy version at a specified ledger/time. All clients, APIs, contracts and agents must reject mixed versions.
7. Preserve a one-to-one migration receipt linking old asset/units to new asset/units. No user can claim twice; no old representation can be spent after its migration credit is activated.
8. Keep escrowed units counted in total supply unless they are explicitly and successfully burned. Locking is not burning.

### 4.4 Supply and conversion invariants

For each project-issued asset:

total_supply = spendable + locked + escrowed + other explicitly classified balances

migration_credit_total <= reconciled_escrowed_eligible_total

activated_migration_credit + unconverted_eligible_balance = eligible_snapshot_total (after exact denomination normalization)

The conversion schedule must be explicit per tier:
- tier_0: 10,000,000 subunits per mined-Pi unit; 10 PiGold reference.
- tier_1: 100,000,000 subunits per mined-Pi unit; 100 PiGold reference.

Do not infer intermediate tiers or continuously increase the multiplier from market price, velocity, user demand, or an AI model. A future tier requires a new proposal, impact analysis, full escrow reconciliation and governance approval.

## 5. Stability architecture: resist shocks without promising an impossible peg

No algorithm can guarantee stable external purchasing power through a market collapse unless sufficient independently verified assets, market depth, liquidity and enforceable redemption capacity exist. The design therefore separates internal commerce continuity from external market conversion:

- **Internal commerce pricing:** merchants may quote goods in a stable accounting currency or in their own asset-specific terms for a defined quote window. Do not reprice every item on every external tick.
- **External conversion:** use fresh, quorum-checked observations and executable pool/provider quotes. This is where external market movements are reflected.
- **Liquidity buffers:** maintain separately identified reserves per asset and pair; apply haircuts, concentration limits and stressed outflow coverage.
- **Circuit breakers:** pause new conversion routes when oracle feeds are stale/divergent, reserves fail reconciliation, pool depth falls below limits, redemption queues exceed policy or settlement providers fail.
- **Inventory and turnover:** monitor fulfilled sales, inventory replenishment, unique counterparties, settlement time, refunds and net eligible turnover. Exclude wash trades, circular transfers and synthetic volume.
- **Liability discipline:** never issue OUSD or other redeemable liabilities without settled, verified eligible reserves and an approved issuer. Pending deposits and oracle quotes are not reserves.
- **Loss allocation:** define in advance who bears slippage, depeg, insolvency, chargeback and provider failure; do not socialize a deficit through hidden minting.
- **Graceful degradation:** keep internal transfers and commerce routes available only where they remain solvent and operational; disable only unsafe external conversion edges where possible.

A proposed risk controller may compute:

stress_ratio = verified_unencumbered_liquidity_after_haircuts / stressed_settlement_outflows

route_capacity = min(pool_depth_capacity, provider_capacity, policy_cap)

conversion_enabled = oracle_fresh AND quorum_ok AND reserve_reconciled AND stress_ratio >= minimum_policy_ratio AND route_capacity > 0

Thresholds are unset until reserve, liability, provider and risk data are evidenced and approved. A circuit breaker may stop conversion; it must not fabricate a stable price or create unbacked units.

## 6. PiGold system role

PiGold can provide a unified **liquidity coordination and visibility layer**:
- discover eligible pools and payment rails;
- calculate multi-hop route costs and settlement capacity;
- prevent reserve double counting;
- show consolidated metrics while retaining pool-by-pool balances and liabilities;
- coordinate route selection between PiCash, PiBank service rails, Yellow, Orange, Purple and approved OUSD flows.

It must not be represented as one omnibus wallet holding all layer reserves. Each pair pool remains independently owned and accounted for. The current Soroban PiGold coordinator source is metadata/route validation only: it does not custody tokens, aggregate balances, execute swaps, mint assets or prove liquidity. A future execution adapter and pool contracts need separate implementation, tests and deployment evidence.

## 7. AI economic agents and authority limits

AI agents may:
- observe market/oracle feeds and flag anomalies;
- forecast demand, inventory, liquidity and stressed outflows;
- recommend route selection and quote alternatives;
- simulate issuance/burn budgets and expansion impacts;
- detect duplicate migration claims, wash volume and suspicious flows;
- generate auditable explanations and proposed governance actions.

AI agents MUST NOT independently:
- mint, burn, unlock escrow, change decimals/redenomination tiers or upgrade contracts;
- approve their own oracle evidence or reserve attestations;
- change issuer roles, caps, governance weights or redemption terms;
- execute external bank/card payouts or move user assets without explicit transaction authorization.

Privileged actions require deterministic policy checks, independent evidence, least-privilege role authorization, timelock where appropriate, human/governance approval, idempotency and post-action read-back. Agents must expose model/version, input provenance, confidence, policy hash and decision trace without exposing personal secrets.

## 8. Required tests and release gates

Test vectors must cover:
- exact 100,000/10,000/1,000/100 layer-to-PiGold ratios and remainders;
- rounding, overflow, decimals adapter and inverse conversion;
- governance score caps and proof replay;
- 10,000,000 baseline vs 100,000,000 expanded Purple denomination;
- migration snapshot/escrow reconciliation, duplicate claim, partial migration, disputed balance and failed release;
- supply conservation including locked/escrowed balances;
- tier-version mismatch and stale clients;
- oracle stale/outlier/quorum failure, pool reserve double counting and circuit breaker;
- reserve haircut, stressed outflow and redemption queue tests;
- AI prompt/data manipulation and unauthorized privileged-action attempts.

Release remains blocked until canonical asset mapping is approved, exact contract interfaces are implemented, tests pass, reproducible WASM builds are pinned, Testnet1 deployment and independent read-back exist, and every issuer/escrow/pool authority is reviewed. No mainnet action is authorized by this proposal.


## 8. Legacy source reconciliation and compatibility gate

The requested ratios are not yet consistently implemented by the current application sources. In particular, the Unity Sphere file assets/js/pirc207-layer-math.mjs currently declares:
- 10,000 Heart/Throat units per Pi;
- 1,000 Heart/Throat units per PiGCV;
- conversion support only for heart, throat and crown, with other layers returning UNSPECIFIED.

Those legacy constants conflict with the newly supplied PiGold ratios for PiCash, PiBank, Yellow and Orange. They MUST NOT be silently overwritten in a deployed client or contract. Implementation must introduce a new versioned conversion-policy identifier, retain the old policy for historical reads, and require all clients/API/contract adapters to specify the policy version. New policy tests must prove that historical balances and old transactions remain interpretable.

The SmartContracts Testnet1 asset manifest currently records seven colored test assets with null contract IDs and registry status NOT_DEPLOYED; its migration mapping is not approved. Therefore the ratios in this document are owner-provided proposed policy inputs, not discovered deployed constants. Before any code activates them, reviewers must approve canonical color-to-asset mapping, issuer identities, actual decimals/caps, PiGold representation, Purple provenance rules and the escrow contract interface.

The implementation sequence is:
1. add a versioned read-only ratio/scale library and deterministic golden vectors;
2. validate every ratio and inverse/remainder path without chain writes;
3. add a policy registry and escrow migration state machine with authorization, replay protection and supply reconciliation;
4. integrate the read-only quote API and dashboard with explicit UNKNOWN/UNVERIFIED states;
5. only after review, deploy isolated Testnet1 artifacts and perform independent read-back.

No source-level conversion helper, registry record or UI display is proof of live pool liquidity, contract deployment, escrow custody or fiat redemption.

