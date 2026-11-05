# End-to-End Factory, Oracle, Liquidity and Settlement Flows

## 1. Factory and RAW evidence

```mermaid
flowchart TD
  M[Merchant / Asset issuer] --> E[Evidence capture]
  D[Provisioned device] -->|signed nonce challenge| E
  E --> V[Signature, key, legal and schema verification]
  V -->|valid| R[RAW immutable evidence envelope]
  V -->|invalid| X[Reject / dispute]
  R --> T[Approved template selection]
  T --> G[Governance and quota gate]
  G --> F[Deterministic contract factory]
  F --> C[Deploy + initialize child]
  C --> I[Registry write + code hash + read-back]
  I --> A[ACTIVE]
  I -->|mismatch| P[PAUSED / FAILED]
```

## 2. Price and utility flow

```mermaid
flowchart LR
  CEX[CEX order books] --> O[External observations]
  DEX[DEX pools] --> O
  CH[Chainlink / external feeds] --> O
  M[Merchant price and capacity] --> U[Internal utility inputs]
  REV[Collected revenue / costs / reserves] --> U
  RAW[Asset attestations] --> U
  O --> Q[Typed quote validation]
  U --> P[Governed policy engine]
  Q --> P
  P --> F[Conversion firewall]
  F --> S[Permitted settlement]
  F -->|stale / no quorum / no backing| B[BLOCKED]
```

## 3. Settlement lifecycle

```mermaid
sequenceDiagram
  participant M as Merchant
  participant C as Checkout
  participant O as Oracle/Quote
  participant S as Settlement
  participant N as Network
  participant R as Reconciliation
  M->>C: merchant terms and invoice
  C->>O: validate quote type, expiry and policy
  O-->>C: quote evidence
  C->>S: payment intent (atomic amount, idempotency key)
  S->>S: auth, limits, replay and balance checks
  S->>N: submit authorized transaction
  N-->>S: transaction result
  S->>N: read-back transaction and event
  N-->>R: confirmed event and state
  R-->>M: final receipt or reconciliation exception
```

## 4. Governance-controlled feature lifecycle

```mermaid
stateDiagram-v2
  [*] --> IDEA
  IDEA --> SPEC_REVIEW
  SPEC_REVIEW --> SECURITY_REVIEW
  SECURITY_REVIEW --> IMPLEMENTATION
  IMPLEMENTATION --> CI_VALIDATION
  CI_VALIDATION --> TESTNET_REVIEW
  TESTNET_REVIEW --> RELEASE_APPROVAL
  RELEASE_APPROVAL --> RELEASED
  CI_VALIDATION --> CHANGES_REQUIRED
  SECURITY_REVIEW --> REJECTED
  TESTNET_REVIEW --> CHANGES_REQUIRED
  CHANGES_REQUIRED --> IMPLEMENTATION
  RELEASED --> MONITORING
  MONITORING --> PAUSED
  PAUSED --> REMEDIATION
  REMEDIATION --> TESTNET_REVIEW
```
