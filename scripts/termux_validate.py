#!/usr/bin/env python3
"""Offline-first PiRC validation runner. No signing, deployment, or network writes."""
import argparse
import datetime as dt
import json
import os
import re
import subprocess
import sys
from decimal import Decimal
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "artifacts" / "termux-reports"


def result(ok, name, detail=""):
    return {"name": name, "status": "PASS" if ok else "FAIL", "detail": detail}


def command(args, timeout=900):
    try:
        p = subprocess.run(args, cwd=ROOT, text=True, stdout=subprocess.PIPE,
                           stderr=subprocess.STDOUT, timeout=timeout)
        return {"command": " ".join(args), "exit_code": p.returncode, "output": p.stdout[-8000:]}
    except FileNotFoundError:
        return {"command": " ".join(args), "exit_code": 127, "output": "Optional tool not installed"}
    except subprocess.TimeoutExpired:
        return {"command": " ".join(args), "exit_code": 124, "output": "Timed out"}


def json_check():
    files = []
    for folder in ("schemas", "registries", "fixtures"):
        base = ROOT / folder
        if base.exists():
            for path in base.rglob("*.json"):
                json.loads(path.read_text(encoding="utf-8"))
                files.append(str(path.relative_to(ROOT)))
    return result(bool(files), "json_documents_parse", f"{len(files)} JSON files parsed")


def economics():
    pi, pe = Decimal("314159"), Decimal("0.0314159")
    revenue, costs, senior, liabilities, reserve = map(
        Decimal, ("1000000", "400000", "50000", "100000", "0"))
    distributable = max(Decimal(0), revenue - costs - senior - liabilities - reserve)
    weights = [Decimal(1), Decimal(2), Decimal(3)]
    shares = [distributable * weight / sum(weights) for weight in weights]
    return [
        result(pi / pe == Decimal("10000000"), "dual_value_ratio_exact",
               str(pi / pe) + " (scenario arithmetic only)"),
        result(distributable == Decimal("450000"), "distributable_surplus",
               f"D=max(0,R-C-P-L-Q)={distributable}"),
        result(sum(shares) == distributable, "allocation_conservation",
               f"shares sum to {sum(shares)}"),
        result(all(value >= 0 for value in shares), "allocation_non_negative"),
    ]


def secret_scan():
    patterns = [
        re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
        re.compile(r"gh[pousr]_[A-Za-z0-9]{30,}"),
    ]
    hits = []
    for folder in (".github", "scripts", "docs", "schemas", "registries"):
        base = ROOT / folder
        if base.exists():
            for path in base.rglob("*"):
                if path.is_file() and path.suffix.lower() in {
                    ".py", ".sh", ".yml", ".yaml", ".json", ".toml", ".md", ".ts", ".js"
                }:
                    content = path.read_text(encoding="utf-8", errors="ignore")
                    if any(pattern.search(content) for pattern in patterns):
                        hits.append(str(path.relative_to(ROOT)))
    return result(not hits, "tracked_secret_pattern_scan",
                  "No high-confidence key patterns found" if not hits else "Review files: " + ", ".join(hits))


def classify_http(status):
    if status in (401, 403):
        return "BLOCKED"
    if status == 429:
        return "RATE_LIMITED"
    if 500 <= status <= 599:
        return "SERVER_ERROR"
    return "FAIL"


