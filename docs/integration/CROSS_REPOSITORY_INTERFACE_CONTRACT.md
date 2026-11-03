# Cross-Repository Interface Contract

## Ownership

| Interface | Owner | Consumer | Version authority |
|---|---|---|---|
| Normative standard and policy | PiRC | Contracts and application | PiRC revision |
| JSON schema and fixture | PiRC | API and contract tests | Schema ID/version |
| Soroban ABI, storage and events | SmartContracts mapped to PiRC requirement | Unity Sphere | Contract spec hash |
| HTTP API | Unity Sphere | Web UI/operators | OpenAPI/route version |
| Network profile | PiRC constraints; adapter pins endpoint/passphrase | Contracts and application | Environment profile |
| Evidence record | PiRC schema; all repos contribute | Release reviewers | Evidence schema version |

## Canonical request envelope

Every cross-repository request should include schema version, stable request/idempotency ID, feature ID, policy version, asset ID, network ID, atomic unit, timestamp/expiry, source metadata, authorization context and canonical payload digest. A client assertion is never accepted as proof of authorization or funds.

## Error contract

| Error | Required behavior |
|---|---|
| Invalid schema/version | Reject before mutation |
| Unauthorized role | Reject; no state change |
| Duplicate request/period/participant | Deterministic replay result; no overwrite |
| Overflow/underfunded | Typed failure; no partial write |
| Stale/untrusted oracle | Mark unavailable; no client fallback |
| RPC timeout/ambiguous submission | Pending; reconcile by idempotency key and tx hash |
| Readback mismatch | Block success presentation and open incident |
| Missing secret/network identity | Fail closed |

## Monetary semantics

Use integer atomic units with explicit asset ID and scale. Basis points are integer ratios; no binary floating point in settlement, reserve, issuance or allocation. Version rounding mode and remainder tie-break. External price, internal reference, merchant quote, collateral value and redeemable cash are separate types.

## Compatibility

- Additive optional field: minor version and old-consumer test.
- New required field, changed unit/enum/signature: major version.
- Storage change: migration or explicit version rejection.
- Events are append-only; consumers tolerate unknown non-critical topics.
- Never repurpose network, asset, layer or contract IDs.

## Acceptance

A feature is compatible only when requirement/schema revisions are pinned, contract ABI/storage mapped, API recomputes trusted inputs, positive/negative/boundary/replay/authorization/overflow tests pass, network status and contract readback reconcile, and release evidence points to immutable commits and artifacts.

## Known blockers

Economic fixture parity and typed underfunded errors need completion. Unity Sphere /verify intentionally fails closed until a network-pinned RPC client and secure signer/relayer exist. Oracle reporter storage is not quorum truth. Reserve attestations do not prove custody. Gold/Indigo remains unresolved. Netlify static hosting does not execute the Vercel catch-all API function.
