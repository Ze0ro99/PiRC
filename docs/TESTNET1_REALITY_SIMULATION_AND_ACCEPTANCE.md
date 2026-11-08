# Pi Testnet1 Reality Simulation and Acceptance Gate

## Purpose

This package provides two separate kinds of evidence:

1. A **live, read-only Pi Testnet probe** that verifies the Horizon network passphrase and Soroban RPC health/network/latest ledger.
2. A **deterministic local rehearsal** of the PiRC user and economic lifecycle: seven test assets, constant-product PiDEX swap, slippage protection, payment approval/completion, event deduplication, conserved economic allocation, and withdrawal eligibility.

The local rehearsal is not a chain transaction. It must never be presented as deployed liquidity, issued tokens, paid withdrawals, or settled Pi value.

## Canonical network profile

| Field | Value |
|---|---|
| Network ID | `pi-testnet1` (PiRC project alias) |
| Canonical network | Pi Testnet |
| Horizon | `https://api.testnet.minepi.com` |
| Soroban RPC | `https://rpc.testnet.minepi.com` |
| Network passphrase | `Pi Testnet` |
| Live write capability in this harness | Disabled |

Pi Network's official RPC announcement documents the Testnet endpoint and the `getHealth` JSON-RPC probe: [Pi Testnet RPC Server](https://minepi.com/blog/rpc-server/).

## Run locally

Offline deterministic rehearsal:

```bash
python3 scripts/testnet1_acceptance.py
python3 -m unittest tests.test_testnet1_acceptance -v
```

Live read-only network verification plus rehearsal:

```bash
python3 scripts/testnet1_acceptance.py --live-read-only
```

Optional report path:

```bash
python3 scripts/testnet1_acceptance.py --live-read-only --output artifacts/testnet1-acceptance-report.json
```

Exit codes:
- `0`: deterministic rehearsal passed; if requested, live network identity and RPC checks passed.
- `2`: a safety/network verification gate failed or the live endpoint could not be verified.

## What is exercised

| Domain | Scenario | Required behavior |
|---|---|---|
| Assets | Seven canonical test asset layers | Test-only local fixtures; no on-chain mint |
| PiDEX | Constant-product swap | Integer arithmetic, 30 bps fee, invariant non-decreasing |
| PiDEX | Minimum output | Reject impossible min-out/slippage |
| Payments | Create, approve, complete | Owner binding and idempotent completion |
| Events | Duplicate event | Exactly-once projection by event ID |
| Economics | Weighted distribution | Non-negative weights and exact conservation |
| Settlement | Duplicate period | Reject replay |
| Withdrawals | Missing provenance | Reject request |
| Withdrawals | Identity, provenance, eligibility, reserve all present | Mark eligible for test review only; no payout |

## Contract deployment status is a separate gate

The current SmartContracts Testnet1 deployment manifest must be treated as authoritative for deployment evidence. At the last recorded review, the seven canonical asset contract IDs were null and the source packet registry was explicitly `SOURCE_DECLARED_NOT_CHAIN_VERIFIED`. The supplied issuer reference is a G-account public key, not a Soroban C-contract ID. These source references do not prove contract deployment.

A complete on-chain acceptance run still requires, for every approved contract:
1. Testnet network identity verified immediately before deployment.
2. Reproducible WASM artifact and SHA-256 recorded.
3. Explicit operator approval and a dedicated Testnet-only signer held in a protected environment.
4. Deployment transaction hash and returned C-contract ID.
5. Contract instance and code-hash readback from Pi Testnet RPC.
6. Initialization, admin/issuer authorization, storage, and negative authorization tests.
7. Test-asset balances and AMM reserves read back from canonical contract state.
8. Transaction status/finality and idempotent event reconciliation.

Do not infer any of these from a green local simulation, a source registry entry, an account public key, a successful frontend build, or a reachable RPC endpoint.

## Release boundaries

- This harness is read-only against the live network.
- It does not import, print, or require a secret key.
- It does not deploy contracts, submit transactions, mint assets, create liquidity, approve real Pi payments, or execute withdrawals.
- Mainnet endpoints are not accepted by the default profile.
- Test Pi is for testing only and has no monetary value.
- Pi SDK authentication is not Soroban transaction-signing authorization.
- PiRC simulation parameters (including any GCV/reference-price assumptions) are project scenarios, not Pi Core Team policy or cash redemption guarantees.

## Acceptance decision

A rehearsal result of `PASS` means the local deterministic scenarios passed. A live network result of `PASS` means only that the selected Pi Testnet endpoints identified themselves correctly and the read-only RPC probes worked. Neither result means contracts are deployed or that PiDEX/withdrawals are live.

The release gate remains **BLOCKED** until the deployment and state-readback evidence above is attached and all cross-repository ABI, security, wallet, and event-finality checks pass.
