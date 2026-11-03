#!/usr/bin/env python3
"""Validate the SoloHost preparation manifest without claiming runtime compatibility."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "packaging" / "solohost" / "compatibility-profile.json"
REQUIRED_DENY = {
    "private-key-access", "seed-phrase-access", "unrestricted-wallet-access",
    "treasury-execution", "issuer-mint", "contract-upgrade",
    "arbitrary-filesystem-write", "repository-write", "deployment",
}
ALLOWED_STATES = {"PREPARATION", "TESTED", "VERIFIED", "BLOCKED"}


def main() -> int:
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    assert data["profile_id"] == "pirc.solohost.pi-desktop-compatibility"
    assert data["target"]["product"] == "Pi Desktop"
    assert data["target"]["version"] == "0.6.4"
    assert data["status"] in ALLOWED_STATES
    denied = set(data["capabilities"]["deny"])
    assert REQUIRED_DENY.issubset(denied), "privileged capabilities must remain denied"
    for component in data["components"]:
        assert component["vendored"] is False, "external components must not be silently vendored"
    evidence = data["evidence"]
    if data["status"] in {"TESTED", "VERIFIED"}:
        assert evidence["runtime_test_report"], "tested state requires a runtime test report"
        assert evidence["desktop_build_checksum"], "tested state requires an exact desktop build checksum"
        assert evidence["component_checksums_verified"] is True
    if data["status"] == "VERIFIED":
        assert evidence["reviewer"] and evidence["reviewed_at"], "verified state requires reviewer sign-off"
    print(f"SoloHost profile valid: {data['status']} (static validation only; no runtime compatibility claim)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
