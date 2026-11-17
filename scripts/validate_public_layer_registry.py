#!/usr/bin/env python3
"""Fail-closed validation for public PiRC layer registry copies."""

import csv
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PRIMARY = ROOT / "artifacts/pirc-wealth-core/public/data/LIVE_MATRIX_REGISTRY.csv"
CONTAINER_COPY = ROOT / "artifacts/pirc-wealth-core/public/data/containers/LIVE_MATRIX_REGISTRY.csv"
EXPECTED_HEADER = ["Layer", "Contract ID", "Color", "Status", "Deployed Date", "PIRC Standard"]
STRKEY_ALPHABET = set("ABCDEFGHIJKLMNOPQRSTUVWXYZ234567")
EXPECTED_HEADER = ["Layer", "Contract ID", "Color", "Status", "Deployed Date", "PIRC Standard"]


def validate() -> list[str]:
    errors: list[str] = []
    primary = PRIMARY.read_bytes()
    container_copy = CONTAINER_COPY.read_bytes()
    if primary != container_copy:
        errors.append("served public registry copies must be byte-identical")

    reader = csv.DictReader(primary.decode("utf-8").splitlines())
    if reader.fieldnames != EXPECTED_HEADER:
        errors.append("public layer registry header mismatch")
    rows = list(reader)
    if len(rows) != 8:
        errors.append(f"expected 8 preserved source references, found {len(rows)}")

    for row in rows:
        layer = row.get("Layer", "unknown")
        if row.get("Status") != "UNVERIFIED_REPOSITORY_CLAIM":
            errors.append(f"{layer}: status must remain UNVERIFIED_REPOSITORY_CLAIM")
        if (row.get("Deployed Date") or "").strip():
            errors.append(f"{layer}: unverified source claim cannot carry a deployed date")
        identifier = (row.get("Contract ID") or "").strip().strip('"')
        expected_prefix = "G" if layer == "CORE" else "C"
        if (
            len(identifier) != 56
            or not identifier.startswith(expected_prefix)
            or any(char not in STRKEY_ALPHABET for char in identifier)
        ):
            errors.append(f"{layer}: invalid StrKey shape or missing preserved identifier")

    core = next((row for row in rows if row.get("Layer") == "CORE"), None)
    if not core or core.get("Color") != "Core account reference":
        errors.append("CORE must not be labeled as a mint authority")

    return errors


if __name__ == "__main__":
    problems = validate()
    if problems:
        for problem in problems:
            print(f"ERROR: {problem}", file=sys.stderr)
        raise SystemExit(1)
    print("Public layer registry validation passed: 8 source references preserved and all remain unverified.")
