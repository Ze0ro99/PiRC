# PiRC-OUSD-TEST — OUSD Test Asset Profile

**Status:** DRAFT / TESTNET-ONLY REFERENCE  
**Normative authority:** Community proposal; not an official Pi Network standard  
**Asset status:** Not deployed, not USD-backed, not redeemable

## 1. Purpose

Define a safe test-only OUSD asset profile for validating asset-registry schemas, PiDEX presentation, Soroban token interfaces, mint/burn controls and lifecycle documentation. The name OUSD is a project label only. It does not establish a one-dollar value, a legal claim on an issuer, a reserve asset or a redemption right.

## 2. Separation from real stablecoin claims

OUSD in this proposal must never be described as:
- pegged to USD;
- backed by dollars, cash equivalents or other reserves;
- redeemable for USD;
- insured, guaranteed or issued by a regulated financial institution;
- an official Pi Network asset.

The test token contract is a permissioned Soroban reference implementation. It is not a payment stablecoin, bank deposit, e-money instrument or public investment product.

## 3. Reference contract profile

| Field | Reference value |
|---|---|
| Contract crate | `ousd_test_token` |
| Interface | SEP-41-style Soroban token methods |
| Symbol | OUSD |
| Name | OUSD Test Token |
| Decimals | 7 (reference contract constant only) |
| Network | Pi Testnet only after compatibility and RPC checks; Stellar Testnet for isolated development |
| Initial supply | 0 |
| Mint authority | Explicit admin address |
| Supply cap | 1,000,000,000 OUSD atomic-unit-adjusted tokens |
| Redemption | Disabled / not implemented |
| Reserve attestation | Not applicable; no backing claim |
| Market price | None |
| Production use | Prohibited |

The reference supply cap is a software guard, not a reserve statement or monetary policy.

## 4. Required contract behavior

1. One-time initialization with an explicit admin.
2. Admin-authenticated minting under a fixed maximum supply.
3. Holder-authenticated transfer and burn.
4. SEP-41-style allowance, approve and transfer-from flow with ledger-based expiration.
5. Checked arithmetic and typed errors.
6. Lifecycle events for initialization, mint, transfer, approval and burn.
7. No arbitrary external price oracle, reserve assertion, redemption or automatic peg logic.

## 5. API and PiDEX behavior

The asset registry may expose OUSD as a test-only proposal record with null contract ID until deployment evidence exists. The UI must display a TEST ONLY badge and `UNVERIFIED` status. The following actions remain disabled until a separate approved test deployment and readback:
- deposits and withdrawals;
- AMM pool creation and swaps;
- external transfers;
- minting from application UI;
- redemption or conversion to USD.

## 6. Deployment and release gates

Before any test deployment:
- compile and run the crate tests against the pinned Soroban SDK;
- inspect the generated WASM and contract interface;
- confirm the target network passphrase and Soroban RPC;
- use a dedicated test admin account with no production secrets;
- deploy only to the explicitly approved test network;
- record contract ID, deployment transaction, WASM hash, admin address and ledger readback;
- confirm decimals, symbol, name, supply and admin via contract reads;
- label all screenshots and dashboards TESTNET / TEST ONLY.

No deployment to Pi Mainnet is authorized by this specification.

## 7. Acceptance criteria

- [ ] Initialization is one-time and admin-authenticated.
- [ ] Unauthorized minting is rejected.
- [ ] Minting above the supply cap is rejected.
- [ ] Transfer rejects negative amounts and insufficient balances.
- [ ] Approvals expire according to ledger sequence.
- [ ] transfer_from consumes allowance and respects authorization.
- [ ] Burn reduces both holder balance and total supply.
- [ ] Overflow and underflow paths fail safely.
- [ ] Registry and UI keep issuer, contract ID, price, reserves and redemption fields null until verified.
- [ ] No copy, label or UI implies USD peg, reserve backing or redemption.

## 8. Change control

Any future proposal to add reserves, price stabilization, redemption or institutional issuance requires a separate specification, legal analysis, reserve/custody model, independent attestation design, insolvency treatment, oracle threat model and governance approval. These features must not be added by changing a logo, symbol or README.
