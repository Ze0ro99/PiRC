#!/usr/bin/env python3
"""Validate the canonical PiRC payment-event fixture with Python's standard library."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCHEMA = ROOT / "schemas" / "v1" / "payment-event.schema.json"
FIXTURE = ROOT / "fixtures" / "payment-event.succeeded.v1.json"

def main() -> int:
    schema = json.loads(SCHEMA.read_text(encoding="utf-8"))
    event = json.loads(FIXTURE.read_text(encoding="utf-8"))

    required = set(schema["required"])
    assert required.issubset(event), "fixture is missing required fields"
    assert event["schema"] == "pirc.payment-event"
    assert event["version"] == "1.0.0"
    assert event["status"] in schema["properties"]["status"]["enum"]
    assert event["event_type"] in schema["properties"]["event_type"]["enum"]
    assert isinstance(event["event_id"], str) and event["event_id"]
    assert re.fullmatch(r"(0|[1-9][0-9]*)", event["amount_atomic"])
    assert event["status"] != "SUCCEEDED" or (
        isinstance(event["transaction_hash"], str) and bool(event["transaction_hash"])
        and isinstance(event["contract_id"], str) and bool(event["contract_id"])
        and isinstance(event["ledger_sequence"], int) and event["ledger_sequence"] > 0
    ), "successful event requires transaction hash, contract ID, and positive ledger sequence"
    assert event["status"] != "ALREADY_PROCESSED" or bool(event["idempotency_key"]), (
        "ALREADY_PROCESSED requires an idempotency key"
    )
    print("Payment event schema JSON and canonical fixture invariants: OK")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
