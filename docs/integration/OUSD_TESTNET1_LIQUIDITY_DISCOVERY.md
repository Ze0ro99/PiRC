# OUSD and Liquidity Discovery on Pi Testnet 1

This read-only audit inspects a public account and every Stellar-compatible liquidity-pool share position returned by the Pi Testnet 1 Horizon API.

## Run in Termux or any Python 3 environment

```bash
python scripts/audit_testnet1_liquidity.py \
  --account GB7EKKXHOCCMVN5SQNJ6IVILY53KSVH2DPMJ66P6272CWCJO7DUJMFVZ \
  --json
```

No third-party Python packages, API keys, wallet secrets, signing, or transaction submission are required.

## What it checks

- Account sequence and ledger metadata.
- Native and issued-asset balances, including an exact OUSD asset-code match.
- All liquidity-pool share balances.
- Each pool's two reserve assets, reserve amounts, total shares and fee.
- Estimated underlying reserve share from the account's LP share fraction.
- OUSD presence in the account or in any successfully fetched pool.

## Evidence rules

An LP share balance proves a position in a pool, not the identity of the pool's reserves until the pool endpoint is read. The estimated underlying amounts are read-time estimates and may change with swaps or deposits/withdrawals.

A PGOLD, GOLD, GCV, BLUE, GREEN, ORANGE, PURPLE, RED, or YELLOW balance is not an OUSD balance. An OUSD asset must be identified by its exact asset code and issuer. A pool lookup error is reported as unknown and must never be interpreted as proof that OUSD is absent.

Even an OUSD asset or OUSD-containing pool does not prove USD backing, a $1 peg, redemption rights, issuer authority, or off-chain settlement. Those require independent reserve attestations and a separately reviewed redemption process.

## Tests

Run:

```bash
python -m unittest scripts/test_audit_testnet1_liquidity.py
```

The script is strictly read-only and has no Mainnet fallback.
