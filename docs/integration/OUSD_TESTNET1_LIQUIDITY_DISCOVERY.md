# OUSD and Liquidity Discovery on Pi Testnet 1

This read-only audit inspects a public account and every Stellar-compatible liquidity-pool share position returned by the Pi Testnet 1 Horizon API.

## Run in Termux or any Python 3 environment

```bash
python scripts/audit_testnet1_liquidity.py \
  --account GB7EKKXHOCCMVN5SQNJ6IVILY53KSVH2DPMJ66P6272CWCJO7DUJMFVZ \
  --json
```

No third-party Python packages, API keys, wallet secrets, signing, or transaction submission are required.

When a Testnet OUSD issuer has been independently verified, pass its public address to require an exact asset-code **and issuer** match:

```bash
export OUSD_TESTNET_ISSUER="G..."
python scripts/audit_testnet1_liquidity.py \
  --account GB7EKKXHOCCMVN5SQNJ6IVILY53KSVH2DPMJ66P6272CWCJO7DUJMFVZ \
  --ousd-issuer "$OUSD_TESTNET_ISSUER" \
  --json
```

Until the issuer is known, omit `--ousd-issuer`; OUSD code candidates will be reported as unverified rather than as the project's OUSD.

## What it checks

- Account sequence and ledger metadata.
- Native and issued-asset balances, including OUSD asset-code candidates and, when supplied, an exact issuer match.
- All liquidity-pool share balances.
- Each pool's two reserve assets, reserve amounts, total shares and fee.
- Estimated underlying reserve share from the account's LP share fraction.
- OUSD presence in the account or in any successfully fetched pool.

## Evidence rules

An LP share balance proves a position in a pool, not the identity of the pool's reserves until the pool endpoint is read. The estimated underlying amounts are read-time estimates and may change with swaps or deposits/withdrawals.

A PGOLD, GOLD, GCV, BLUE, GREEN, ORANGE, PURPLE, RED, or YELLOW balance is not an OUSD balance. An OUSD asset must be identified by the exact asset code **and the expected issuer public key**. Without `--ousd-issuer`, the tool reports an OUSD code candidate as issuer-unverified; it does not call it the project's OUSD. A code with a different issuer is reported as an issuer mismatch. A pool lookup error or malformed pool response is reported as unknown and must never be interpreted as proof that OUSD is absent. Pool responses must contain exactly two reserves and a positive total-share amount.

Even an OUSD asset or OUSD-containing pool does not prove USD backing, a $1 peg, redemption rights, issuer authority, or off-chain settlement. Those require independent reserve attestations and a separately reviewed redemption process.

## Tests

Run:

```bash
python -m unittest discover -s tests -p 'test_testnet1_liquidity_audit.py' -v
```

The script is strictly read-only and has no Mainnet fallback.
