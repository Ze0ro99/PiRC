# Integration Architecture Decision Records

## ADR-001 — Repository ownership boundaries

**Status:** Accepted for integration planning.

- PiRC owns normative standards, economic semantics, schemas, registries, and release acceptance criteria.
- SmartContracts owns executable Soroban behavior, ABI, storage, authorization, events, and contract tests.
- Unity Sphere owns API orchestration, UI, network adapters, indexing, operations, and evidence presentation.

**Rationale:** prevents competing sources of truth and limits cross-repository coupling to versioned interfaces.

**Consequence:** implementations must reference PiRC requirement/schema versions. Duplicated schemas must be checked for semantic and structural parity.

## ADR-002 — Revenue-funded distribution, not price-funded distribution

**Status:** Accepted.

Distributable value is computed from collected revenue after senior obligations. Forecasts, market capitalization, hypothetical token prices, TVL, and GCV reference values are not revenue.

**Rationale:** prevents a notional price from being mistaken for cash flow or redemption capacity.

**Consequence:** a settlement must identify its asset, atomic unit, accounting period, revenue evidence, deductions, and approval policy.

## ADR-003 — Integer atomic arithmetic

**Status:** Accepted.

Monetary amounts use non-negative integer atomic units. Floating-point values are prohibited in settlement calculations. Rounding is explicit and deterministic.

**Rationale:** reproducibility and conservation of value.

**Consequence:** each asset/feed must declare scale and unit. Cross-asset conversion requires a separately verified quote and explicit conversion policy.

## ADR-004 — Fail closed for financial actions

**Status:** Accepted.

Missing network configuration, contract ID, signer policy, stale oracle evidence, failed readback, schema mismatch, or unknown settlement state blocks execution.

**Rationale:** availability must not override financial correctness.

**Consequence:** read-only dashboards may remain available with degraded status, but payment/settlement paths remain disabled.

## ADR-005 — Gold and Indigo remain distinct unresolved terms

**Status:** Accepted pending a separate taxonomy proposal.

The seven-layer proposal uses Indigo as the sixth semantic layer. The Unity Sphere contract registry includes Gold. There is no accepted evidence that Gold and Indigo are equivalent.

**Decision:** retain both source representations; mark Gold unmapped/unresolved; do not rename, alias, issue, burn, or convert either entry based on color similarity.

**Closure requirements:** source provenance, governance authority, ordinal decision, migration plan, asset/contract mapping, compatibility tests, and a major-version registry change if identifiers or semantics change.

## ADR-006 — Oracle observation is not oracle truth

**Status:** Accepted.

A valid signature proves a configured reporter key signed an observation. It does not prove that the observation is accurate, independent, current, or economically enforceable.

**Consequence:** production feeds need source diversity, quorum, outlier policy, freshness, sequence/replay protection, key rotation, and incident response. A single-reporter storage contract must be labelled as such.

## ADR-007 — Attestation is not custody proof

**Status:** Accepted.

A reserve/liability record stores an auditor's claim and report hash. It does not independently inspect custody, legal title, encumbrances, or redemption rights.

**Consequence:** display attestation age, auditor identity, scope, report hash, exceptions, and verification status. Do not use a Boolean coverage flag as proof of solvency.

## ADR-008 — Selective branch intake

**Status:** Accepted.

Do not merge entire feature branches based on branch names or commit volume. Review diffs, workflows, secrets, destructive actions, and source ownership. Preserve branch history.

**Consequence:** unsafe all-branch harvest/deploy workflows remain excluded pending replacement by explicit allowlists, least privilege, dry-run, manual approval, and protected environments.
