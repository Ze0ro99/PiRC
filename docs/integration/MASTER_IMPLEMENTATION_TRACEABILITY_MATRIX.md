# Master Implementation Traceability Matrix

**Review baseline:** PiRC main `066c9085d93e3a2f8d91507a06b1ca47458adf9a`; SmartContracts main `33290f56a75ca3ad7ae8da44e23d42ab95fd0fe2`; Unity Sphere main `7e3f09105f4956f74aece99d3e7db965578e6b3b` (retrieved 2026-11-05). Refresh SHAs before release.

| Capability | Current evidence | Gap / risk | Required completion | Acceptance evidence |
|---|---|---|---|---|
| RAW record | evidence schema/docs and branch sources | hash alone does not prove asset/title | issuer, custody, legal references, signed attestations, dispute lifecycle | schema tests + signed fixture + reviewer |
| RAW factory | inspected source described in evidence register | event/product ID without child deploy; SDK placeholder tx hash | deterministic deploy/init/registry/read-back | testnet tx, code hash, read-back, idempotency tests |
| Possession proof | signature parameter observed | permissive true path | verify device key/signature/nonce/revocation | negative/positive crypto tests |
| PiDEX simulation | float-based reference engine | unsafe for settlement | integer atomic implementation and checked arithmetic | invariant/property/fuzz tests |
| Soroban AMM | reference contract exists | auth, fees, slippage, pause and callback assumptions need review | contract-by-contract audit | full contract tests and testnet read-back |
| Oracle V2 | reporter authorization and sequence evidence | single latest reporter record is not quorum | independent multi-source aggregation | quorum, stale, outlier and key-revocation tests |
| Chainlink adapter | EVM feed consumer exists | feed config/freshness/round integrity and network scope | per-chain configuration + explicit adapter boundary | fork/testnet fixtures and negative tests |
| AI oracle | allowlisted updater, bounded score, proof hash | hash does not prove inference | reproducibility, evaluation and governance gate | benchmark artifacts, model hash and reviewer |
| OUSD | test token, admin mint/burn, cap | no peg/reserve/redemption | retain TEST_ONLY or separately implement fully backed liability | legal, reserve, custody, redemption and reconciliation evidence |
| Economic settlement | merged hardening tests in PR #1100 | confirm all implementations and edge paths | conservation, replay prevention, period uniqueness | contract tests + independent reconciliation |
| Seven-layer model | architecture proposal | not seven currencies; Gold/Indigo unresolved | semantic registry and ADR | mapping tests and governance decision |
| PQ readiness | research/legacy hooks | no production PQ guarantee | standards-based crypto inventory and migration | reviewed libraries, test vectors, network support |
| Termux validator | current runner in PiRC main | pytest root collection; false PASS risk on generic HTTP 200; 403/429 conflation | explicit test scope, JSON-RPC validation and classified network states | Termux report + CI |
| TypeScript on Android | TypeScript `~7.0.2` in package manifest | reported native Android package resolution failure | verify upstream support and compiler execution model; do not blindly downgrade | Linux CI + Android/Termux reproducible log |
| Stellar Soroban RPC | user-reported 403 vs diagnostic 200 | inconsistent request/path/headers or rate/access policy | same JSON-RPC POST getHealth diagnostic and classify status | sanitized request/response report |
| Liquidity stress tests | user-reported NOT_RUN | no result | execute on supported host and preserve report | test output + seed/config |
| Duplicate backups | repeated nested snapshots | data loss if blindly removed | hash inventory, reference scan, retention decision | approved cleanup manifest |

## Capability status vocabulary

`PROPOSED`, `SCAFFOLDED`, `IMPLEMENTED_UNTESTED`, `TESTED_LOCAL`, `TESTED_TESTNET`, `AUDITED`, `DEPLOYED_VERIFIED`, `BLOCKED`, `DEPRECATED`.

No capability advances state without its acceptance evidence. The table is a review baseline, not a certification that every branch/file has been audited.