def health(name, url, rpc=False):
    if not url:
        return {"name": name, "status": "SKIP", "detail": "Not configured"}
    payload = {"jsonrpc": "2.0", "id": 1, "method": "getHealth"} if rpc else None
    data = json.dumps(payload).encode("utf-8") if rpc else None
    headers = {
        "Accept": "application/json",
        "User-Agent": "PiRC-read-only-health-check/1.0",
    }
    if rpc:
        headers["Content-Type"] = "application/json"
    request = Request(url, data=data, headers=headers, method="POST" if rpc else "GET")
    try:
        with urlopen(request, timeout=12) as response:
            status = response.status
            raw = response.read(4096).decode("utf-8", errors="replace")
            content_type = response.headers.get("Content-Type", "")
    except HTTPError as exc:
        try:
            detail = exc.read(1000).decode("utf-8", errors="replace")
        except Exception:
            detail = str(exc)
        return {"name": name, "status": classify_http(exc.code),
                "detail": f"HTTP {exc.code}: {detail[:250]}"}
    except TimeoutError as exc:
        return {"name": name, "status": "TIMEOUT", "detail": str(exc)[:250]}
    except URLError as exc:
        reason = getattr(exc, "reason", exc)
        status = "TIMEOUT" if isinstance(reason, TimeoutError) else "FAIL"
        return {"name": name, "status": status, "detail": str(reason)[:250]}
    except (OSError, ValueError) as exc:
        return {"name": name, "status": "FAIL", "detail": str(exc)[:250]}

    if status != 200:
        return {"name": name, "status": classify_http(status), "detail": f"HTTP {status}: {raw[:250]}"}
    try:
        document = json.loads(raw)
    except json.JSONDecodeError:
        return {"name": name, "status": "FAIL",
                "detail": f"HTTP 200 but response is not valid JSON ({content_type})"}
    if not isinstance(document, dict):
        return {"name": name, "status": "FAIL", "detail": "HTTP 200 JSON is not an object"}
    if rpc:
        if document.get("jsonrpc") != "2.0" or document.get("id") != 1 or "error" in document:
            return {"name": name, "status": "FAIL",
                    "detail": f"Invalid JSON-RPC getHealth response: {json.dumps(document)[:250]}"}
        health_result = document.get("result")
        if not isinstance(health_result, dict):
            return {"name": name, "status": "FAIL", "detail": "JSON-RPC result missing or malformed"}
        state = str(health_result.get("status", "")).lower()
        if state not in ("healthy", "ok"):
            return {"name": name, "status": "FAIL",
                    "detail": f"JSON-RPC responded but health status is not healthy: {health_result}"}
        return {"name": name, "status": "PASS", "detail": "HTTP 200; JSON-RPC getHealth status=healthy"}
    return {"name": name, "status": "PASS",
            "detail": f"HTTP 200; valid JSON object ({content_type})"}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--network-smoke", action="store_true",
                        help="Read-only HTTP / JSON-RPC getHealth checks; no writes")
    args = parser.parse_args()

    checks = [
        json_check(),
        *economics(),
        result((ROOT / "docs/economics/INTERNAL_EXTERNAL_VALUE_BRIDGE_SPEC.md").exists(),
               "economic_bridge_spec"),
        result((ROOT / "docs/integration/IMPLEMENTATION_TRACEABILITY_MATRIX.md").exists(),
               "legacy_traceability_matrix"),
        result((ROOT / "docs/integration/MASTER_IMPLEMENTATION_TRACEABILITY_MATRIX.md").exists(),
               "master_traceability_matrix"),
        secret_scan(),
    ]
    if args.network_smoke:
        checks += [
            health("Pi Testnet Horizon", os.getenv("PI_HORIZON_URL", "https://api.testnet.minepi.com")),
            health("Pi Testnet Soroban RPC", os.getenv("PI_SOROBAN_RPC_URL", "https://rpc.testnet.minepi.com"), True),
            health("Stellar Testnet Horizon", os.getenv("STELLAR_HORIZON_URL", "https://horizon-testnet.stellar.org")),
            health("Stellar Testnet Soroban RPC",
                   os.getenv("STELLAR_SOROBAN_RPC_URL", "https://soroban-testnet.stellar.org"), True),
        ]

    commands = []
    if (ROOT / "tests").exists():
        commands.append(command([sys.executable, "-m", "pytest", "-q", "tests"]))
    if (ROOT / "Cargo.toml").exists():
        commands.append(command(["cargo", "test", "--workspace", "--locked"], 1800))
    if (ROOT / "pnpm-lock.yaml").exists():
        commands.append(command(["pnpm", "run", "typecheck"], 1800))

    OUT.mkdir(parents=True, exist_ok=True)
    stamp = dt.datetime.now(dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    report = {
        "generated_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "network_writes": False,
        "mainnet_operations": False,
        "checks": checks,
        "commands": commands,
    }
    (OUT / f"report-{stamp}.json").write_text(json.dumps(report, indent=2) + "\n")
    lines = [
        "# Termux Validation Report", "", report["generated_at"], "",
        "> No signing, transaction submission, deployment, or Mainnet operation was performed.",
        "", "## Checks",
    ]
    lines += [f"- **{item['status']}** {item['name']}: {item.get('detail', '')}" for item in checks]
    lines += ["", "## Local commands"]
    lines += [f"- {item['command']} — exit {item['exit_code']}\n\n    {item['output'][:1500]}"
              for item in commands]
    (OUT / f"report-{stamp}.md").write_text("\n".join(lines) + "\n")

    for item in checks:
        print(item["status"], item["name"], item.get("detail", ""))
    for item in commands:
        print("EXIT", item["exit_code"], item["command"])
    print("Report:", OUT / f"report-{stamp}.md")

    blocking = {"FAIL", "BLOCKED", "RATE_LIMITED", "SERVER_ERROR", "TIMEOUT"}
    return int(any(item["status"] in blocking for item in checks)
               or any(item["exit_code"] not in (0, 127) for item in commands))


if __name__ == "__main__":
    raise SystemExit(main())
