# Cross-Repository Test Strategy

## Test layers

| Layer | Owner | Checks | Evidence |
|---|---|---|---|
| Schema/fixture | PiRC | JSON Schema and golden vector tests | Exact output/CI run |
| Reference economics | PiRC | Unit, boundary, property, deterministic allocation | Test summary |
| Contract | SmartContracts | fmt, locked check/test, WASM build | CI tied to SHA |
| API | Unity Sphere | Schema, auth, idempotency, fail-closed | API test report |
| Adapter | Unity Sphere | Mocked RPC and network profile tests | Clearly label mock vs Testnet |
| Cross-repo parity | All | Shared vectors and ABI/schema compatibility | Parity matrix |
| Testnet | All | Deploy, submit, finality, readback, event reconciliation | Tx hash, contract ID, WASM hash |
| Production | All + reviewer | Security and release review | Signed dossier |

## Golden vector rule

Each canonical fixture case must be consumed by PiRC reference engine tests, SmartContracts Soroban tests, and Unity Sphere API/adapter tests. A copied fixture file or a separate Python validator is not contract parity. Compare canonical outputs, typed errors and integer units.

## Mandatory economic cases

Net distributable; underfunded rejection; zero revenue/prior supply; negative and overflow inputs; equal/unequal largest-remainder allocation; canonical tie-break; zero/duplicate/unsorted participant IDs; conservation and rejected-write integrity; zero denominators and basis-point rounding; asset/scale mismatch; replay and authorization.

## Evidence states

- NOT_RUN: no result.
- QUEUED: workflow started, no conclusion.
- PASSED: required job completed successfully on cited SHA.
- FAILED: exact job failed; link failing step/log.
- CANCELLED: no acceptance conclusion.
- SKIPPED: reason documented.
- UNAVAILABLE: provider/permission prevented retrieval.

Queued, empty or missing CI status is never passed.

## Cost-conscious execution

1. Docs/schema-only: markdown/link/schema checks.
2. Reference math: focused tests.
3. Rust changes: fmt and targeted crate test, then workspace tests.
4. API changes: targeted route/schema tests.
5. Cross-repo interface: compatibility tests.
6. Testnet: release candidates only, with approval.
7. Independent audit: exact immutable release candidate.

Use path filters and caches, but do not skip required tests for code changes.
