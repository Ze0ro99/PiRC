# Observability and Incident Runbook

## Correlation fields

Record request/idempotency ID, feature/schema/policy version, asset/network IDs, contract/function, tx hash and ledger reference, source SHA and artifact hash, event digest/readback status, and request/submission/finality/reconciliation timestamps. Never log private keys, seed phrases, authorization headers or raw secrets.

## Minimum indicators

| Area | Indicator | Alert |
|---|---|---|
| API | Availability and 5xx rate | Sustained service failure |
| RPC | Submission/finality latency | Timeout or finality lag |
| Settlement | Event/readback mismatch | Any mismatch |
| Idempotency | Replay rejection | Anomaly or accepted duplicate |
| Oracle | Observation age/quorum | Stale or insufficient quorum |
| Reserve | Attestation age/scope | Expired/mismatched |
| Provenance | Unclassified balance delta | Non-zero unexplained delta |
| CI | Required job conclusion | Missing, queued too long, cancelled or failed |
| Deployment | Source/artifact hash | Any mismatch |

Set thresholds per environment; do not invent production SLOs in this document.

## Severity

- SEV-1: suspected key compromise, unauthorized settlement, irreversible transfer or state corruption.
- SEV-2: network/contract mismatch, readback divergence, replay acceptance, oracle compromise or material accounting discrepancy.
- SEV-3: degraded API/RPC, stale non-critical feed, CI outage or delayed UI evidence.
- SEV-4: docs, dashboard or non-production build issue.

## Response

1. Record incident ID, UTC time, reporter and environment.
2. Preserve redacted evidence; do not rewrite source history.
3. Pause affected signer/contract capability under approved emergency authority if value movement or key compromise is suspected.
4. Identify exact network, contract, code hash, tx and ledger state.
5. Reconcile event, contract readback and external ledger.
6. Prevent unsafe retries for affected request IDs.
7. Notify maintainers and independent reviewers.
8. Fix on a branch; run targeted tests and CI.
9. Resume only after approval and recovery test.
10. Publish root cause, scope, remediation and residual risk.

A Git revert does not roll back on-chain state. Recovery may require pause, compensating transaction, migration or new contract version.
