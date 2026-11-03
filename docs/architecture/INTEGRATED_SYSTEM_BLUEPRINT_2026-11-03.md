# Integrated System Blueprint — 2026-11-03

**Status:** Proposed engineering baseline for review. Not an official Pi Network specification, deployment attestation, banking authorization, reserve audit, or price commitment.

## Repository ownership

| Repository | Authoritative responsibility | Does not establish |
|---|---|---|
| PiRC | Normative proposals, economics, schemas, governance, architecture and acceptance criteria | Pi Core Team policy or deployed behavior |
| SmartContracts | Soroban/Rust ABI, storage, authorization, events, contract tests and build artifacts | Network deployment or independent audit |
| Unity Sphere | UI, APIs, network adapters, indexing, monitoring and operational evidence | Chain truth from client state or simulated markets |

PiRC defines requirements; SmartContracts implements contract behavior; Unity Sphere consumes versioned interfaces. Cross-repository changes pin exact refs and schema versions.

## Logical architecture

```mermaid
flowchart TB
  subgraph P["PiRC — normative control plane"]
    SPEC["Versioned standards and ADRs"]
    SCHEMA["Schemas, registries and golden vectors"]
    ECON["Economic model and risk policy"]
    GATES["Acceptance and release evidence"]
  end
  subgraph C["SmartContracts — execution plane"]
    ABI["Soroban ABI and contract specs"]
    AUTH["Authorization and policy"]
    STATE["Persistent state and invariants"]
    EVENTS["Events, digests and readback"]
  end
  subgraph U["Unity Sphere — application plane"]
    UI["Web UI and operator console"]
    API["API validation and orchestration"]
    ADAPTER["Network and RPC adapters"]
    OBS["Indexing, reconciliation and monitoring"]
  end
  SPEC --> ABI
  SCHEMA --> API
  SCHEMA --> ABI
  ECON --> AUTH
  GATES --> OBS
  UI --> API --> ADAPTER --> AUTH
  AUTH --> STATE --> EVENTS --> OBS
  OBS -. evidence .-> GATES
```

## Trust boundaries

1. Browser input is untrusted. The client cannot authoritatively set revenue, reserves, eligibility, distributable amounts, payment completion or transaction finality.
2. API validates schema, authentication, idempotency, amount/asset/network allowlists and policy version.
3. Accounting inputs come from reconciled server-side records. Oracle observations require source identity, units, timestamp, sequence, signature and freshness.
4. Contracts independently enforce authorization and state invariants.
5. Signers/relayers are isolated from browsers and general workers. No private key or seed phrase belongs in source or client bundles.
6. Finality requires network-specific transaction status plus contract readback.
7. Monitoring captures correlation IDs without secrets or unnecessary personal data.

## Seven colored proposal layers and shared technical planes

The seven colors are proposal taxonomy/UI semantics, not protocol layers, token classes, prices or official Pi Network categories. The Gold/Indigo conflict remains unresolved until a versioned registry migration is approved. Identity, payments, asset registry, treasury, PiDEX, economic engine, oracle, governance, monitoring and release evidence are shared technical planes, not additional tokens.

## Economic invariants

All monetary values use integer atomic units and an explicit asset ID/scale. Floating-point arithmetic is prohibited for settlement.

For collected revenue G and approved deductions O, T, R, C and Q:

`U = G - (O + T + R + C + Q)`

Require non-negative inputs, checked arithmetic and U >= 0. Underfunded periods fail with a typed error; they are never silently clamped to zero. For allocations a_i, require sum(a_i) = U, deterministic remainder tie-breaks, duplicate rejection and no state mutation on rejected operations.

Market price, internal reference, merchant quote, collateral valuation and legally redeemable cash are distinct. The ratio 314159 / 0.0314159 = 10^7 is arithmetic only; it creates no conversion right, peg, liquidity or redemption obligation.

## End-to-end settlement

```mermaid
sequenceDiagram
  autonumber
  actor User
  participant UI as Unity UI
  participant API as API and Policy
  participant Ledger as Reconciled Ledger
  participant Contract as Soroban Contract
  participant RPC as Network RPC
  participant Evidence as Evidence Store
  User->>UI: Create settlement request
  UI->>API: Request plus idempotency key
  API->>API: Authenticate and validate
  API->>Ledger: Resolve collected funds and obligations
  Ledger-->>API: Inputs with provenance
  API->>Contract: Authorized transaction
  Contract->>Contract: Roles, bounds, replay and invariants
  Contract-->>RPC: State transition and event
  RPC-->>API: Final transaction status
  API->>Contract: Read back state
  Contract-->>API: Canonical state and digest
  API->>Evidence: Persist tx, code hash, schema and readback
  Evidence-->>UI: Evidence state and timestamp
```

A failed or ambiguous RPC response remains pending/unknown until reconciled. Never retry a non-idempotent payment blindly.

## Evidence lifecycle

```mermaid
stateDiagram-v2
  [*] --> PROPOSED
  PROPOSED --> SPECIFIED: versioned requirement
  SPECIFIED --> IMPLEMENTED: reviewed source
  IMPLEMENTED --> TESTED: required tests pass
  TESTED --> CI_VERIFIED: exact commit CI green
  CI_VERIFIED --> TESTNET_VERIFIED: tx, finality and readback
  TESTNET_VERIFIED --> AUDITED: independent report
  AUDITED --> MAINNET_VERIFIED: approved deploy and readback
  PROPOSED --> REJECTED
  SPECIFIED --> BLOCKED
  IMPLEMENTED --> BLOCKED
```

No status is inferred from a README, branch name, source file or queued CI run.

## Deployment and release evidence

The Vite frontend can be hosted as a static Netlify site. The existing catch-all API entry follows Vercel conventions and is not automatically a Netlify Function. Until a tested API origin or Netlify Functions adapter exists, Netlify is frontend-only and API paths fail closed.

Each release records immutable repo SHAs, schema versions, exact CI runs, toolchain/lockfile versions, ABI and WASM hashes, threat model, reviewer, Testnet network/tx/finality/readback, rollback plan and known limitations.

## Explicit claims boundary

This blueprint does not claim Pi Core Team endorsement, official Pi Cash/Pi Bank products, GCV pricing, USD peg, OUSD backing, live exchange, redeemable reserves, deployed contracts, Pi Mainnet integration or audited security.
