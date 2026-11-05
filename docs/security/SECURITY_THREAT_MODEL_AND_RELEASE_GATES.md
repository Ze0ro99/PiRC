# Security Threat Model and Release Gates

## 1. Threat surfaces

| Surface | Threat | Required control |
|---|---|---|
| Git branches and automation | unreviewed workflow writes, secret exfiltration | least privilege, pinned actions, protected environments, read-only defaults |
| RAW / devices | replay, cloned UID, forged possession | device signatures, nonce, key registry, revocation, physical inspection |
| Contract factory | arbitrary code, duplicate deploy, fee abuse | template allowlist, deterministic salt, quotas, approvals, idempotency |
| Oracle | compromised reporter, stale/manipulated data | independent quorum, robust aggregation, freshness, circuit breaker |
| PiDEX / AMM | arithmetic overflow, slippage, reserve manipulation | integer math, checked operations, invariant/property tests, pause |
| OUSD | false peg/backing claims, reserve shortfall | test-only until legal/reserve/redemption evidence |
| AI agent | prompt injection, unauthorized code or payments | capability allowlist, sandbox, approval gates, audit, no self-approval |
| PQ transition | unverified algorithm or incompatible protocol | algorithm agility, crypto inventory, test vectors, interoperable migration |
| Treasury | allocation exceeds revenue, replayed settlement | integer conservation, period uniqueness, authorization, reconciliation |

## 2. Differential risk engineering

Risk should be assessed per asset, counterparty, venue, network, contract version and action. A generic score is not a substitute for hard limits. Define exposure, loss severity, likelihood, uncertainty, concentration, liquidity haircut, oracle confidence and recovery time. Enforce deterministic caps and fail-closed gates before any scoring-based routing.

## 3. Post-quantum cryptographic agility

Legacy hooks or a branch name containing "quantum" do not establish post-quantum security. Maintain a crypto inventory (algorithm, version, key size, library, protocol support, owner, rotation path). Require published standards-based algorithms, reviewed implementations, test vectors, side-channel review, hybrid migration plan, key lifecycle and network interoperability. Do not silently change on-chain signature semantics unsupported by the target network.

## 4. AI/automation capability tiers

- Tier 0: read-only analysis and report generation.
- Tier 1: propose patches, schemas and tests; no write permissions.
- Tier 2: create branch/PR after explicit authorization; no merge/deploy.
- Tier 3: approved CI actions in isolated test environments.
- Tier 4: production signing/deployment only through separately governed human-controlled release systems; not available to general agents.

Agents cannot approve their own PR, modify their own permissions, access production secrets, or execute Mainnet transfers.

## 5. Release gates

1. Schema, ABI and documentation validation.
2. Unit, integration, property, fuzz and regression tests.
3. Dependency/license and secret scans.
4. Authorization, replay, overflow, pause and failure-path tests.
5. Oracle freshness/quorum and liquidity stress tests.
6. Testnet deployment only by manual workflow dispatch and explicit approval.
7. Read-back and independent reconciliation.
8. Security review and rollback rehearsal.
9. Mainnet release requires a separate explicit human authorization and production runbook.

## 6. Incident controls

Every financial component must expose pause/freeze, owner escalation, evidence preservation, key revocation/rotation, reconciliation and recovery procedures. Emergency controls must be tested and cannot depend solely on the component being paused.
