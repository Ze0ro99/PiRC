# Integrated Threat Model

**Scope:** PiRC standards, SmartContracts, Unity Sphere UI/API/adapters and CI/CD. This is a baseline, not an independent security audit.

## Assets

Signing keys, seed phrases, API tokens, identity data, contract admin/operator roles, collected revenue/liabilities/allocations, asset identity/provenance, oracle credentials/observations, build artifacts, ABI/WASM hashes and release evidence.

## Trust boundaries

| Boundary | Threat input | Required control |
|---|---|---|
| Browser → API | Forged amount, ID, eligibility or payment state | Authentication, schema validation, server-owned catalog, idempotency |
| API → ledger/oracle | External responses | Source validation, freshness, units, retries, reconciliation |
| API → signer | Transaction request | Network/contract/function allowlist, limits, human approval |
| Signer → RPC | Wrong endpoint/passphrase | Network pinning, TLS, domain separation |
| Caller → contract | Arguments/auth claims | require_auth, roles, checked arithmetic, replay protection |
| CI → release | Branches, artifacts, dependencies | Least privilege, pinned versions, hashes, manual gate |
| UI → user | Unsupported status/price claims | Evidence-backed status, source/time/confidence |

## Threat register

| ID | Threat | Impact | Mitigation |
|---|---|---|---|
| T-01 | Forged amount/payment completion | Unauthorized release | Server recomputation and platform verification |
| T-02 | Replay/duplicate request | Double settlement | Idempotency and replay state |
| T-03 | Unauthorized privileged call | Treasury/policy mutation | Role checks and negative tests |
| T-04 | Overflow/rounding drift | Value creation/loss | Integer units, checked math, conservation |
| T-05 | Spoofed/stale oracle | Incorrect decisions | Signatures, freshness, quorum and outlier policy |
| T-06 | Wrong network/RPC | Wrong-chain action | Pinned passphrase and allowlist |
| T-07 | Signer compromise | Irreversible loss | Isolated signer, short-lived secrets, approval |
| T-08 | Malicious CI automation | Source deletion/mass deployment | Read-only CI and explicit allowlists |
| T-09 | False reserve/provenance claim | Financial misrepresentation | Independent scoped evidence and reconciliation |
| T-10 | Artifact substitution | Unreviewed code deployment | Reproducible build and artifact hashes |
| T-11 | Ambiguous RPC response | Duplicate/lost operation | Durable state machine and reconciliation |
| T-12 | Frontend/API host mismatch | Broken or unsafe API | Separate deployment boundary and smoke tests |

## Security invariants

1. No secrets in Git, logs or artifacts.
2. No privileged transition without required authorization.
3. Rejected operations do not mutate aggregate or participant state.
4. Monetary math is integer and checked; allocations conserve value.
5. Missing/stale data fails closed.
6. Every transaction is network-bound and idempotent.
7. Submission is not final until network finality and readback.
8. Every release pins source commits and artifact hashes.
9. No automatic mainnet deployment or unrestricted signing.
10. Claims do not exceed independent evidence.

## Abuse-case tests

Fuzz zero/negative/maximum/overflow/malformed/duplicate/unknown inputs; test unauthorized callers for every privileged entry point; replay requests after restart; submit wrong-network/asset/expired oracle data; simulate RPC timeout before and after submission; alter client amounts; ensure readback mismatch blocks success; scan commits/logs/artifacts for secrets.

## Residual risks

Independent contract audit, legal review, custody verification, reserve attestation, production key ceremony and real network testing remain open until qualified evidence is supplied.
