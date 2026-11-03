# Cross-Repository Sequence and Data Flows

**Status:** Proposed integration contract; see the Integrated System Blueprint.

## Oracle observation

```mermaid
flowchart LR
  SRC["Independent source"] --> AD["Source adapter"]
  AD --> SIG["Signature and identity check"]
  SIG --> TIME["Timestamp, sequence and freshness"]
  TIME --> UNIT["Unit normalization"]
  UNIT --> OUT["Outlier and deviation policy"]
  OUT --> QUORUM["Independent quorum"]
  QUORUM --> RESULT["Canonical signed observation"]
  RESULT --> VERIFY["Consumer verification"]
  VERIFY --> STORE["Evidence and audit event"]
```

One authenticated reporter observation is not a decentralized oracle quorum. A proof hash is not proof verification unless the proof system and verifier are implemented and tested.

## Reserve attestation

```mermaid
flowchart TD
  CUST["Custodian statements"] --> AUD["Independent auditor"]
  AUD --> REPORT["Signed scoped attestation"]
  REPORT --> HASH["Canonical report hash"]
  HASH --> REG["Attestation registry"]
  REG --> POLICY["Freshness, scope and exception policy"]
  POLICY --> UI["Evidence state"]
  NOTE["Not proof of custody or redemption"] -.-> UI
```

## Provenance and reconciliation

```mermaid
flowchart TD
  LEDGER["Ledger balance and operations"] --> CLASS["Classify with source evidence"]
  CLASS --> MINE["Mined / protocol-origin evidence"]
  CLASS --> EXT["External / purchased / bridge evidence"]
  CLASS --> UNK["Unknown or disputed"]
  MINE --> REC["Reconciliation"]
  EXT --> REC
  UNK --> REC
  REC --> DELTA["Unexplained delta"]
  DELTA --> CASE["Investigation and reviewer"]
```

Never infer provenance from address shape, missing memo, exchange label or transaction pattern alone. Unknown/disputed amounts remain explicitly unclassified.

## Event and readback reconciliation

```mermaid
sequenceDiagram
  participant App as Application
  participant RPC as Soroban RPC
  participant Contract as Contract
  participant Indexer as Event Indexer
  App->>RPC: Submit signed transaction
  RPC-->>App: Hash and pending status
  RPC->>Contract: Execute
  Contract-->>RPC: Result and events
  RPC-->>App: Final transaction status
  Indexer->>RPC: Fetch event and ledger metadata
  Indexer->>Contract: Read period and allocation
  Indexer->>Indexer: Compare event, state, asset and digest
  Indexer-->>App: Evidence or explicit mismatch
```

No UI status may be promoted to SETTLED until finality and readback reconciliation succeed.
