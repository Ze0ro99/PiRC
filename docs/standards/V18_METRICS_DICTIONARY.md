# V18 Commerce Velocity Metrics Dictionary

**Version:** 1.0 proposal. **Scope:** commerce application analytics, not consensus or protocol telemetry.

## Measurement contract

Every report must include `window_start`, `window_end`, `timezone`, `network_id`, `environment`, `schema_version`, `generated_at`, `source_watermark`, `event_count`, `excluded_event_count`, and `data_quality_status`.

Testnet observations must be visibly labelled TESTNET and must never be mixed into production economic claims.

## Metric definitions

| Metric | Definition | Unit | Inclusion rule |
|---|---|---|---|
| completed_orders | Count of unique orders with verified settlement and fulfillment in the window | orders | deduplicate by order ID |
| unique_buyers | Distinct pseudonymous buyer IDs on completed orders | buyers | exclude test fixtures/bots |
| unique_sellers | Distinct merchant IDs on completed orders | sellers | merchant registry verified |
| active_apps | Distinct app IDs with completed orders | apps | app status active |
| gross_merchandise_value_pi | Sum of settled order amounts denominated in Pi | atomic units and Pi | exclude refunds; report refunds separately |
| gross_merchandise_value_by_asset | Settled value grouped by asset ID | atomic units | never sum unlike assets |
| fiat_reference_estimate | Optional converted estimate | currency | include venue/source/time; not settlement value |
| checkout_latency_p50/p95 | Time from intent creation to verified settlement | milliseconds | exclude unresolved intents; disclose sample |
| payment_success_rate | Verified successful intents / valid submitted intents | percent | exclude expired-before-submission |
| repeat_purchase_rate | Buyers with >=2 completed orders / unique buyers | percent | same measurement window |
| inventory_turnover | Units fulfilled / average available inventory | ratio | only where inventory snapshots are reliable |
| refund_rate | Refunded completed orders / completed orders | percent | disclose partial vs full refunds |
| dispute_rate | Disputed completed orders / completed orders | percent | count unique orders |
| velocity_per_buyer | Completed orders / unique buyers | orders per buyer | no fiat interpretation |
| velocity_per_app | Completed orders / active apps | orders per app | no fiat interpretation |

## Formula policy

Rates must publish numerator and denominator. Latency must publish sample count and percentile method. Monetary totals must be grouped by asset; do not add Pi, OUSD test tokens, application tokens, or USD estimates together. GMV is not revenue, profit, reserve, collateral, or distributable surplus.

A composite V18 score is prohibited until a separately versioned methodology defines weights, normalization, missing data, outlier handling, minimum sample size, confidence intervals and auditability. Prefer the vector of raw metrics above.

## Data-quality flags

Use `VERIFIED`, `PARTIAL`, `STALE`, `RECONCILIATION_PENDING`, `INVALID`, or `TEST_FIXTURE`. A report with partial/stale data must not be presented as complete. Keep excluded counts and reasons.
