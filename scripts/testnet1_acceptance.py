#!/usr/bin/env python3
"""Pi Testnet1 read-only verifier plus deterministic end-to-end economic rehearsal.

The rehearsal never submits transactions, signs, deploys, mints on-chain, or writes
to Pi Network. Every simulated asset/order/payment/withdrawal is explicitly local.
"""
from __future__ import annotations

import argparse
import json
import sys
import time
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

HORIZON_DEFAULT = "https://api.testnet.minepi.com"
RPC_DEFAULT = "https://rpc.testnet.minepi.com"
NETWORK_PASSPHRASE = "Pi Testnet"
NETWORK_ID = "pi-testnet1"
CANONICAL_LAYERS = ("RED", "ORANGE", "YELLOW", "GREEN", "BLUE", "INDIGO", "PURPLE")


class GateError(ValueError):
    pass


def require(condition: bool, message: str) -> None:
    if not condition:
        raise GateError(message)


def http_json(url: str, *, payload: dict[str, Any] | None = None, timeout: int = 12) -> dict[str, Any]:
    data = json.dumps(payload).encode() if payload is not None else None
    headers = {"Accept": "application/json", "User-Agent": "PiRC-Testnet1-Acceptance/1.0"}
    if data is not None:
        headers["Content-Type"] = "application/json"
    request = urllib.request.Request(url, data=data, headers=headers, method="POST" if data else "GET")
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            require(response.status == 200, f"HTTP {response.status} from {url}")
            value = json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise GateError(f"network request failed for {url}: {exc}") from exc
    require(isinstance(value, dict), f"non-object JSON from {url}")
    return value


def rpc_call(endpoint: str, method: str, request_id: int) -> dict[str, Any]:
    response = http_json(endpoint, payload={"jsonrpc": "2.0", "id": request_id, "method": method})
    require(response.get("jsonrpc") == "2.0", f"{method}: invalid JSON-RPC version")
    require(response.get("id") == request_id, f"{method}: mismatched JSON-RPC id")
    require("error" not in response, f"{method}: RPC error {response.get('error')}")
    result = response.get("result")
    require(isinstance(result, dict), f"{method}: missing result object")
    return result


def verify_testnet(horizon: str = HORIZON_DEFAULT, rpc: str = RPC_DEFAULT) -> dict[str, Any]:
    root = http_json(horizon.rstrip("/") + "/")
    actual_passphrase = root.get("network_passphrase")
    require(actual_passphrase == NETWORK_PASSPHRASE,
            f"Horizon network mismatch: expected {NETWORK_PASSPHRASE!r}, got {actual_passphrase!r}")
    health = rpc_call(rpc, "getHealth", 1)
    require(str(health.get("status", "")).lower() in {"healthy", "ok"},
            f"Soroban RPC is not healthy: {health}")
    network = rpc_call(rpc, "getNetwork", 2)
    rpc_passphrase = network.get("passphrase") or network.get("networkPassphrase")
    require(rpc_passphrase == NETWORK_PASSPHRASE,
            f"Soroban network mismatch: expected {NETWORK_PASSPHRASE!r}, got {rpc_passphrase!r}")
    latest = rpc_call(rpc, "getLatestLedger", 3)
    ledger = latest.get("sequence") or latest.get("latestLedger")
    require(isinstance(ledger, int) and ledger > 0, f"invalid latest ledger result: {latest}")
    protocol = network.get("protocolVersion")
    return {
        "status": "PASS",
        "network_id": NETWORK_ID,
        "horizon_url": horizon,
        "soroban_rpc_url": rpc,
        "horizon_passphrase": actual_passphrase,
        "rpc_passphrase": rpc_passphrase,
        "rpc_health": health.get("status"),
        "protocol_version": protocol,
        "latest_ledger": ledger,
        "mode": "READ_ONLY",
        "writes_performed": False,
    }


