#!/usr/bin/env python3
"""Read-only Pi Testnet 1 account and liquidity-pool audit.

No signing, transactions, key material, or Mainnet fallback is used.
"""
from __future__ import annotations

import argparse
import json
import sys
import time
from decimal import Decimal, InvalidOperation
from typing import Any, Callable
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

HORIZON_TESTNET1 = "https://api.testnet.minepi.com"


def fetch_json(url: str, timeout: int = 12, retries: int = 3) -> dict[str, Any]:
    """Fetch a Horizon JSON resource with bounded retries for transient failures."""
    headers = {
        "Accept": "application/json",
        "User-Agent": "PiRC-Testnet1-ReadOnly-Audit/1.0",
    }
    for attempt in range(retries + 1):
        try:
            request = Request(url, headers=headers)
            with urlopen(request, timeout=timeout) as response:
                payload = json.loads(response.read().decode("utf-8"))
                if not isinstance(payload, dict):
                    raise ValueError("Horizon returned a non-object JSON payload")
                return payload
        except HTTPError as exc:
            if exc.code not in (429, 500, 502, 503, 504) or attempt >= retries:
                raise
            time.sleep(min(2 ** attempt, 8))
        except (URLError, TimeoutError, json.JSONDecodeError) as exc:
            if attempt >= retries:
                raise RuntimeError(f"Horizon request failed: {exc}") from exc
            time.sleep(min(2 ** attempt, 8))
    raise RuntimeError("Horizon request exhausted retries")


def decimal_value(value: Any) -> Decimal | None:
    try:
        return Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError):
        return None


def asset_details(asset: str) -> dict[str, str | None]:
    if asset == "native":
        return {"code": "PI", "issuer": None, "type": "native"}
    parts = asset.split(":", 1)
    if len(parts) != 2:
        return {"code": asset, "issuer": None, "type": "unknown"}
    return {"code": parts[0], "issuer": parts[1], "type": "credit"}


