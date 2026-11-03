# Pi Desktop 0.6.4 Compatibility Preparation Profile

**Status: PREPARATION / NOT VERIFIED**

This profile records the intended compatibility exercise for SoloHost and Hermes as referenced in the team's Pi Desktop 0.6.4 release context. The current purpose is to prepare and demonstrate capability compatibility, not to claim that source code has been imported or that a production integration has been certified.

## 1. Evidence required

| Area | Required evidence | Acceptance condition |
|---|---|---|
| Release identity | Pi Desktop 0.6.4 build/version and platform | Exact reproducible build identified |
| Component provenance | SoloHost/Hermes version, source origin, checksum | Immutable source and checksum recorded |
| Runtime | OS, architecture, runtime, process model | Supported runtime documented |
| Protocol | API/schema/protocol versions and negotiation | Explicit compatible versions |
| Authentication | Identity, token scope, session expiry, rotation | Least-privilege authentication |
| Capabilities | Filesystem, network, process, wallet, signing | Explicit allowlist; deny by default |
| Failure behavior | Timeout, disconnect, malformed payload, replay | Fail closed and recover safely |
| Observability | Structured logs, trace IDs, error codes | Reproducible evidence without secret leakage |
| Review | Test report and reviewer approval | Compatibility state approved |

## 2. Capability boundary

The compatibility demonstration must not grant either component unrestricted wallet/private-key access, transaction signing/submission, treasury/issuer/distributor authority, production secrets, arbitrary filesystem deletion or repository writes, or deployment/contract upgrade permissions.

Use sandbox fixtures and mock credentials for initial capability tests. Any future privileged capability requires a separate threat model, scoped authorization, human approval, and auditable test evidence.

## 3. Test matrix

| Test | Expected result |
|---|---|
| Version negotiation | Unsupported versions rejected with a stable error |
| Missing credentials | Request rejected; no fallback to privileged mode |
| Expired credentials | Session rejected and renewal required |
| Unauthorized capability | Denied and recorded |
| Malformed request | Validated and rejected without state mutation |
| Replay/duplicate request | Idempotent handling or explicit replay rejection |
| Timeout/disconnect | Bounded retry; no duplicate side effect |
| Secret redaction | No token, key, seed, or credential in logs |
| Runtime restart | No privilege escalation or state corruption |
| Compatibility regression | Same test suite reruns on each supported desktop build |

## 4. Status reporting

Use only these states:
- PREPARATION: integration design and test fixtures are being prepared.
- TESTED: named compatibility tests passed on a recorded build.
- VERIFIED: independent review confirms the evidence and scope.
- BLOCKED: required evidence or capability is unavailable.

Do not use COMPATIBLE, PRODUCTION_READY, or INTEGRATED without a versioned test report, provenance, and reviewer sign-off.
