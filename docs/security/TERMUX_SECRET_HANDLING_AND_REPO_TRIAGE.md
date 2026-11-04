# Secret Handling and Cross-Repository Intake Triage

**Status:** Security review note based on repository path metadata only. File contents and secret values were not retrieved.

## 1. Findings requiring maintainer review

The Unity Sphere repository root currently exposes tracked path names that require immediate classification before any broad Termux clone or branch-wide extraction:

- `.env`
- `issuer_pk.txt`
- `validation-key.txt`

A tracked filename is not proof that its contents are a live credential. However, these names are high-risk indicators. Do not copy their contents into PiRC, reports, issues, chat, build logs, or artifacts. Review locally in a trusted environment without printing values. If any file contains a private key, seed, token, password, or live signing material, revoke/rotate it immediately and remove it from current tracking; history cleanup is a separate controlled operation.

The GitHub settings screenshots show repository/environment secret *names*, not secret values. The names must never be treated as credentials or copied into scripts.

## 2. Safe Termux handling

- Never run a broad all-branches checkout before the secret inventory is complete.
- Use a clean working directory with device encryption and restrictive permissions.
- Do not enable shell tracing (`set -x`) in scripts that may handle environment variables.
- Never use `env`, `printenv`, `set`, `cat .env`, or shell history to publish credentials.
- Load a secret only at the exact command boundary that needs it; prefer an OS/secret-manager backed signer.
- Do not pass secret values as command-line arguments; process lists and shell history can expose them.
- Reports must include variable *names* only when necessary, never values.
- Do not upload wallet files, keystores, Termux backups, `.env`, or private-key files.

## 3. Test separation

The Termux runner in this repository performs local validation and optional read-only network health checks. It intentionally does not load signing secrets. Contract deployment and value-bearing transactions remain separate manually approved procedures with dedicated Testnet-only signers, explicit allowlists, and transaction readback.

## 4. Evidence status

This note records a path-level triage signal, not a confirmed credential disclosure. A maintainer must classify each flagged file and document whether it is a placeholder, public key, test fixture, or secret. If exposure is confirmed, rotate first; deleting a file from the latest commit alone does not invalidate credentials or erase prior Git history.
