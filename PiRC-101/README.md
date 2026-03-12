# PiRC-101: Sovereign Monetary Standard Framework

This repository documents the PiRC-101 economic control framework and its reference implementation. It defines a reflexive monetary controller designed to stabilize the Pi Network ecosystem through algorithmic credit expansion and utility gating.

## 💎 Core Valuation & The Sovereign Multiplier

The economic design of PiRC-101 is anchored by the **QWF (Quantum Wealth Factor / Sovereign Multiplier)**. 

* **QWF Definition:** A governance-controlled economic multiplier. It is not static; it is dynamically adjusted through protocol governance proposals based on network velocity, Total Value Locked (TVL), and macro-economic indicators.
* **Current Base Value:** `10,000,000` (10^7)
* **Internal Purchasing Power Reference (IPPR):** ~$2,248,000 USD per 1 mined Pi within the PiRC-101 economic framework. 

*Note: The IPPR represents a mathematically backed internal credit valuation for merchants and ecosystem settlement, completely distinct from external exchange market pricing.*

## ⚙️ Justice Engine Architecture

The "Justice Engine" acts as the algorithmic core of the protocol, isolating internal ecosystem solvency from external market volatility. Its architecture is structured as follows:

```text
Justice Engine
│
├── Oracle Layer (Market Data Input & Desync Protection)
├── Multiplier Engine (Dynamic QWF Logic & WCF Gating)
├── Credit Issuance Controller (Phi Φ Reflexive Guardrail)
└── Settlement Ledger Interface (Merchant/User Balances)

## ⚙️ Execution Environment & Architecture Note
**Important implementation clarification:** Pi Network utilizes a Stellar-based consensus architecture and does not natively execute Ethereum Virtual Machine (EVM) bytecode. 

The Solidity implementation (`PiRC101Vault.sol`) and the `ethers.js` integration guides provided in this repository serve as a **Conceptual EVM Reference Model**. They are designed to strictly define the economic state machine, the mathematical invariants ($R, S, L, \Psi$), and the Justice Engine's execution flow in a widely understood, Turing-complete language.

A production-ready Mainnet deployment of PiRC-101 would require either:
1. **Native Pi Execution:** Translating the state transition logic into Soroban (Rust), Stellar's native smart contract environment.
2. **Layer-2 Execution:** Deployment on an explicitly defined EVM-compatible sidechain anchored to the Pi Network.

