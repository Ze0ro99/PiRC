# PiRC Economic System Integration Blueprint

Status: normative design proposal for engineering review. This document does not declare official Pi Network monetary policy, a guaranteed Pi price, a bank relationship, asset backing, or redemption rights.

## 1. Design invariants
1. Preserve the seven-layer identity, names, colors, and order exactly as defined by the existing source mapping. Do not recolor, rename, reorder, collapse, or infer aliases.
2. Keep mined/internal Pi, externally purchased Pi, application credits, tokenized assets, and fiat balances as distinct asset classes with explicit provenance.
3. Separate reference values, observed market prices, utility prices, accounting values, collateral marks, and executable redemption prices. They are not interchangeable.
4. No GCV constant, multiplier, oracle observation, dashboard value, or proposal creates a claim on bank reserves or a right to redeem.
5. Every financial feature must be disabled by default until contracts, legal review, security review, operational controls, and independent verification pass.

## 2. Seven colored proposal layers (authoritative source mapping)

The seven colored proposal layers are distinct from the seven technical architecture layers in the Master Architecture. Preserve the PiRC-207 source mapping below exactly; these are proposal labels, not official Pi Network token classes or guaranteed exchange values.

| Order | Color | Chakra | Proposal label / role | Source constant |
|---:|---|---|---|---:|
| 1 | Red | Root | Governance | GOV |
| 2 | Orange | Sacral | Mid-tier utility | 3141 |
| 3 | Yellow | Solar Plexus | High-tier utility | 31140 |
| 4 | Green | Heart | PiCash / daily utility | 3.14 |
| 5 | Blue | Throat | Banking / institutional layer | 314 |
| 6 | Indigo | Third Eye | Premium reserve | 314159 |
| 7 | Purple | Crown | Mined Pi and fractions | 1 |

Do not rename, recolor, reorder, merge, or invent conversion rules for these layers. The registry mismatch is unresolved: the CSV contains Gold where the proposal has Indigo, while Gold has no matching chakra-layer definition. Keep Gold and Indigo as distinct records until a versioned standards decision resolves the mismatch. Do not silently reassign a contract address.

Conversion constants stated in the source proposal: Heart and Throat: 10,000 units = 1 Pi; 1,000 units = 1 PiGCV; 1 unit = 1,000 micro. Crown: 10,000,000 micro = 1 Pi. Red, Orange, Yellow and Indigo have no complete conversion rule specified in the cited proposal.

## 3. Value taxonomy
- Internal reference value: a policy or accounting coordinate used by an explicitly named application or program. It is not automatically a market quote, legal tender value, collateral value, or redemption promise.
- External market price: an observed quote on a named venue, pair, timestamp, and market-data source. It can differ across venues and can be unavailable or manipulated.
- Utility price: the price a merchant or application actually accepts for a defined good or service, with its own terms, expiry, and refund policy.
- Accounting value: a valuation chosen for financial statements or internal reporting under a stated methodology.
- Collateral value: a risk-adjusted value after liquidity haircuts, concentration limits, eligibility checks, and liquidation assumptions.
- Redeemable value: an amount owed by a legally obligated issuer under enforceable terms and funded settlement arrangements. Never infer this from the other values.

### GCV and sovereign multiplier
If a design scenario uses internal reference Pi = USD 314,159 and observed external price Pe = USD 0.0314159, then Pi / Pe = 10,000,000 arithmetically. This is a ratio between two assumed numbers, not proof of a conversion mechanism, a target market price, a guaranteed valuation, or a 10,000,000x arbitrage opportunity.
The system must represent this ratio as a research/scenario parameter only. It must not create automatic wallet conversion, minting, redemption, collateral, settlement, or user-balance changes from it.

## 4. Utility-funded economics
A sustainable distribution model must be constrained by realized, reconciled operating surplus, not by a notional reference price.
Let R_t be collected and reconciled operating revenue; C_t verified operating costs, refunds, chargebacks, taxes, and provisions; L_t required liquidity and risk reserves; and D_t distributable surplus.
D_t = max(0, R_t - C_t - L_t).
An illustrative allocation for eligible participants may be B_i = D_t * (w_i / sum(w_j)), where w_i is an approved, auditable contribution weight. Eligibility, identity, anti-Sybil controls, dispute handling, caps, vesting, and jurisdictional rules must be defined before any distribution. This formula is a design model, not an entitlement or promised yield.
Do not count uncollected GMV, speculative token appreciation, unverified reserves, or circular token transfers as revenue.

