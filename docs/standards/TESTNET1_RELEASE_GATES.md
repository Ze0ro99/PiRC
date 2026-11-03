# Testnet1 Release Gates and Mainnet Readiness

**Current release target:** Pi Testnet (Testnet1 project profile).  
**Mainnet writes:** Prohibited until separately approved.

## Gate A — source integrity

- reviewed branch diff and dependency changes;
- pinned canonical standards and source commit SHAs;
- no committed secrets or private signing material;
- reproducible build inputs and artifact hashes.

## Gate B — static and unit tests

- formatting, lint, type checks and compile;
- deterministic unit and property tests;
- integer overflow, authorization, replay and state-machine tests;
- dependency, secret, SAST and license scans.

## Gate C — Testnet integration

- verify Horizon/Soroban endpoints and exact network passphrase;
- confirm protocol version and SDK compatibility;
- deploy only explicit allowlisted contracts;
- read back contract IDs, code/WASM hashes and initialized state;
- run QR/NFC, payment, subscription, token launchpad, event indexer and agent-policy scenarios;
- record transaction hashes and test reports.

## Gate D — resilience and security

- load and latency tests (p50/p95/p99);
- RPC outage, indexer lag, retries and queue backpressure;
- fuzzing and adversarial contract tests;
- independent security review and remediation evidence;
- incident response and rollback rehearsal.

## Gate E — maintainer review

- Pi Core Team or authorized maintainers' written acceptance where required;
- canonical PiRC proposal status and accepted changes;
- approved contract interfaces and deployment parameters;
- explicit approval to prepare a separate Mainnet release.

## Mainnet release remains a separate process

Passing Testnet does not authorize Mainnet deployment. Mainnet requires separate keys, signer ceremony, environment, allowlists, audit, monitoring, rollback, legal/compliance review where applicable, and explicit release approval. No automated pipeline may promote Testnet artifacts to Mainnet without a human-controlled release gate.
