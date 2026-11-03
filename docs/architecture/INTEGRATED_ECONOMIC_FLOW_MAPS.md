# Integrated Economic Flow Maps

All diagrams describe the proposed reference architecture. They do not assert live Pi Network capabilities.

## A. End-to-end settlement sequence

```mermaid
sequenceDiagram
  actor P as Pioneer / Merchant
  participant UI as Unity Sphere
  participant API as API Gateway
  participant ID as Identity Policy
  participant OR as Oracle & Provenance
  participant EE as Economic Engine
  participant SC as Soroban Contract
  participant L as Configured Ledger
  P->>UI: Create payment / claim intent
  UI->>API: Typed request + idempotency key
  API->>ID: Authenticate and authorize
  ID-->>API: Scoped decision
  API->>OR: Resolve asset, network, price evidence
  OR-->>API: Quorum result + evidence hash
  API->>EE: Evaluate policy, caps, fees, liquidity
  EE-->>API: Quote / reject with reason
  API->>SC: Authorized state transition
  SC->>L: Submit supported transaction
  L-->>SC: Finality / ledger result
  SC-->>API: Event + transaction reference
  API->>API: Read-back and reconcile
  API-->>UI: Status with evidence and freshness
  UI-->>P: Final status; no optimistic success
```

## B. Economic period close

```mermaid
flowchart TD
  A[Close period] --> B[Reconcile collected revenue]
  B --> C[Deduct operating costs and obligations]
  C --> D[Reserve and contingency coverage]
  D --> E{All evidence complete and surplus positive?}
  E -->|No| H[HOLD / carry deficit / investigate]
  E -->|Yes| F[Calculate liquidity factor]
  F --> G[Compute eligible contribution weights]
  G --> I[Apply caps and deterministic integer allocation]
  I --> J[Independent approval / multisig]
  J --> K[Execute settlement]
  K --> L[Read-back balances and emit audit report]
```

## C. Dual value domains

```mermaid
flowchart TB
  subgraph External["External market domain"]
    X1[Venue quotes] --> X2[Market depth / volume / freshness]
    X2 --> X3[Median + outlier rejection]
  end
  subgraph Internal["Internal policy domain"]
    I1[Reference schedule] --> I2[Scope / version / effective date]
    I2 --> I3[Utility pricing rules]
  end
  X3 --> F[Conversion firewall]
  I3 --> F
  F --> C[Eligibility + caps + fees + haircut]
  C --> S[Authorized quote or explicit rejection]
  S --> R[Settlement + reconciliation]
```

## D. Mint/burn/lock decision tree

```mermaid
flowchart TD
  A[Requested supply operation] --> B{Asset issuer and network identified?}
  B -->|No| X[Reject]
  B -->|Yes| C{Operation supported by asset contract?}
  C -->|No| X
  C -->|Yes| D{Caller authorized and cap satisfied?}
  D -->|No| X
  D -->|Yes| E{Backing / liability / policy evidence valid?}
  E -->|No| X
  E -->|Yes| F[Execute with checked atomic units]
  F --> G[Emit immutable event]
  G --> H[Read-back total supply and reconcile]
```

## E. Economic scale loop (utility-led, not supply-led)

```mermaid
flowchart LR
  U[Useful services and merchant demand] --> V[Verified usage]
  V --> R[Collected revenue]
  R --> O[Costs / reserves / obligations]
  O --> S[Risk-adjusted surplus]
  S --> A[Fair and capped allocation]
  A --> I[Reinvestment in utility and infrastructure]
  I --> U
  Q[Liquidity, concentration, oracle and compliance limits] -. constrain .-> S
```

## F. Cross-repository ownership

```mermaid
flowchart TB
  P[PiRC: normative specs, schemas, economics] -->|versioned contract| C[SmartContracts: Soroban execution]
  P -->|versioned API and evidence contract| A[Unity Sphere: UI, APIs, adapters]
  C -->|events / state / transaction refs| A
  A -->|observations, usage and reconciliation evidence| P
  A -->|authorized invocation only| C
```

## Review checklist

- Every arrow has an authenticated interface and version.
- No UI-only state is treated as ledger truth.
- Oracle values include source, timestamp, confidence, network and asset identity.
- Contract state changes are idempotent and emit events.
- Read-back is performed before a transaction is shown as final.
- Errors distinguish rejected policy, unsupported capability, RPC failure, timeout and unknown finality.