@dataclass
class SimulatedEconomy:
    """Deterministic local rehearsal of the user-facing PiRC transaction lifecycle."""
    balances: dict[tuple[str, str], int] = field(default_factory=dict)
    pool: tuple[int, int] = (1_000_000, 2_000_000)
    payments: dict[str, dict[str, str]] = field(default_factory=dict)
    events: set[str] = field(default_factory=set)
    settled_periods: dict[str, str] = field(default_factory=dict)
    withdrawal_requests: dict[str, str] = field(default_factory=dict)

    def mint_test_asset(self, owner: str, asset: str, amount: int) -> None:
        require(asset in CANONICAL_LAYERS, "asset is not in the canonical seven-layer test set")
        require(amount > 0, "mint amount must be positive")
        key = (owner, asset)
        self.balances[key] = self.balances.get(key, 0) + amount

    def swap(self, owner: str, amount_in: int, min_out: int, *, fee_bps: int = 30) -> int:
        require(amount_in > 0 and min_out >= 0, "invalid swap amounts")
        reserve_in, reserve_out = self.pool
        fee_adjusted = amount_in * (10_000 - fee_bps) // 10_000
        amount_out = reserve_out * fee_adjusted // (reserve_in + fee_adjusted)
        require(amount_out > 0 and amount_out >= min_out, "slippage/min-out guard rejected swap")
        self.pool = (reserve_in + amount_in, reserve_out - amount_out)
        return amount_out

    def create_payment(self, payment_id: str, owner: str, amount: int) -> None:
        require(payment_id not in self.payments, "duplicate payment id")
        require(owner and amount > 0, "invalid payment")
        self.payments[payment_id] = {"owner": owner, "amount": str(amount), "status": "CREATED", "txid": ""}

    def approve_payment(self, payment_id: str, owner: str) -> None:
        payment = self.payments[payment_id]
        require(payment["owner"] == owner, "payment owner mismatch")
        require(payment["status"] == "CREATED", "payment is not approvable")
        payment["status"] = "APPROVED"

    def complete_payment(self, payment_id: str, owner: str, txid: str) -> None:
        payment = self.payments[payment_id]
        require(payment["owner"] == owner, "payment owner mismatch")
        require(payment["status"] in {"APPROVED", "COMPLETED"}, "payment not approved")
        require(bool(txid), "missing transaction id")
        if payment["status"] == "COMPLETED":
            require(payment["txid"] == txid, "completion replay has a different transaction id")
            return
        payment["status"] = "COMPLETED"
        payment["txid"] = txid

    def ingest_event(self, event_id: str) -> bool:
        require(bool(event_id), "event id is required")
        if event_id in self.events:
            return False
        self.events.add(event_id)
        return True

    def settle(self, period_id: str, distributable: int, weights: dict[str, int], digest: str) -> dict[str, int]:
        require(period_id not in self.settled_periods, "period already settled")
        require(distributable >= 0 and bool(weights), "invalid settlement inputs")
        require(all(isinstance(weight, int) and weight >= 0 for weight in weights.values()),
                "negative or non-integer allocation weight")
        total_weight = sum(weights.values())
        require(total_weight > 0, "allocation weights sum to zero")
        names = sorted(weights)
        allocations = {name: distributable * weights[name] // total_weight for name in names}
        remainder = distributable - sum(allocations.values())
        allocations[names[-1]] += remainder
        require(sum(allocations.values()) == distributable, "allocation conservation failed")
        self.settled_periods[period_id] = digest
        return allocations

    def request_withdrawal(self, request_id: str, amount: int, *, identity: bool,
                           provenance: bool, eligible: bool, reserve_available: int) -> str:
        require(request_id not in self.withdrawal_requests, "duplicate withdrawal request")
        require(amount > 0, "withdrawal amount must be positive")
        require(identity and provenance and eligible, "withdrawal eligibility gate rejected request")
        require(reserve_available >= amount, "insufficient verified reserve")
        self.withdrawal_requests[request_id] = "APPROVED_FOR_TESTNET_REVIEW"
        return self.withdrawal_requests[request_id]


def run_rehearsal() -> dict[str, Any]:
    sim = SimulatedEconomy()
    checks: list[dict[str, str]] = []

    for layer in CANONICAL_LAYERS:
        sim.mint_test_asset("pioneer-a", layer, 1_000_000)
    checks.append({"name": "seven_layer_test_asset_setup", "status": "PASS",
                   "detail": "7/7 local test assets initialized; no chain mint"})

    before_k = sim.pool[0] * sim.pool[1]
    out = sim.swap("pioneer-a", 10_000, 19_000)
    require(out > 0 and sim.pool[0] * sim.pool[1] >= before_k,
            "constant-product invariant failed")
    checks.append({"name": "pidex_constant_product_swap", "status": "PASS",
                   "detail": f"input=10000 output={out}; fee=30bps; local pool only"})

    try:
        sim.swap("pioneer-a", 10_000, 99_999)
    except GateError as exc:
        require("slippage" in str(exc), f"unexpected swap failure: {exc}")
    else:
        raise AssertionError("slippage guard failed to reject an impossible min_out")
    checks.append({"name": "pidex_min_out_guard", "status": "PASS", "detail": "impossible min_out rejected"})

    sim.create_payment("payment-001", "pioneer-a", 250)
    sim.approve_payment("payment-001", "pioneer-a")
    sim.complete_payment("payment-001", "pioneer-a", "testnet-tx-001")
    sim.complete_payment("payment-001", "pioneer-a", "testnet-tx-001")
    checks.append({"name": "payment_approve_complete_idempotency", "status": "PASS",
                   "detail": "CREATED -> APPROVED -> COMPLETED; same-tx replay accepted"})

    try:
        sim.complete_payment("payment-001", "attacker", "testnet-tx-001")
    except GateError as exc:
        require("owner" in str(exc), f"unexpected payment failure: {exc}")
    else:
        raise AssertionError("payment owner guard failed")
    checks.append({"name": "payment_owner_guard", "status": "PASS", "detail": "foreign owner rejected"})

    require(sim.ingest_event("event-001"), "first event was not ingested")
    require(not sim.ingest_event("event-001"), "duplicate event was not suppressed")
    checks.append({"name": "event_ingestion_idempotency", "status": "PASS",
                   "detail": "duplicate event ID suppressed"})

    allocations = sim.settle("period-001", 450_000, {"identity": 1, "utility": 2, "contribution": 3}, "digest-001")
    require(sum(allocations.values()) == 450_000, "settlement did not conserve the distributable amount")
    checks.append({"name": "economic_settlement_conservation", "status": "PASS",
                   "detail": f"allocations={allocations}; sum=450000"})

    try:
        sim.settle("period-001", 450_000, {"identity": 1}, "digest-duplicate")
    except GateError as exc:
        require("already settled" in str(exc), f"unexpected settlement failure: {exc}")
    else:
        raise AssertionError("duplicate settlement guard failed")
    checks.append({"name": "settlement_replay_guard", "status": "PASS", "detail": "duplicate period rejected"})

    try:
        sim.request_withdrawal("withdrawal-denied", 100, identity=True, provenance=False,
                               eligible=True, reserve_available=1_000)
    except GateError as exc:
        require("eligibility" in str(exc), f"unexpected withdrawal failure: {exc}")
    else:
        raise AssertionError("withdrawal provenance gate failed")
    status = sim.request_withdrawal("withdrawal-approved", 100, identity=True, provenance=True,
                                     eligible=True, reserve_available=1_000)
    checks.append({"name": "withdrawal_eligibility_and_reserve_gate", "status": "PASS",
                   "detail": f"unproven request rejected; qualified request={status}; no payout"})

    return {
        "status": "PASS",
        "mode": "DETERMINISTIC_LOCAL_SIMULATION",
        "network_writes": False,
        "mainnet_operations": False,
        "checks": checks,
        "summary": {"passed": len(checks), "failed": 0, "layers": 7,
                    "payment_status": sim.payments["payment-001"]["status"],
                    "simulated_withdrawal_status": status},
        "disclaimer": "All assets, swaps, payments, settlements and withdrawal decisions in this section are local simulations, not Pi Testnet transactions or redeemable value.",
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--live-read-only", action="store_true",
                        help="verify Pi Testnet Horizon and Soroban RPC; performs no writes")
    parser.add_argument("--horizon", default=HORIZON_DEFAULT)
    parser.add_argument("--rpc", default=RPC_DEFAULT)
    parser.add_argument("--output", default="artifacts/testnet1-acceptance-report.json")
    args = parser.parse_args()

    report: dict[str, Any] = {
        "generated_at_unix": int(time.time()),
        "network": {"network_id": NETWORK_ID, "passphrase_expected": NETWORK_PASSPHRASE},
        "simulation": run_rehearsal(),
        "live_network": {"status": "NOT_RUN", "detail": "Use --live-read-only to verify live Pi Testnet endpoints."},
        "safety": {"network_writes": False, "signing": False, "deployment": False,
                   "mainnet_operations": False},
    }
    if args.live_read_only:
        report["live_network"] = verify_testnet(args.horizon, args.rpc)

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2, sort_keys=True))
    print(f"Report written to {output}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except GateError as exc:
        print(f"BLOCKED: {exc}", file=sys.stderr)
        raise SystemExit(2)