## 5. Provenance and conversion firewall
Every balance and movement must retain asset identifier and network; issuer and contract address; source class (mined, migrated, purchased, earned, merchant-received, bridged, or issued); transaction and ledger references; eligibility state where legally required; restrictions, lockups, liens, and expiry; source verification status and timestamp.
A bridge, exchange, oracle, or user interface must not silently convert provenance classes. Cross-class conversion requires an explicit, authorized, priced, auditable operation with compliance checks and rollback/reconciliation controls.

## 6. Economic modules and interfaces
| Module | Required capability | Evidence before activation |
|---|---|---|
| Monetary/reference standard | Typed value classes, precision, units, policy version | Standards tests and approved governance record |
| Asset registry | Issuer, network, contract, decimals, status, provenance | Independent address/code verification |
| Oracle network | Source allowlist, quorum, freshness, deviation limits, signed rounds | Adversarial tests and monitored testnet deployment |
| Pi Cash / payments | Quotes, payment intent, settlement status, refunds, idempotency | Merchant test flows and reconciled ledger |
| AMM / liquidity | Pool accounting, invariant checks, slippage, LP risk, circuit breakers | Fuzz/invariant tests and liquidity disclosure |
| Lending / collateral | Eligibility, haircuts, health factor, liquidation and bad-debt policy | Stress tests and legal/security review |
| Treasury / yield | Segregation, mandate, counterparty limits, reconciliations | Custody evidence, audit, and approved mandate |
| Institutional custody | Key policy, segregation, recovery, authorization | Independent custody controls and legal agreements |
| Governance | Proposal lifecycle, quorum, timelock, veto/emergency path | Reproducible execution tests and governance approval |
| Compliance / justice | Risk-based KYC/KYB/AML, sanctions screening, disputes, appeals | Jurisdiction-specific legal review and privacy assessment |
| RWA / CBDC interfaces | Issuer attestations, legal rights, transfer restrictions | Issuer contract, legal documentation, reserve/asset verification |

## 7. Oracle and risk policy
All price observations must carry source, pair, network, timestamp, decimals, round/sequence, confidence/quality, and verification status. Reject stale, future-dated, non-positive, malformed, replayed, or outlier observations. Define quorum and aggregation before using an observation for settlement, collateral, or treasury operations.
A Chainlink EVM feed is not natively callable by Soroban. Cross-chain delivery requires a separately specified authenticated adapter/relayer and replay-resistant message verification. An off-chain dashboard reader is not a decentralized oracle.

## 8. Accounting and reconciliation
Use a double-entry event ledger with immutable event IDs, idempotency keys, deterministic decimal arithmetic, explicit fee accounts, pending/settled/reversed states, and periodic reconciliation against the authoritative network or custodian statement. Never use JavaScript floating-point arithmetic for settlement amounts. All token amounts use integer base units with explicit decimals.

## 9. Governance and change control
Each economic parameter must have an owner, version, rationale, bounds, effective date, approval quorum, timelock, emergency override, audit trail, and rollback procedure. Changes to the seven-layer mapping require an explicit standards amendment and must not be smuggled in as a code refactor.

## 10. Release gates
- [ ] Canonical layer mapping is verified against the source document and tests.
- [ ] Value types and provenance classes are explicit in schemas and API contracts.
- [ ] GCV and multiplier are marked research-only unless separately approved by a legally accountable issuer.
- [ ] No conversion or redemption path is implied by reference values.
- [ ] Revenue is collected, reconciled, net of costs and reserves before any allocation.
- [ ] Oracle quorum, freshness, deviation, replay, and source-divergence tests pass.
- [ ] Payment, AMM, lending, treasury, custody, RWA, CBDC, and governance modules each have isolated feature flags and acceptance tests.
- [ ] Legal, security, privacy, custody, and operational reviews are complete before production enablement.