# PiRC Ecosystem Threat Model & Security Standards

## 1. Trust Boundaries
- **Smart Contracts (Soroban):** High-risk boundary. Must strictly validate caller authentication constraints.
- **Oracle Feeds:** Medium-risk boundary. Must utilize circuit breakers to prevent flash loan anomalies.
- **DID Registry (PiRC-800):** High-privacy boundary. ZK-proofs must avoid leakage of Personally Identifiable Information (PII).

## 2. Attack Vectors & Mitigations
| Threat | Mitigation | Implementation Location |
| :--- | :--- | :--- |
| Sybil Attacks | PiRC-800 ZK Reputation | `contracts/did` |
| Oracle Manipulation | Circuit Breakers & VWAP | `contracts/rwa_toolkit` |
| Quantum Decryption | Shor-resistant Algorithms | `research/quantum-migration` |

## 3. Audit Protocol
Before any PiRC draft moves from `Draft` to `Stable`, it must pass:
1. Static analysis (Cargo clippy / Slither equivalents).
2. Minimum 80% unit test coverage.
3. Multi-signature peer review.
