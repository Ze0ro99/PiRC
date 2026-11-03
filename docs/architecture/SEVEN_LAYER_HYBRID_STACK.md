# Seven Colored Economic Layers and Shared Technical Planes

This document corrects the distinction between the seven colored PiRC-207 proposal layers and the software services that support them. The colors are economic/UI labels from the repository proposal; they are not network protocol layers.

## Seven colored proposal layers

| Order | Color | Chakra | Proposal label | Intended domain |
|---:|---|---|---|---|
| 1 | Red | Root | Governance / GOV | Governance and decision rights |
| 2 | Orange | Sacral | 3141 Orange | Mid-tier utility |
| 3 | Yellow | Solar Plexus | 31,140 Yellow | High-tier utility |
| 4 | Green | Heart | PiCash / 3.14 | Daily utility and merchant payment workflows |
| 5 | Blue | Throat | Banking / 314 | Institutional treasury and financial integrations |
| 6 | Indigo | Third Eye | Premium reserve / 314159 | Proposed premium/reserve accounting category |
| 7 | Purple | Crown | Mined Pi / fractions | Native mined Pi representation and fractions |

These are source proposal labels, not market prices or a statement that every layer is a separate live token. The existing registry CSV lists Gold instead of Indigo; this must be resolved by a versioned mapping proposal before canonical registry assignment.

## Shared technical planes (orthogonal to the colored layers)

The following capabilities support the seven proposal layers. They are software architecture planes, not additional colored tokens:

1. **Network and settlement:** Pi network adapter, Stellar/Horizon adapter, Soroban RPC adapter, finality and reconciliation.
2. **Asset registry:** canonical asset IDs, issuer, contract address, decimals, metadata, logo URI and verification evidence.
3. **Payments and merchant services:** payment intents, quotes, invoices, settlement, refunds and reconciliation. PiCash is a proposed application module, not an official Pi product.
4. **Treasury and institutional controls:** segregated ledgers, reserve records, custody evidence, multisig, timelocks and withdrawal policy. Pi Bank is a proposed software module, not a licensed bank.
5. **PiDEX and liquidity:** asset verification, pools, quotes, routing, fee accounting, slippage limits and market-integrity controls.
6. **Economic engine:** exact fixed-point calculations, contribution allocation, liquidity and velocity analytics, scenario simulation and risk controls.
7. **Oracle and real-world data:** source adapters, timestamps, unit normalization, quorum, deviation limits, signed evidence and consumer verification.
8. **Identity, governance and security:** roles, proposal execution, DID/VC interfaces, privacy, audit events, incident response and release approvals.

## Cross-plane payment flow

1. A merchant or user creates a payment intent.
2. The asset registry confirms the asset's network and verification status.
3. The economic engine returns a typed quote with units, source, timestamp and expiry.
4. Oracle data is consumed only if the quote requires external data and the feed passes freshness/quorum policy.
5. Governance/policy checks approve limits and roles.
6. The network adapter submits the transaction to the selected environment.
7. The settlement monitor verifies finality and reconciles the transaction.
8. Treasury records the resulting asset/liability movement where applicable.
9. All services emit correlated audit events.

## Financial boundaries

- Market price, internal reference, merchant quote, collateral valuation and redeemable cash value are distinct.
- A model constant such as 3.14, 314, 3141, 31140 or 314159 is not a USD price or redemption promise.
- OUSD remains proposed/test-only until issuer, enforceable redemption, custody, independently verified reserves, legal terms and depeg controls exist.
- An EVM Chainlink contract is not automatically deployable on Soroban; a network-specific adapter and verification model are required.

## Version and evidence policy

Track Pi protocol version, Soroban SDK version, contract release, application release and economic specification version separately. Mark each feature PROPOSED, SPECIFIED, IMPLEMENTED, TESTED, TESTNET_VERIFIED, AUDITED or MAINNET_VERIFIED with evidence links.
