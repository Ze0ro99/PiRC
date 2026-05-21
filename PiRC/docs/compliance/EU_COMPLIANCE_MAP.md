# 🇪🇺 PiRC To MiCAR EU Compliance Matrix

**Document Status:** Live | **Standard:** PiRC-MICAR-001 | **Target:** EU Regulation 2023/1114

This matrix provides the mathematical and architectural mapping required to validate the Pi Network (via PiRC ecosystem standards) against the European Union's Markets in Crypto-Assets Regulation (MiCAR), GDPR, AMLD6, and DORA frameworks.

## 1. Asset & Utility Classification Mapping (MiCAR)

| MiCAR Article | Requirement | PiRC Resolution Standard | Evidence & Mechanism |
| :--- | :--- | :--- | :--- |
| **Art. 3** | Utility/Asset Classification | `PiRC-101`, `PiRC-900` | Token strictly mapped to computational/network utility constraints; RWA bridged separately. |
| **Art. 4-18** | Issuer Obligations & Whitepapers | `PiRC-202`, `PiRC-215` | Automated dynamic disclosures. Contract parameters prevent arbitrary token minting without utility lockups. |
| **Art. 19** | Conflict of Interest | `PiRC-Decentralized-Governance` | Soroban-based voting structures preventing singular entity override. |

## 2. GDPR & AMLD6 Alignment Layer

- **GDPR Minimalization**: Achieved via off-chain IPFS mapping (`PiRC-800` Decentralized Identity) coupled with zero-knowledge hooks. 
- **Right to Be Forgotten**: Regulated Vaults contain a burn/revocation standard to decouple identity associations upon user request cleanly.
- **AMLD6 Travel Rule**: Integrated into the *Regulated Mode Smart Contracts*, allowing compliant institutions to attach transaction metadata transparently.

## 3. ESG & DORA Metrics (Sustainability)

PiRC adopts Stellar/Soroban consensus, generating fractional carbon output compared to Proof of Work. Built-in compliance trackers measure energy expenditure per 10k transactions.
