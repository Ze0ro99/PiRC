# Dual-Value and Utility Accounting Standard

**Status:** Proposed accounting standard; not an official Pi monetary policy, price target, peg, or redemption commitment.

## 1. Separate concepts

The system MUST distinguish native Pi protocol balances, project-issued tokens, internal utility credits, external venue balances, merchant quotes, accounting references, and legally redeemable liabilities. Mined, migrated, and externally acquired Pi are provenance descriptions; they do not create different protocol denominations unless the network itself enforces such separation.

## 2. Quote type registry

| Type | Meaning | May settle a payment? |
|---|---|---|
| `USD_NUMERAIRE` | Reporting/reference unit | No, not by itself |
| `INTERNAL_REFERENCE` | Governance-controlled internal index | No, not by itself |
| `MERCHANT_UTILITY_QUOTE` | Merchant price, availability and terms | Yes, if merchant accepts and settlement path is valid |
| `EXTERNAL_CEX_QUOTE` | Venue-specific market observation | No; observation only |
| `DEX_EXECUTABLE_QUOTE` | Route and amount-specific executable estimate | Only after execution and confirmation |
| `COLLATERAL_MARK` | Risk mark with haircut and expiry | No |
| `REDEEMABLE_LIABILITY` | Issuer obligation backed by enforceable terms and reserves | Only under verified redemption terms |

Every quote carries `quote_id`, `quote_type`, `base_asset`, `quote_asset`, `amount_atomic`, `decimals`, `source_id`, `venue_or_merchant`, `observed_at`, `expires_at`, `fee_model`, `confidence`, `policy_version`, `status`.

## 3. Internal utility formation

Internal utility must be supported by real merchant supply, goods/services availability, accepted payment terms, verified revenue, operating costs, senior obligations, risk reserves, dispute/refund exposure, and transparent eligibility rules. A reference index may summarize these inputs; it is not a claim that every holder can redeem at the index value.

A conservative distributable surplus model is:

[
D = max(0, R - C - P - L - Q)
]

where (R) is collected eligible revenue, (C) operating costs, (P) taxes/senior payables, (L) refunds/chargebacks and (Q) risk/liquidity reserves. Forecast revenue, market capitalization, hypothetical token price, TVL and GCV are not collected revenue.

For eligible weights (w_i), a bounded allocation is:

[
B_i = D cdot rac{w_i}{sum_j w_j}
]

The policy must specify eligibility, caps, vesting, dispute handling, anti-sybil rules, rounding, and unallocated dust. The sum of allocations must never exceed (D).

## 4. Precision and denomination

For an asset with (d) decimals, atomic units are (A = W 	imes 10^d). A display precision change does not multiply purchasing power, supply, reserves, or redemption capacity. Monetary calculations use integers or fixed-point arithmetic with explicit scale and rounding; floating-point arithmetic is prohibited in settlement.

## 5. Sovereign multiplier scenario

[
314159 / 0.0314159 = 10{,}000{,}000
]

This identity is a mathematical ratio between two assumed numbers. It is not a conversion function. A system MUST NOT permit arbitrage that treats an internal reference as a redeemable price while the external quote is lower. Conversion requires a legally and operationally supported liability, funding, custody, settlement, and reconciliation path.

## 6. Conversion firewall

Block automatic conversion where quote types differ without policy approval; source is stale; confidence or quorum is insufficient; asset units/decimals mismatch; price deviation exceeds configured tolerance; liquidity is inadequate; issuer or counterparty is suspended; reserve evidence is missing; or settlement read-back is uncertain.

## 7. OUSD status

OUSD modes must be named distinctly:
- `OUSD_ACCOUNTING_UNIT`: internal unit of account only.
- `OUSD_UTILITY_CREDIT`: limited platform credit under explicit terms.
- `OUSD_REDEEMABLE_LIABILITY`: only if issuer, reserve assets, custody, audit, legal redemption rights, settlement, insolvency treatment and reconciliation are established.

Until all redemption prerequisites are evidenced, OUSD remains test-only and must not be marketed as USD-backed or pegged.
