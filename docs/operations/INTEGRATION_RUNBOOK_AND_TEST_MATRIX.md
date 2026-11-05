# Integration Runbook and Test Matrix

## 1. Safe operating profile

Default mode is offline and read-only. CI and local validation must not sign transactions, submit transfers, deploy contracts, modify Mainnet, or require production secrets. Network smoke tests are optional read-only requests. Testnet deployment is manual-only and requires explicit operator approval.

## 2. Validation sequence

1. Record current branch and commit SHA for all repositories.
2. Confirm clean worktree and preserve source branches.
3. Run JSON/schema and Markdown link validation.
4. Run unit tests with explicit test directories (avoid accidental collection of nested snapshots).
5. Run Rust/Soroban tests on a supported host.
6. Run workspace typecheck/build on supported Linux CI.
7. Run Termux-specific offline checks; classify unsupported native tooling as BLOCKED, not PASS.
8. Run optional read-only network health checks.
9. Run liquidity stress/property tests with fixed seed and preserve outputs.
10. Perform security/dependency/secret review.
11. Testnet deployment only through manual workflow with test credentials.
12. Verify transaction, contract code hash, storage and registry read-back.
13. Reconcile events and produce release evidence bundle.

## 3. Network health classification

- `PASS`: HTTP success, valid JSON, and protocol-specific health response validated.
- `BLOCKED`: 401/403 or explicit access restriction.
- `RATE_LIMITED`: 429.
- `SERVER_ERROR`: 5xx.
- `TIMEOUT`: request deadline exceeded.
- `FAIL`: malformed response, JSON-RPC error, unexpected HTTP status or failed protocol health.
- `SKIP`: endpoint not configured or optional check not requested.

An HTTP 200 alone is never sufficient for Soroban RPC health. Send JSON-RPC `getHealth`, verify JSON-RPC version/id, reject `error`, and require a healthy status in `result`.

## 4. Termux and Linux support

Termux is a useful offline developer environment, but native Android packages may not exist for all Node toolchains. Do not silently pin a different TypeScript major/minor version to make one device pass. First verify package support, lockfile reproducibility, all workspace typechecks and Linux CI. A platform-specific unsupported compiler must be reported as `BLOCKED` with a clear alternative host recommendation.

## 5. Release evidence bundle

Include commit SHAs, changed paths, environment versions, exact commands, exit codes, sanitized logs, test seeds, schema/ABI hashes, dependency scan, secret scan, threat-model changes, testnet transaction references, contract IDs, code hashes, read-back snapshots, known gaps, rollback plan and approver. Never include secrets or private keys.
