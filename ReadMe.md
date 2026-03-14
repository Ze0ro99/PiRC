# PiRC-101 | Justice Explorer (Mainnet Edition) ⚖️

The official real-time data transparency engine for the **PiRC-101 Protocol**. This explorer bridges the gap between external CEX liquidity and internal economic parity using the proprietary **Justice Engine** and **Weighted Contribution Factor (WCF)**.

🔗 **Live Explorer:** [https://ze0ro99.github.io/PiRC/](https://ze0ro99.github.io/PiRC/)

---

## 🚀 Key Features
* **Live Mainnet Stream:** Real-time data synchronization with Pi Network Mainnet nodes.
* **WCF Multiplier:** Dynamic calculation of internal Pi value based on the $1:10,000,000$ Justice Factor.
* **PiScan Ledger:** Transparent transaction tracking for $REF (Equity Reserve) and $WPI (Wrapped Pi).
* **Dual-Market Analysis:** Integrated price feeds from OKX and MEXC for external market benchmarking.
* **Multi-Currency Support:** Seamless toggling between **USD** and **JOD** (Jordanian Dinar) for local economic assessment.

## 🛠️ Technical Architecture
This explorer is built on a high-performance frontend stack designed for low-latency data streaming:
- **Framework:** Vanilla JavaScript (ES6+) with Fetch API integration.
- **Charts:** Lightweight Charts (Financial Standard) for real-time candlestick rendering.
- **Protocol:** Soroban-based smart contract logic integration (Justice Engine).
- **Styling:** CSS3 Grid & Flexbox for a responsive, dark-themed pro UI.

## 📊 Core Indicators
| Metric | Description |
| :--- | :--- |
| **WCF** | Weighted Contribution Factor protecting long-term pioneers. |
| **Φ (Phi)** | System Efficiency Factor measuring network liquidity health. |
| **$REF** | Circulating Equity generated through Justice-Mined transactions. |
| **πUSD** | Fixed Consensus Stability reference pegged at $3.14. |

---



---
*Disclaimer: This tool is part of the PiRC ecosystem. All data streams reflect live mainnet conditions and internal protocol parity metrics.*



See [PiRC1: Pi Ecosystem Token Design](./PiRC1/ReadMe.md)


# PiRC Research Extensions

This repository contains experimental proposals and research
extensions for the Pi Requests for Comment (PiRC) framework.

## Research Proposals

- PiRC-101 — Adaptive Utility Allocation
- PiRC-102 — Engagement Oracle Protocol

These proposals explore mechanisms for improving reward allocation,
engagement measurement, and protocol security in the Pi ecosystem.

## Goals

• deterministic reward allocation  
• engagement verification  
• sybil-resistant participation metrics  
• protocol-level incentive modeling


## PiRC Proposals

- PiRC-101: Adaptive Utility Allocation
- PiRC-102: Engagement Oracle Protocol


# PiRC Economic Architecture

Research and simulation framework for the PiRC reward coordination system.

This repository explores the economic structure behind PiRC including liquidity incentives, reward distribution models, and long-term ecosystem stability.

---

# Overview

PiRC introduces a liquidity-aware reward system connecting:

• Pioneer mining supply  
• External liquidity providers  
• Utility-driven transactions  
• Fee generation  

These components create a reflexive economic loop designed to stabilize the Pi ecosystem.

---

# Architecture

Pioneer Supply  
↓  
Liquidity Contribution Engine  
↓  
Economic Activity  
↓  
Fee Generation  
↓  
Reward Distribution  

---

# Repository Structure

contracts/  
Prototype contracts modeling reward and liquidity logic.

economics/  
Mathematical models of the PiRC economic system.

simulations/  
Agent-based simulations of ecosystem behavior.

docs/  
Protocol architecture and system design.

automation/  
Automated simulation runs using GitHub Actions.

---

# Research Goals

• Simulate liquidity growth  
• Analyze reward fairness  
• Test economic stability  
• Evaluate governance parameter bounds

---

# License

MIT License

## PiRC Architecture Overview

PiRC (Pi Requests for Comment) menggabungkan ekosistem token, treasury, governance, DEX executor, reward engine, dan liquidity controller dalam satu loop ekonomi terintegrasi.

### Diagram Arsitektur
![PiRC Architecture]![PiRC Architecture](file_00000000694471fa81c2a3a9c9367998.png)
)
> Diagram di atas menggambarkan alur interaksi antara:
> - **PiRC Token** (mint-on-demand)
> - **Treasury Vault**
> - **Governance Contract**
> - **Liquidity Controller**
> - **DEX Executor** (Free-Fault DEX)
> - **Reward Engine**
> - **Bootstrapper & GitHub Actions**
>
> Setiap modul berkontribusi pada loop ekonomi yang reflexive dan sybil-resistant.

### Dokumen Pendukung
Untuk penjelasan lebih lengkap mengenai tiap modul dan interaksi kontrak, lihat dokumen arsitektur:

[PiRC Architecture Overview](pirc_architecture_overview.md)
---

┌─────────────┐
                 │  PiRC Token │
                 │ (pi_token)  │
                 └─────┬──────┘
                       │
                       ▼
               ┌───────────────┐
               │ Treasury Vault│
               │ (treasury_vault) │
               └─────┬─────────┘
        ┌────────────┼─────────────┐
        ▼            ▼             ▼
 ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
 │Liquidity    │ │DEX Executor │ │Reward Engine│
 │Controller   │ │(dex_executor)│ │(reward_engine)│
 └─────┬───────┘ └─────┬───────┘ └─────┬───────┘
       │               │               │
       └───────┬───────┴───────┬───────┘
               ▼               ▼
           Bootstrapper & GitHub Actions
           (bootstrap + automation)


       # PiRC Architecture Overview


Diagram ini menggambarkan alur modul PiRC:
- **PiRC Token** → Mint-on-demand token utama
- **Treasury Vault** → Menyimpan cadangan dan alokasi token
- **Governance Contract** → Protokol tata kelola & voting
- **Liquidity Controller** → Mengelola likuiditas dan insentif
- **DEX Executor** → Free-Fault DEX untuk eksekusi trading
- **Reward Engine** → Menyalurkan reward ke pengguna & pionir
- **Bootstrapper & GitHub Actions** → Deployment, setup awal, simulasi otomatis

## Modul Klik Langsung ke Kontrak

- [PiRC Token](pi_token.rs)
- [Treasury Vault](treasury_vault.rs)
- [Governance Contract](governance.rs)
- [Liquidity Controller](liquidity_controller.rs)
- [DEX Executor](dex_executor_a.rs)
- [Reward Engine](reward_engine.rs)
- [Bootstrapper & Automation](bootstrap.rs)

  
## Ekosistem Loop Ekonomi


## Research Extensions

This fork expands the PiRC framework with additional research components:

• Economic Coordination Whitepaper  
• Governance Parameter Bounds  
• Agent-Based Economic Simulation  
• Liquidity Coordination Protocol  
• Engagement Oracle Model

These extensions explore mechanisms for improving long-term economic stability within the Pi ecosystem.
