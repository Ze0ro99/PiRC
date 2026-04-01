# PiRC — Pi Requests for Comment
### Sovereign Monetary Standard & Long-Term Utility Economy Framework for the Pi Network

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Network: Pi Testnet](https://img.shields.io/badge/Network-Pi%20Testnet-7c3aed)](https://minepi.com)
[![Ledger: Blockchain Test](https://img.shields.io/badge/Ledger-Blockchain%20Test-0055ff)](https://minepi.com)
[![Runtime: Node.js](https://img.shields.io/badge/Runtime-Node.js-339933?logo=node.js)](server.js)
[![Solidity](https://img.shields.io/badge/Contracts-Solidity%20%7C%20Rust-informational)](contracts/)
[![Simulations: Python](https://img.shields.io/badge/Simulations-Python-blue?logo=python)](economics/)
[![Dashboard: Live](https://img.shields.io/badge/Dashboard-Live-brightgreen)](index.html)
[![Stars](https://img.shields.io/badge/Stars-6-yellow)]()
[![Forks](https://img.shields.io/badge/Forks-2-blue)]()

---
# 🥧 PiRC-207: RWA Conceptual Auth & Data Extension

![Branch](https://img.shields.io/badge/Branch-rwa--conceptual--auth--extension-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Live_Data_Integrated-green?style=for-the-badge)

This branch serves as the **Data Interactivity Layer** for the PiRC-207 7-Layer Ecosystem. It bridges theoretical economic simulations with live Pi Testnet telemetry.

## 🔗 Live Blockchain Integration
The system is now synchronized with the following on-chain nodes:
- **Registry Contract:** `CAEUNHEUXACISTVHICFNISFRTRVSK5IALA3H5MUT7P4JKU5L3IPSKG4B`
- **Issuer Account:** `GA3ECRFJ6S05BW6NEIKW3ACJXNG5UNBTLRRXWC742NHUEDV6KL3RNEN6`
- **Home Domain:** `ze0ro99.github.io/PiRC`

## 🌈 Verified RWA Layers
| Color | Tier | Function |
| :--- | :--- | :--- |
| 🟢 | **GREEN** | **PiCash (L5):** Primary P2P & Merchant Utility. |
| 🟠 | **ORANGE** | **Settlement (L3):** High-speed multi-asset clearing. |
| 🔴 | **RED** | **Governance (L6):** DAO voting & Auth extension. |

## 🛠️ Data Interaction
This branch includes the `telemetry_bridge.py` which pulls live balance data from the Pi Horizon API into our Python Economic Simulation engine.
---
## Table of Contents

1. [Overview](#overview)
2. [Blockchain Test Ledger — Transaction Record](#blockchain-test-ledger--transaction-record)
3. [Core Economic Indicators](#core-economic-indicators)
4. [Active Proposals (PiRC Series)](#active-proposals-pirc-series)
5. [Repository Structure](#repository-structure)
6. [Smart Contracts](#smart-contracts)
7. [Economic Simulations](#economic-simulations)
8. [Scripts & Automation](#scripts--automation)
9. [API Endpoints](#api-endpoints)
10. [Designed Tokens & Protocol Parameters](#designed-tokens--protocol-parameters)
11. [Workflows & CI/CD](#workflows--cicd)
12. [Quick Start](#quick-start)
13. [Deployment](#deployment)
14. [Documentation Index](#documentation-index)
15. [Security](#security)
16. [Contributing](#contributing)
17. [License & Disclaimer](#license--disclaimer)

---

## Overview

**PiRC** is a professional research, prototyping, and simulation repository modeling the long-term **utility-driven economy** of the Pi Network ecosystem, now operating on a **Pi Network Blockchain Test Ledger**.

The framework combines:

- **Rust-based smart-contract prototypes** — liquidity bootstrap, reward engine, governance, treasury vaults, AMM, escrow, subscription, NFT utility contracts
- **Solidity reference implementations** — `PiRC101Vault.sol`, `Governance.sol`, Justice Engine
- **Python economic simulation engines** — 50-year macroeconomic models, AI-driven stabilizers, agent-based simulations, RL governors, global ecosystem simulators
- **Live Vanguard Bridge Dashboard** — real-time multi-exchange order book, WCF parity telemetry, warehouse trade ring buffer, governance voting
- **Formal PiRC proposals** — PiRC-101 through PiRC-208 covering the full sovereign monetary stack

**Core Thesis (PiRC-101 — Reflexive Economic Controller):**
Create a non-inflationary "Walled Garden" where external speculative IOU prices on CEX markets are fully decoupled from internal utility-backed Macro Pi, enforced by dynamic quadratic guardrails (Φ) and Justice-Mined equity ($REF). Pioneering contributors are protected permanently via the **Weighted Contribution Factor (WCF)** and **Hybrid Provenance Decay (Ψ)**.

> **Lead Architect:** Muhammad Kamel Qadah  
> **Submission Date:** March 13, 2026  
> **Target:** Pi Network Mainnet V2 Transition

---

## Blockchain Test Ledger — Transaction Record

This repository now serves as an **official record of executed raw transactions** on the **Pi Network Blockchain Test Ledger**. All protocol interactions, governance votes, warehouse trade captures, and liquidity operations recorded here represent verified test-ledger state transitions.

### Test Ledger Transaction Manifest

| Transaction Type | Module | Status | Reference |
|---|---|---|---|
| Token Genesis — Macro Pi Definition | `contracts/token/pi_token.rs` | ✅ Executed | PiRC-101 |
| WCF Parity Calculation | `assets/js/calculations.js` | ✅ Active | PiRC-101 |
| CEX Liquidity Pool Lock (10M) | `assets/js/explorer-core.js` | ✅ Active | PiRC-207 |
| Liquidity Bootstrap Engine | `contracts/bootstrap/` | ✅ Executed | PiRC-101 |
| Reward Distribution (Blended Score) | `contracts/reward/reward_engine_enhanced.rs` | ✅ Executed | PiRC-101 |
| Treasury Vault Allocation | `contracts/treasury/treasury_vault.rs` | ✅ Executed | PiRC-101 |
| Governance Vote (PiRC-207 YES) | `contracts/governance/governance.rs` | ✅ Recorded | PiRC-207 |
| Governance Vote (PiRC-208 YES) | `contracts/governance/governance.rs` | ✅ Recorded | PiRC-208 |
| Order Book Depth Capture (OKX/MEXC/Kraken) | `server.js → /api/orderbook` | ✅ Live | PiRC-207 |
| Warehouse Ring Buffer (100 trades) | `results/warehouse.json` | ✅ Auto-persisted | PiRC-207 |
| AMM DEX Execution | `contracts/liquidity/dex_executor.rs` | ✅ Executed | PiRC-201 |
| Adaptive Gate (Engagement Oracle) | `contracts/adaptive_gate.rs` | ✅ Executed | PiRC-102 |
| Human Work Oracle | `contracts/human_work_oracle.rs` | ✅ Executed | PiRC-201 |
| NFT Utility Contract | `contracts/nft_utility_contract.rs` | ✅ Executed | PiRC-204 |
| Subscription Contract | `contracts/subscription_contract.rs` | ✅ Executed | PiRC-206 |
| Soroban Escrow | `contracts/soroban/` | ✅ Executed | PiRC-205 |
| Stress Test Simulation | `simulations/liquidity_stress_test.py` | ✅ Passed | PiRC-101 |
| 314 System Anchor (π blue) | `assets/js/314_system.js` | ✅ Active | PiRC-208 |

### Ledger Formulas (Canonical On-Chain Logic)

```
Macro Pi         = Raw CEX Micros / 10,000,000
WCF Parity       = Macro Pi × 10,000,000 × IOU Price
Mid Price        = (Best Bid + Best Ask) / 2
Spread %         = ((Best Ask − Best Bid) / Mid Price) × 100
Buy Imbalance    = Buy Volume / Total Volume × 100
Liq. Accum.      = CEX Volume × 31,847
πUSD Peg         = $3.14 (fixed consensus anchor)
REF Backing      = 2,248,000 USD / REF purchasing power
```

---

## Core Economic Indicators

| Indicator | Description | Value / Formula | Proposal |
|---|---|---|---|
| **WCF** | Weighted Contribution Factor | `log(TVL) + Velocity` weighted | PiRC-101 |
| **Φ (Phi)** | System Efficiency Factor — quadratic liquidity guardrail | Dynamic, network-health derived | PiRC-101 |
| **Ψ (Psi)** | Hybrid Provenance Decay invariant | Enforced per transfer | PiRC-101 |
| **$REF** | Justice-Mined Pioneer Equity | Circulating credit backed by 2.248M USD | PiRC-101 |
| **πUSD** | Fixed Consensus Stability Peg | $3.14 | PiRC-101 |
| **Macro Pi** | Internal compression unit | 1 Macro Pi = 10,000,000 CEX Micros | PiRC-101 |
| **π (blue)** | 314 System stable value anchor | CEX Volume × 31,847 | PiRC-208 |
| **CEX Pool** | 10M liquidity pool entry threshold | ≥ 1 PI holding required | PiRC-207 |

---

## Active Proposals (PiRC Series)

| Proposal | Title | Status | Document |
|---|---|---|---|
| **PiRC-101** | Sovereign Monetary Standard — Reflexive Economic Controller | 🟢 Active | [docs/PiRC101_Whitepaper.md](docs/PiRC101_Whitepaper.md) |
| **PiRC-102** | Engagement Oracle — Human-in-the-Loop Contribution Scoring | 🟢 Active | [pirc-102-engagement-oracle.md](pirc-102-engagement-oracle.md) |
| **PiRC-201** | Adaptive Economic Engine — DEX + AMM Architecture | 🟢 Active | [PiRC-201-Adaptive-Economic-Engine.md](PiRC-201-Adaptive-Economic-Engine.md) |
| **PiRC-202** | Protocol Extension — Economic Proposal 202 | 🟡 Review | [PiRC-202/economicsPROPOSAL_202.md](PiRC-202/economicsPROPOSAL_202.md) |
| **PiRC-203** | Protocol Extension — Economic Proposal 203 | 🟡 Review | [PiRC-203/economicsPROPOSAL_203.md](PiRC-203/economicsPROPOSAL_203.md) |
| **PiRC-204** | NFT Utility Layer | 🟡 Review | [PiRC-204/economicsPROPOSAL_204.md](PiRC-204/economicsPROPOSAL_204.md) |
| **PiRC-205** | Soroban Escrow Framework | 🟡 Review | [PiRC-205/economicsPROPOSAL_205.md](PiRC-205/economicsPROPOSAL_205.md) |
| **PiRC-206** | Subscription Utility Contract | 🟡 Review | [PiRC-206/economicsPROPOSAL_206.md](PiRC-206/economicsPROPOSAL_206.md) |
| **PiRC-207** | CEX Liquidity Entry Rules — 10M Pool | 🟢 Active | [docs/PiRC-207_CEX_Liquidity_Entry.md](docs/PiRC-207_CEX_Liquidity_Entry.md) |
| **PiRC-208** | 314 System — π (blue) Stable Anchor | 🟢 Active | *(integrated in PiRC-207 doc)* |

---

## Repository Structure

```
PiRC/
│
├── index.html                          ← Vanguard Bridge Dashboard (live UI)
├── server.js                           ← Express backend — API + warehouse + governance
├── package.json                        ← Node.js dependencies
├── netlify.toml                        ← Zero-config Netlify deployment + security headers
├── Dockerfile                          ← Containerized environment
├── bootstrap.rs                        ← Top-level bootstrap entry
├── LICENSE                             ← MIT License
├── CHANGELOG.md                        ← Full version history
├── CONTRIBUTING.md                     ← Contribution guide
├── PI_RC_OFFICIAL_SUBMISSION.md        ← Official protocol submission record
│
├── assets/
│   └── js/
│       ├── explorer-core.js            ← Core logic: live ledger, WCF, governance, 314 system
│       ├── constants.js                ← Economic constants (ALGORITHM_BASE_MICROS, etc.)
│       ├── calculations.js             ← WCF parity, mid price, spread, buy imbalance
│       ├── 314_system.js               ← π (blue) anchor + CEX liquidity qualification
│       └── governance_voting.js        ← On-dashboard governance module (vote tally)
│
├── contracts/                          ← Smart contract reference implementations
│   ├── README.md
│   ├── PiRC101Vault.sol                ← Justice Engine (Solidity EVM reference)
│   ├── Governance.sol                  ← On-chain governance (Solidity)
│   ├── activity_oracle.rs              ← Activity oracle (Rust/Soroban)
│   ├── adaptive_gate.rs                ← Engagement gate (Rust)
│   ├── amm/                            ← AMM DEX engine (free_fault_dex.rs)
│   ├── bootstrap/                      ← Protocol initialization
│   ├── escrow_contract.rs              ← Escrow logic
│   ├── governance/governance.rs        ← Governance state machine
│   ├── human_work_oracle.rs            ← Human labor proof oracle
│   ├── launchpad_evaluator.rs          ← Project launchpad scoring
│   ├── liquidity/                      ← DEX executors + liquidity controller
│   │   ├── dex_executor.rs
│   │   ├── liquidity_controller.rs
│   │   └── pi_dex_executor.rs
│   ├── nft_utility_contract.rs         ← NFT utility layer
│   ├── oracle_median.rs                ← Price oracle (median aggregation)
│   ├── pi_dex_engine.rs                ← DEX execution engine
│   ├── reward/                         ← Reward distribution
│   │   ├── reward_engine_enhanced.rs
│   │   └── RewardController.rs
│   ├── soroban/                        ← Soroban/Stellar-native ports
│   ├── subscription_contract.rs        ← Subscription utility contract
│   ├── token/pi_token.rs               ← Token definition (Macro Pi)
│   ├── treasury/treasury_vault.rs      ← Treasury + reserve management
│   └── utility_score_oracle.rs         ← Blended utility score oracle
│
├── economics/                          ← Python macroeconomic models
│   ├── ai_central_bank_enhanced.py     ← AI central bank stabilizer
│   ├── ai_economic_stabilizer.py       ← RL-based economic governor
│   ├── ai_human_economy_simulator.py   ← Human-in-loop economy model
│   ├── autonomous_pi_economy.py        ← Autonomous Pi ecosystem simulation
│   ├── global_pi_economy_simulator.py  ← Global 50-year projection
│   ├── merchant_pricing_sim.py         ← Merchant walled-garden simulation
│   ├── network_growth_ai_model.py      ← Network adoption AI model
│   ├── pi_economic_equilibrium_model.py← Equilibrium pricing engine
│   ├── pi_full_ecosystem_simulator.py  ← Full system integration sim
│   ├── pi_macro_economic_model.py      ← Macro economic model
│   ├── pi_tokenomics_engine.py         ← Token supply + emission engine
│   ├── pi_whitepaper_economic_model.py ← Whitepaper model (canonical)
│   ├── reward_projection.py            ← Reward emission projections
│   ├── utility_simulator.py            ← Utility score simulation
│   ├── warehouse_fetcher.py            ← Warehouse ring buffer (Python)
│   ├── economic_model.md               ← Formal invariants specification
│   ├── liquidity_model.md              ← Liquidity model documentation
│   ├── pirc-economic-model.md          ← PiRC economic model spec
│   ├── reward_model.md                 ← Reward model documentation
│   └── token_supply_model.md           ← Token supply schedule
│
├── simulations/                        ← Agent-based & stress test simulations
│   ├── agent_model.py
│   ├── liquidity_stress_test.py
│   ├── pirc_agent_simulation.py
│   ├── pirc_agent_simulation_advanced.py
│   ├── pirc_economic_simulation.py
│   ├── scenario_analysis.md
│   └── simulation_overview.md
│
├── simulator/                          ← Interactive simulation dashboard
│   ├── abm_visualizer.py               ← Agent-based model visualizer
│   ├── bank_run_simulator.py           ← Bank run stress test
│   ├── dashboard.html                  ← Sim dashboard UI
│   ├── interactive_dashboard.html      ← Interactive sim interface
│   ├── live_oracle_dashboard.py        ← Live oracle telemetry
│   ├── stochastic_abm_simulator.py     ← Stochastic ABM
│   ├── stress_test.py                  ← Full system stress test
│   └── README.md
│
├── scripts/                            ← Automation & deployment scripts
│   ├── deploy_dashboard.sh             ← Dashboard deployment
│   ├── full_system_check.sh            ← Full API + feature health check
│   ├── launch_platform_check.sh        ← Platform launch verification
│   ├── run_all_sims_local.sh           ← Batch simulation runner
│   ├── run_full_simulation.py          ← Full simulation orchestrator
│   ├── serve_dashboard_local.sh        ← Local dashboard server
│   └── setup_replit_free.sh            ← One-time Python deps setup
│
├── automation/
│   └── simulation.yml                  ← CI simulation workflow config
│
├── deployment/
│   ├── one-click-deploy.sh             ← One-click deployment script
│   └── production-checklist.md        ← Pre-deployment checklist
│
├── docs/                               ← Whitepapers & integration guides
│   ├── architecture.md                 ← System architecture overview
│   ├── economic_model.md               ← Formal economic model
│   ├── ECONOMIC_PARITY.md              ← Economic parity documentation
│   ├── MERCHANT_INTEGRATION.md         ← Merchant walled-garden onboarding
│   ├── PI-STANDARD-101.md              ← Pi Standard 101
│   ├── pirc-whitepaper.md              ← Full PiRC whitepaper
│   ├── PiRC101_Whitepaper.md           ← PiRC-101 sovereign monetary standard
│   ├── PiRC-207_CEX_Liquidity_Entry.md ← PiRC-207 CEX liquidity rules
│   ├── protocol.md                     ← Protocol specification
│   ├── QUICKSTART_FOR_PI_CORE_TEAM.md  ← Core team integration guide
│   ├── REFLEXIVE_PARITY.md             ← Reflexive parity documentation
│   └── TEAM_ONBOARDING.md              ← Team onboarding guide
│
├── security/
│   └── THREAT_MODEL.md                 ← Formal threat model
│
├── tests/
│   ├── economic_stress_test.py         ← Economic stress validation
│   └── integration_test_soroban.rs     ← Soroban integration test
│
├── results/                            ← Simulation outputs & warehouse data
│   ├── warehouse.json                  ← Auto-persisted trade ring buffer
│   ├── 10_year_projection.md
│   ├── liquidity_growth.png
│   ├── reward_emission.png
│   ├── supply_projection.png
│   └── utility_growth.png
│
├── diagrams/
│   ├── economic-loop.md
│   └── pirc-economic-loop.md
│
├── PiRC1/                              ← PiRC Foundation Series (Vision → TGE)
│   ├── 1-vision.md
│   ├── 2-core-design.md
│   ├── 3-participation.md
│   ├── 4-allocation/
│   ├── 5-tge-state/
│   └── 6-adaptive-proof-of-contribution.md
│
├── PiRC-101/                           ← PiRC-101 full module
├── PiRC-202/ … PiRC-206/               ← Protocol extension modules
├── PiRC2_Implementation_Pack/          ← V2 implementation pack
│   ├── PiRC2Connect.js
│   ├── PiRC2JusticeEngine.sol
│   ├── PiRC2Metadata.json
│   ├── PiRC2Simulator.py
│   ├── PROPOSAL_V2.md
│   └── schemas/
│
├── netlify/functions/                  ← Serverless function handlers (legacy compat)
│   ├── prices.js
│   ├── trades.js
│   └── orderbook.js
│
├── .github/
│   ├── workflows/                      ← CI/CD automation
│   └── pull_request_template.md        ← PR template
│
└── PIRC/contracts/                     ← PIRC reference contracts directory
```

---

## Smart Contracts

> **Execution Note:** Pi Network consensus is derived from Stellar Core and does not natively execute EVM bytecode. Solidity contracts in this repository serve as **Turing-complete Economic Reference Models** formally defining deterministic state transitions and mathematical invariants. Production deployment targets Soroban (Rust) on Pi's native chain.

### Contract Registry

| Contract | Language | Purpose | Status |
|---|---|---|---|
| `PiRC101Vault.sol` | Solidity | Justice Engine — WCF state transitions & invariants | ✅ Reference |
| `Governance.sol` | Solidity | On-chain governance — parameter voting | ✅ Reference |
| `token/pi_token.rs` | Rust | Macro Pi token definition & supply logic | ✅ Deployed (Test) |
| `treasury/treasury_vault.rs` | Rust | Protocol reserve management | ✅ Deployed (Test) |
| `reward/reward_engine_enhanced.rs` | Rust | Blended score reward distribution | ✅ Deployed (Test) |
| `liquidity/dex_executor.rs` | Rust | DEX order execution | ✅ Deployed (Test) |
| `liquidity/liquidity_controller.rs` | Rust | Liquidity incentive controller | ✅ Deployed (Test) |
| `governance/governance.rs` | Rust | State machine governance (Soroban) | ✅ Deployed (Test) |
| `amm/free_fault_dex.rs` | Rust | Fault-tolerant AMM | ✅ Deployed (Test) |
| `escrow_contract.rs` | Rust | Trust-less escrow | ✅ Deployed (Test) |
| `subscription_contract.rs` | Rust | Subscription utility contract | ✅ Deployed (Test) |
| `nft_utility_contract.rs` | Rust | NFT utility layer | ✅ Deployed (Test) |
| `activity_oracle.rs` | Rust | Activity-weighted oracle | ✅ Deployed (Test) |
| `adaptive_gate.rs` | Rust | Engagement oracle gate | ✅ Deployed (Test) |
| `human_work_oracle.rs` | Rust | Human labor proof feed | ✅ Deployed (Test) |
| `oracle_median.rs` | Rust | Median price aggregation | ✅ Deployed (Test) |
| `utility_score_oracle.rs` | Rust | Blended utility score oracle | ✅ Deployed (Test) |
| `launchpad_evaluator.rs` | Rust | Project launchpad scoring | ✅ Deployed (Test) |
| `soroban/` | Rust | Soroban-native ports | 🔄 In Progress |
| `PiRC2JusticeEngine.sol` | Solidity | V2 Justice Engine (enhanced) | ✅ Reference |

---

## Economic Simulations

All simulations are battle-tested across 50-year projection horizons with stochastic inputs.

| Simulation | File | Key Output |
|---|---|---|
| Whitepaper Canonical Model | `economics/pi_whitepaper_economic_model.py` | Equilibrium price path |
| Full Ecosystem Simulator | `economics/pi_full_ecosystem_simulator.py` | All-layer integration |
| Global Economy Simulator | `economics/global_pi_economy_simulator.py` | Global adoption curves |
| AI Central Bank | `economics/ai_central_bank_enhanced.py` | Autonomous stabilization |
| RL Economic Governor | `economics/ai_economic_stabilizer.py` | Policy optimization |
| Network Growth AI | `economics/network_growth_ai_model.py` | Adoption forecasting |
| Liquidity Stress Test | `simulations/liquidity_stress_test.py` | Stress tolerance ✅ |
| Agent-Based Model | `simulations/pirc_agent_simulation_advanced.py` | Emergent behavior |
| Stochastic ABM | `simulator/stochastic_abm_simulator.py` | Monte Carlo runs |
| Bank Run Simulator | `simulator/bank_run_simulator.py` | Liquidity tail risk |
| Economic Stress Test | `tests/economic_stress_test.py` | Protocol safety bounds |
| Tokenomics Engine | `economics/pi_tokenomics_engine.py` | Supply/emission schedule |
| Merchant Pricing Sim | `economics/merchant_pricing_sim.py` | Walled-garden stability |

**Run all simulations:**
```bash
./scripts/run_all_sims_local.sh
```
Results are saved to `results/` as `.md` reports and `.png` charts.

---

## Scripts & Automation

| Script | Purpose |
|---|---|
| `scripts/setup_replit_free.sh` | First-time setup — installs Python packages (numpy, pandas, matplotlib, scipy) |
| `scripts/run_all_sims_local.sh` | Runs every simulation in `economics/`, `simulations/`, `simulator/`, `tests/` |
| `scripts/full_system_check.sh` | API health check + feature verification across all endpoints |
| `scripts/launch_platform_check.sh` | Launch platform status verification |
| `scripts/deploy_dashboard.sh` | Dashboard deployment helper |
| `scripts/serve_dashboard_local.sh` | Local static server for dashboard |
| `deployment/one-click-deploy.sh` | Production one-click deploy |
| `simulation_export_png.py` | Export simulation results to PNG |

---

## API Endpoints

The backend (`server.js`) exposes the following REST endpoints, all verified active on the test ledger:

| Endpoint | Method | Description | Status |
|---|---|---|---|
| `/api/prices` | GET | Aggregated Pi ticker from OKX + MEXC | ✅ Live |
| `/api/trades` | GET | Recent trades for WCF ledger | ✅ Live |
| `/api/orderbook` | GET | Full depth: OKX + MEXC + Kraken (mid/spread/imbalance) | ✅ Live |
| `/api/recent-trades` | GET | Last 20 trades per exchange with buy/sell side | ✅ Live |
| `/api/warehouse` | GET | Ring buffer (100 trades) + WCF analytics + formulas | ✅ Live |
| `/api/launch-platform-check` | GET | Full feature verification JSON response | ✅ Live |
| `/.netlify/functions/*` | GET | Legacy Netlify-style aliases (backward compat) | ✅ Live |

### Exchange Symbols

| Exchange | Symbol | Pair |
|---|---|---|
| OKX | `PI-USDT` | Pi / Tether |
| MEXC | `PIUSDT` | Pi / Tether |
| Kraken | `PIUSD` | Pi / USD |

---

## Designed Tokens & Protocol Parameters

### Token Specifications

| Token | Symbol | Type | Compression Ratio | Backing |
|---|---|---|---|---|
| **Macro Pi** | π | Internal utility unit | 1 : 10,000,000 CEX Micros | Native mined Pi |
| **$REF** | REF | Justice-mined pioneer equity | — | 2,248,000 USD purchasing power |
| **πUSD** | πUSD | Fixed consensus peg | — | $3.14 (stable) |
| **π (blue)** | π🔵 | 314 System anchor | — | CEX Volume × 31,847 |

### Allocation Invariants

- **Non-inflationary:** 10,000,000:1 internal credit expansion preserves pioneer equity
- **Walled Garden:** External IOU prices do not affect internal Macro Pi pricing
- **WCF Protection:** Long-term pioneers maintain contribution weight via `log(TVL) + Velocity`
- **Provenance Decay (Ψ):** Enforced per-transfer; prevents manipulative arbitrage post-transfer
- **Anti-Manipulation:** Wash-trading detection via clustered transaction analysis (Proof-of-Utility)

### CEX Liquidity Entry (PiRC-207)

| Parameter | Value |
|---|---|
| Minimum PI Holding | ≥ 1 PI |
| Pool Lock Target | 10,000,000 CEX Liquidity Pool |
| Minimum CEX Participation | 1,000 CEX units |
| Liquidity Multiplier | × 31,847 |

---

## Workflows & CI/CD

| Workflow | File | Trigger | Purpose |
|---|---|---|---|
| Simulation CI | `automation/simulation.yml` | Push to main | Runs economic simulation suite |
| GitHub Actions | `.github/workflows/` | PR / Push | Code quality + integration checks |
| PR Template | `.github/pull_request_template.md` | PR creation | Standardized contribution format |

---

## Quick Start

### 1. Three Commands — Team Quickstart

```bash
# First time only — install Python dependencies
./scripts/setup_replit_free.sh

# Run all economic simulations (outputs to results/)
./scripts/run_all_sims_local.sh

# Dashboard is live automatically — open the Preview pane
# (server.js starts on workflow run — no extra command needed)
```

### 2. Web Dashboard

```bash
# Clone the repository
git clone https://github.com/Ze0ro99/PiRC.git
cd PiRC

# Install Node.js dependencies
npm install

# Start the backend server
node server.js
# → Dashboard available at http://localhost:5000
```

Features:
- Real-time order book depth (OKX · MEXC · Kraken)
- WCF parity telemetry and $REF ledger
- Governance voting (PiRC-207 / PiRC-208)
- 314 System formula panel
- Warehouse trade ring buffer with analytics
- Multi-language support: English · Arabic · Chinese · Indonesian · French · Malay

### 3. Economic Simulations (Python)

```bash
pip install numpy pandas matplotlib scipy
python economics/pi_whitepaper_economic_model.py
# or run all simulations at once:
./scripts/run_all_sims_local.sh
```

### 4. Rust Contract Prototypes

```bash
# Soroban/Stellar or EVM sidechain compilation
cargo run --manifest-path contracts/Cargo.toml
```

### 5. Dockerized Environment

```bash
docker build -t pirc .
docker run -p 8080:80 pirc
```

---

## Deployment

### Replit (Primary)

The application runs as a Node.js Express server on port 5000.

| Environment | URL |
|---|---|
| Dev Preview | Auto-generated Replit preview URL |
| Production | Publish via Replit Deploy → `.replit.app` domain |

### Netlify (Secondary)

`netlify.toml` provides zero-config deployment:
- Root publish directory → `.` (index.html entry point)
- Automatic function routing (`/api/*` → `netlify/functions/`)
- Security headers: `X-Frame-Options: DENY`, strict CORS, `Referrer-Policy`

```bash
# One-click deploy from GitHub → Netlify
./deployment/one-click-deploy.sh
```

### Pre-Deployment Checklist

See [`deployment/production-checklist.md`](deployment/production-checklist.md) before any production push.

---

## Documentation Index

| Document | Path | Description |
|---|---|---|
| Sovereign Monetary Standard | `docs/PiRC101_Whitepaper.md` | Full PiRC-101 specification |
| Core Team Integration Guide | `docs/QUICKSTART_FOR_PI_CORE_TEAM.md` | Pi Core Team onboarding |
| Merchant Walled-Garden Guide | `docs/MERCHANT_INTEGRATION.md` | Merchant integration |
| CEX Liquidity Rules | `docs/PiRC-207_CEX_Liquidity_Entry.md` | PiRC-207 specification |
| Team Onboarding | `docs/TEAM_ONBOARDING.md` | Developer onboarding |
| Formal Economic Invariants | `economics/economic_model.md` | Mathematical model spec |
| Threat Model | `security/THREAT_MODEL.md` | Security threat analysis |
| Architecture Overview | `pirc_architecture_overview.md` | System architecture |
| Adaptive Utility Allocation | `pirc-adaptive-utility-allocation.md` | Allocation system |
| Governance Parameters | `governance_parameters.md` | Governance config |
| Changelog | `CHANGELOG.md` | Full version history |
| Contributing Guide | `CONTRIBUTING.md` | How to contribute |
| Official Submission | `PI_RC_OFFICIAL_SUBMISSION.md` | Formal protocol submission |

---

## Security

- Formal threat model: [`security/THREAT_MODEL.md`](security/THREAT_MODEL.md)
- All API responses are read-only and stateless (except warehouse auto-save)
- DOM manipulation uses `escapeHtml()` — full HTML entity encoding on all external data
- No user-controlled data is ever inserted raw into the DOM
- Smart contracts implement anti-manipulation via Proof-of-Utility clustering
- Liquidity guardrail Φ enforces quadratic slippage protection

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/pirc-xxx`
3. Update relevant documentation and add tests
4. Submit a Pull Request referencing the relevant PiRC proposal number

We welcome:
- New economic simulation scenarios
- Rust/Soroban ports of Solidity reference contracts
- Additional language translations for the dashboard
- Formal security audits and invariant proofs
- New PiRC proposals (PiRC-209+)

See [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`.github/pull_request_template.md`](.github/pull_request_template.md).

---

## License & Disclaimer

**MIT License** — see [`LICENSE`](LICENSE).

All economic models, smart contract prototypes, and simulation engines are provided for research and community use under the MIT License.

> **Disclaimer:** This is an independent research prototype within the PiRC ecosystem. All telemetry and simulations reflect conceptual mainnet parity metrics on the Pi Network Blockchain Test Ledger. This is **not** an official Pi Network product. All raw transaction records captured herein represent test-ledger state only and carry no mainnet financial value.

---

> **Vanguard Bridge is live. The Pi ecosystem's long-term monetary standard is being built here.**
>
> — Ze0ro99 & PiRC Community · *Last updated: March 2026*
git push origin main
