# PiRC-101: Sovereign Monetary Standard Framework

The official repository for the **PiRC-101 protocol**, a reflexive monetary controller designed to stabilize the Pi Network ecosystem through algorithmic credit expansion.

## 💎 Core Valuation
The system utilizes a **Sovereign Multiplier (QWF)** of $10^7$ to protect Pioneer effort. 
- **Current Internal Power:** ~$2,248,000 USD per 1 Mined Pi.
- **Mechanism:** The Justice Engine.

## 🛠 Project Components
- **`/contracts`**: Solidity/Soroban smart contracts for the Core Vault.
- **`/simulator`**: Python & JS tools for stress-testing economic stability.
- **`/security`**: Threat models and risk mitigation strategies.
- **`/docs`**: Formal technical standards and integration guides.

## 🚀 Roadmap
1. [x] Architectural Design & Justice Engine Logic.
2. [x] Live Oracle Dashboard & USD-Equivalent Visualization.
3. [ ] Soroban (Rust) Porting & Optimization.
4. [ ] Global Merchant Pilot Program.

**The future is sovereign. Join the revolution.**

## ⚙️ Execution Environment & Architecture Note
**Important implementation clarification:** Pi Network utilizes a Stellar-based consensus architecture and does not natively execute Ethereum Virtual Machine (EVM) bytecode. 

The Solidity implementation (`PiRC101Vault.sol`) and the `ethers.js` integration guides provided in this repository serve as a **Conceptual EVM Reference Model**. They are designed to strictly define the economic state machine, the mathematical invariants ($R, S, L, \Psi$), and the Justice Engine's execution flow in a widely understood, Turing-complete language.

A production-ready Mainnet deployment of PiRC-101 would require either:
1. **Native Pi Execution:** Translating the state transition logic into Soroban (Rust), Stellar's native smart contract environment.
2. **Layer-2 Execution:** Deployment on an explicitly defined EVM-compatible sidechain anchored to the Pi Network.

