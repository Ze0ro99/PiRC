# Unified Contract, API, and Unity Sphere Interface Specification

**Status:** Proposed versioned interface contract. The schemas in this repository are normative proposals; runtime and Soroban ABI compatibility must be demonstrated by generated-spec comparison and integration tests.

## 1. Ownership and compatibility

- **PiRC:** owns semantic requirements, schema IDs, version policy, error taxonomy, and conformance vectors.
- **SmartContracts:** owns Soroban/Rust contract functions, storage layout, authorization, events, and contract tests.
- **Unity Sphere:** owns HTTP handlers, adapters, UI workflows, request validation, and user-visible state.
- **Oracle adapter:** supplies signed, versioned observations; it cannot bypass contract authorization.
- **Asset registry:** supplies provenance and verification state; an unknown or disputed asset cannot silently become eligible.

A feature is integrated only when the PiRC schema version, generated Soroban spec, API request/response, Unity Sphere adapter, and test evidence identify the same interface revision.

## 2. Common envelope

Requests and responses should carry the following fields where applicable:

- `schema`: stable schema identifier
- `version`: semantic interface version
- `request_id`: caller-generated idempotency key
- `network_id`: explicit network profile, such as a named test network
- `asset_id`: canonical asset identifier; never infer from display name
- `amount_atomic`: base-10 integer string in the asset's atomic unit
- `provenance_ref`: immutable reference to the asset provenance record
- `oracle_feed_id` and `oracle_policy_version`: only for operations requiring a price observation
- `created_at`, `expires_at`: RFC 3339 timestamps for bounded intents
- `evidence_ref`: traceable test, ledger readback, or signed evidence pointer

Unknown critical fields must be rejected. Additive optional fields may be accepted only under the registered compatibility policy. A schema pass never substitutes for authorization, signature verification, replay prevention, or ledger readback.

## 3. Economic settlement boundary

A settlement request must reference a reconciled accounting period and provide atomic-unit amounts. The service recomputes deductions and distributable resources from trusted accounting records; it must not trust a caller-supplied `distributable` value as authoritative. The settlement schema is a result/evidence envelope, not an authorization token.

Required gates before settlement:
1. Revenue is collected and reconciled in the declared asset.
2. Senior costs, taxes, due liabilities, refunds, reserve replenishment, and prior commitments are recorded.
3. Asset provenance and network identity are valid for the intended operation.
4. Participant eligibility and contribution weights are resolved by an authorized policy.
5. Oracle-dependent calculations use a fresh quorum-backed observation.
6. Contract authorization and replay protection pass.
7. The deterministic allocation conserves every atomic unit.
8. The resulting state is read back from the target network before claiming testnet verification.

## 4. Error taxonomy

Use stable machine-readable codes, with safe human-readable details:

- `SCHEMA_INVALID`
- `UNSUPPORTED_VERSION`
- `NETWORK_MISMATCH`
- `ASSET_UNVERIFIED`
- `PROVENANCE_DISPUTED`
- `ORACLE_STALE`
- `ORACLE_QUORUM_UNAVAILABLE`
- `SIGNATURE_INVALID`
- `SEQUENCE_REPLAYED`
- `UNAUTHORIZED`
- `PERIOD_UNRECONCILED`
- `INSUFFICIENT_DISTRIBUTABLE_RESOURCES`
- `ALLOCATION_INVARIANT_FAILED`
- `IDEMPOTENCY_CONFLICT`
- `NETWORK_SUBMISSION_FAILED`
- `READBACK_UNVERIFIED`

Errors must not expose secrets, private keys, seed phrases, or sensitive identity data.

## 5. Soroban ABI and generated interface checks

For each contract interface, record repository, immutable commit SHA, crate path, generated contract spec hash, function signatures, argument/result types, authorization requirements, storage version, and emitted event names. CI should generate the Soroban spec from the pinned contract source and compare it with the registered manifest. A hand-written ABI table or a Rust file's presence is not proof of compatibility.

Do not claim that Pi protocol version labels imply Soroban compatibility. Pin and test the actual SDK, network profile, RPC endpoint, contract spec, and deployment/readback evidence. Pi Testnet1 is a named target only after its supported network details and endpoint are independently verified.

## 6. Unity Sphere adapter requirements

- Validate schema and version at ingress and egress.
- Use integer strings for monetary values; convert to display decimals only in presentation code.
- Propagate request IDs and idempotency keys through retries.
- Keep UI states distinct: proposed, simulated, submitted, confirmed, readback-verified, failed, and unknown.
- Never label simulated prices, reserves, TVL, OUSD, or contract results as live.
- Persist source refs and rejection reasons for oracle/provenance failures.
- Avoid repeated full-workspace builds for docs-only changes; run targeted schema, unit, contract, API, and UI checks when their paths change.

## 7. Required conformance evidence

A feature evidence record must link the exact PiRC schema/spec revision, SmartContracts commit and tests, Unity Sphere commit and API/UI tests, network profile, and any transaction/contract readback. Fields without evidence remain null or explicitly unverified. Do not fabricate contract IDs, transaction hashes, package hashes, or compatibility claims.