def build_report(
    account_id: str,
    account: dict[str, Any],
    pool_loader: Callable[[str], dict[str, Any]],
    max_pools: int = 50,
) -> dict[str, Any]:
    balances = account.get("balances", [])
    credit_balances = []
    lp_balances = []
    account_ousd = []

    for item in balances:
        asset_type = item.get("asset_type", "")
        if asset_type == "liquidity_pool_shares":
            lp_balances.append(item)
        elif asset_type.startswith("credit_"):
            entry = {
                "asset_code": item.get("asset_code"),
                "asset_issuer": item.get("asset_issuer"),
                "balance": item.get("balance"),
                "is_authorized": item.get("is_authorized"),
                "buying_liabilities": item.get("buying_liabilities", "0"),
                "selling_liabilities": item.get("selling_liabilities", "0"),
            }
            credit_balances.append(entry)
            if str(item.get("asset_code", "")).upper() == "OUSD":
                account_ousd.append(entry)

    pools = []
    pool_errors = []
    for item in lp_balances[:max_pools]:
        pool_id = item.get("liquidity_pool_id")
        if not pool_id:
            continue
        try:
            payload = pool_loader(str(pool_id))
            pool = payload.get("liquidity_pool", payload)
            reserves = []
            account_share = decimal_value(item.get("balance"))
            total_shares = decimal_value(pool.get("total_shares"))
            share_ratio = (
                account_share / total_shares
                if account_share is not None and total_shares and total_shares > 0
                else None
            )
            for reserve in pool.get("reserves", []):
                details = asset_details(str(reserve.get("asset", "")))
                amount = decimal_value(reserve.get("amount"))
                reserves.append({
                    **details,
                    "reserve_amount": str(amount) if amount is not None else reserve.get("amount"),
                    "estimated_account_underlying": (
                        str(amount * share_ratio)
                        if amount is not None and share_ratio is not None
                        else None
                    ),
                })
            pools.append({
                "pool_id": pool_id,
                "account_lp_shares": item.get("balance"),
                "total_shares": pool.get("total_shares"),
                "share_percent": str(share_ratio * Decimal(100)) if share_ratio is not None else None,
                "fee_bp": pool.get("fee_bp"),
                "reserves": reserves,
                "contains_ousd": any(str(r.get("code", "")).upper() == "OUSD" for r in reserves),
            })
        except Exception as exc:  # preserve the rest of the account report
            pool_errors.append({"pool_id": pool_id, "error": str(exc)})

    pool_ousd = [pool for pool in pools if pool["contains_ousd"]]
    if account_ousd:
        ousd_status = "OUSD_BALANCE_FOUND"
    elif pool_ousd:
        ousd_status = "OUSD_LIQUIDITY_POOL_FOUND"
    else:
        ousd_status = "NO_OUSD_ASSET_FOUND_IN_ACCOUNT_OR_FETCHED_POOLS"

    native = next((b.get("balance") for b in balances if b.get("asset_type") == "native"), None)
    return {
        "network": "Pi Testnet 1",
        "horizon": HORIZON_TESTNET1,
        "account_id": account_id,
        "sequence": account.get("sequence"),
        "sequence_ledger": account.get("sequence_ledger"),
        "last_modified_ledger": account.get("last_modified_ledger"),
        "native_balance": native,
        "credit_asset_count": len(credit_balances),
        "liquidity_pool_share_count": len(lp_balances),
        "liquidity_pools_fetched": len(pools),
        "liquidity_pool_fetch_errors": pool_errors,
        "credit_balances": credit_balances,
        "ousd_account_balances": account_ousd,
        "liquidity_pools": pools,
        "ousd_pools": pool_ousd,
        "ousd_status": ousd_status,
        "limitations": [
            "LP underlying amounts are estimates based on account shares / total pool shares at read time.",
            "A token balance or LP position does not prove USD backing, a peg, redeemability, or issuer authorization.",
            "A failed pool lookup is unknown, not proof that the pool has no OUSD.",
            "This audit is read-only and never signs or submits transactions.",
        ],
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--account", required=True, help="Pi Testnet account public address (G...)")
    parser.add_argument("--max-pools", type=int, default=50, help="Maximum LP pools to inspect (default: 50)")
    parser.add_argument("--timeout", type=int, default=12, help="Per-request timeout in seconds")
    parser.add_argument("--json", action="store_true", help="Emit machine-readable JSON")
    args = parser.parse_args()

    if not args.account.startswith("G") or len(args.account) != 56:
        parser.error("--account must be a 56-character G... public account address")
    if args.max_pools < 0 or args.timeout < 1:
        parser.error("--max-pools must be non-negative and --timeout must be positive")

    try:
        account = fetch_json(f"{HORIZON_TESTNET1}/accounts/{args.account}", args.timeout)
        report = build_report(
            args.account,
            account,
            lambda pool_id: fetch_json(f"{HORIZON_TESTNET1}/liquidity_pools/{pool_id}", args.timeout),
            args.max_pools,
        )
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2

    if args.json:
        print(json.dumps(report, indent=2, sort_keys=True))
    else:
        print(f"Network: {report['network']}")
        print(f"Account: {report['account_id']}")
        print(f"Sequence ledger: {report['sequence_ledger']}")
        print(f"Native balance: {report['native_balance']}")
        print(f"Credit assets: {report['credit_asset_count']}")
        print(f"LP positions: {report['liquidity_pool_share_count']} (fetched {report['liquidity_pools_fetched']})")
        print(f"OUSD result: {report['ousd_status']}")
        for pool in report["liquidity_pools"]:
            assets = " / ".join(
                f"{r['code']}:{r['reserve_amount']}" for r in pool["reserves"]
            )
            print(f"- {pool['pool_id']}: {pool['share_percent']}% | {assets}")
        if report["liquidity_pool_fetch_errors"]:
            print(f"Pool lookup errors: {len(report['liquidity_pool_fetch_errors'])}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
