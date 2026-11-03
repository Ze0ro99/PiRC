# PiRC Sovereign Hybrid Ecosystem — Master Architecture

Document type: proposed cross-repository architecture baseline. Status: draft for technical review, not an official Pi Network specification. Language: English.

## 1. Purpose
Coordinate three independently versioned repositories: PiRC owns standards, economic models, governance and documentation; SmartContracts owns executable contract logic and tests; Unity Sphere owns applications, APIs, adapters, operations and user interfaces. This document does not claim Pi Core Team endorsement, production readiness, banking authorization, reserve backing or deployment of any asset.

## 2. Seven-layer architecture

| Layer | Color | Domain | Responsibilities | Owners |
|---|---|---|---|---|
| L1 | Blue | Network and Settlement | Pi integration, Stellar/Horizon/Soroban adapters, network identity, transaction finality | Unity Sphere + SmartContracts |
| L2 | Green | Pi Cash and Payments | Payment intents, merchant invoices, payment orchestration, refunds, reconciliation | Unity Sphere |
| L3 | Gold | Pi Bank and Treasury | Treasury ledger, reserve attestations, custody controls, segregated liabilities, redemption workflow | PiRC + SmartContracts |
| L4 | Orange | Hybrid Assets and PiDEX | Asset registry, token metadata, AMM, liquidity pools, routing, market integrity | SmartContracts + Unity Sphere |
| L5 | Red | Economic Intelligence | Internal/external valuation separation, fixed-point calculations, velocity, distribution, simulation | PiRC + SmartContracts |
| L6 | Violet | Oracle and Interoperability | Data adapters, commodity/service feeds, freshness, quorum, cross-network proofs | SmartContracts + Unity Sphere |
| L7 | Charcoal | Governance and Security | Proposal lifecycle, roles, privacy, audit, incident response and release approvals | All repositories |

Colors are UI conventions only and have no protocol meaning.

## 3. Cross-repository source of truth
PiRC owns normative specifications, formulas, threat models and schemas. SmartContracts owns executable logic, interfaces and deterministic tests. Unity Sphere owns workflows, network adapters, APIs, indexers, monitoring and UI. A release manifest pins specification revision, contract artifact hashes, application version, SDK versions and network environment.

## 4. Hybrid asset model
Each asset record must include canonical ID, symbol, display name, class, issuer, network, issuer or contract address, decimals, supply model, transfer restrictions, metadata/logo URI, price-source policy, reserve policy if applicable, deployment transaction and verification status. Unknown fields remain null or unverified. Placeholder addresses must never appear as deployed contracts.

PI remains the native Pi Network asset. A representation on another network requires a specified lock/mint or burn/release mechanism, proof verification, replay protection, supply reconciliation, pause controls and independent audit. No cross-chain equivalence is assumed.

## 5. Pi Cash and Pi Bank boundaries
Pi Cash is a proposed payments and merchant-settlement application module, not a claim that Pi Network provides a bank account, card, fiat rail or custodial wallet through this repository. Pi Bank is a proposed treasury and financial-control module. It must not accept deposits, promise yield, issue redeemable liabilities or represent itself as a regulated bank without required legal authorization, custody arrangements, reserve evidence and disclosures. Initial scope should be non-custodial treasury accounting and policy controls.

## 6. OUSD requirements
OUSD is a proposed stable settlement asset, not an existing verified token by virtue of documentation. Before mint or redemption is enabled, specify issuer, legal claim, reserve assets, independent attestations, custody, redemption SLA, fees, mint/burn authorization, insolvency treatment, oracle dependencies, depeg response and emergency governance. Without these, only a clearly labeled test token may be used, with no dollar-backing or redemption claim.

## 7. Economic value separation
Distinguish market price, merchant quote, internal reference value, collateral valuation and redeemable cash value. They are not interchangeable. A GCV-like number is a model parameter unless funded liquidity and an enforceable redemption mechanism exist. APIs and UI must label value with unit, source, timestamp, confidence and policy context.

## 8. Stellar and Pi integration
Network adapters must be environment-specific. Mainnet and Testnet endpoints, network passphrases, contract IDs, issuers and API keys must never be mixed. Horizon account endpoints must not validate Soroban contract IDs; use the appropriate Soroban RPC. HTTP 404 is a resource/endpoint response, not proof that an arbitrary address is invalid. Protocol version and SDK version are separate compatibility dimensions.

## 9. Oracle pipeline
Source adapter → signature/source validation → timestamp/freshness → unit normalization → outlier policy → aggregation/quorum → signed result → on-chain verification → consumer contract. Commodity and service feeds require explicit units, geography, venue, methodology, licensing and dispute process. Chainlink services are used only where deployment is documented; Soroban requires an explicit adapter/relayer and independent verification.

## 10. Security
No secrets in Git, logs, screenshots, issues or build artifacts. Use least privilege, short-lived credentials and environment-scoped secret stores. Require multi-party approval for treasury, mint, burn, upgrade and emergency actions. Add timelocks, pause controls, replay protection, idempotency, network domain separation, threat models, dependency scans, reproducible builds and independent audits.

## 11. Release gates
Draft → Specified → Implemented → Unit Tested → Integration Tested → Security Reviewed → Testnet Verified → Production Candidate. Every transition requires linked evidence. README text and branch names are not evidence of deployment or audit.

## 12. Claims discipline
This architecture does not assert Pi Core Team acceptance, official Pi Cash/Pi Bank products, official GCV pricing, live OUSD reserves, Chainlink availability on Pi or successful mainnet deployment. Those claims require independent evidence and authorization.
