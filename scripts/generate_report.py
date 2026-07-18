#!/usr/bin/env python3
"""
PiRC Detailed Test & Deployment Report Generator
Covers: All contracts, ZK/BN254 proofs, Warehouse settlement, Testnet 1 & 2
"""

import json
import os
import glob
import subprocess
from datetime import datetime, timezone
from pathlib import Path


# ─── Config ──────────────────────────────────────────────────────────────────

REPO_ROOT = Path(__file__).parent.parent
REPORT_DIR = REPO_ROOT / "reports"
REPORT_DIR.mkdir(exist_ok=True)

GOLD_LAYER_CONTRACTS = {
    "LAYER_GOLD":   "CD3UAUN4FU3VHPMLOZWFQWJ2UBUUBBD37SZ7WBEGJQACJ7YF6QVE2SYG",
    "LAYER_BLUE":   "CAMSQZTSCTF3MG4UEIAWKRZNSX7LLKGKXMVBEQO2ETVPGS3CINM7JBQD",
    "LAYER_GREEN":  "CBPG33E7RUX6MGU65IMM4HXCAGLA4OZRBOUWKQSBTIZWE2RD52VGWDT4",
    "LAYER_ORANGE": "CB7T6TDSZ5B2MQI7NI4EG6ZASYPRMJ3XVUWS6BON4Z64OBMUJ4ZD6GKF",
    "LAYER_PURPLE": "CCGEMIEAZFJSBTRL5VGJJAUGPJI3B7UQ3BTAB2OQGW73JMWLS57YVVA4",
    "LAYER_RED":    "CC6WMAHKOPWY6HW46VNKTAV4DZZLRTTNMYLDEKCAICQGMCWV5PZYNTBO",
    "LAYER_YELLOW": "CANLSQUPUZYKE3S2HAIGXAHMOQWE4FVX5DS7GTL42BVKSNHLFVMQSDFF",
    "REGISTRY":     "CAEUNHEUXACISTVHICFNISFRTRVSK5IALA3H5MUT7P4JKU5L3IPSKG4B",
    "ISSUER":       "GA3ECRFJ6SO5BW6NEIKW3ACJXNG5UNBTLRRXWC742NHUEDV6KL3RNEN6",
}

NEW_CONTRACTS = [
    {
        "name": "PiRCZkBN254",
        "file": "contracts/soroban/src/pirc_zk_bn254.rs",
        "pirc": "PiRC-225 / PiRC-226",
        "description": "BN254 Groth16 ZK proof commitment, attestation and query for reserve & identity proofs",
        "tests": [
            "test_submit_and_attest_reserve_proof",
            "test_identity_proof",
            "test_cross_chain_portability_proof",
        ],
    },
    {
        "name": "PiRCWarehousePayment",
        "file": "contracts/soroban/src/pirc_warehouse_payment.rs",
        "pirc": "PiRC-220 / PiRC-252 / PiRC-228",
        "description": "Warehouse withdrawal request and immediate settlement on Pi Testnet 1 & 2",
        "tests": [
            "test_submit_and_settle_testnet1",
            "test_submit_and_settle_testnet2",
            "test_reject_withdrawal",
            "test_cannot_settle_twice",
        ],
    },
]

FIXED_CONTRACTS = [
    {
        "name": "TreasuryVault",
        "file": "contracts/soroban/treasury_vault.rs",
        "issues_fixed": [
            "Replaced deprecated storage().get/set with persistent().get/set",
            "Changed u64 amounts to i128 (Soroban standard)",
            "Added #[contract] macro",
            "Added #[contracttype] VaultKey enum",
            "Added auth checks and events",
            "Removed duplicate #![forbid(unsafe_code)] lines",
            "Added admin_drain function for PiRC-228 justice",
            "Added unit tests",
        ],
    },
    {
        "name": "PiToken",
        "file": "contracts/soroban/pi_token.rs",
        "issues_fixed": [
            "Replaced deprecated storage API",
            "Added PiSource enum (Mined vs Exchange Pi distinction per PiRC-207)",
            "Changed u64 to i128",
            "Added QWF multiplier calculation (10,000,000:1)",
            "Added #[contract] and #[contracttype] macros",
            "Added total supply tracking for mined and exchange Pi separately",
            "Removed duplicate #![forbid(unsafe_code)] lines",
            "Added unit tests covering mined/exchange separation",
        ],
    },
    {
        "name": "PiRC241ZKCorporateID",
        "file": "contracts/soroban/src/zk_corporate_id.rs",
        "issues_fixed": [
            "Added ZKProofRecord struct with full BN254 proof storage",
            "Added public_input parameter for BN254 field element",
            "Added persistent proof record storage",
            "Added verified_count tracking",
            "Added get_proof query function",
            "Removed duplicate #![forbid(unsafe_code)] lines",
            "Added unit tests",
        ],
    },
]


def git_info():
    try:
        commit = subprocess.check_output(
            ["git", "rev-parse", "--short", "HEAD"], cwd=REPO_ROOT
        ).decode().strip()
        branch = subprocess.check_output(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"], cwd=REPO_ROOT
        ).decode().strip()
    except Exception:
        commit, branch = "unknown", "unknown"
    return commit, branch


def count_contracts():
    rs_files = list(REPO_ROOT.rglob("*.rs"))
    contract_files = [f for f in rs_files if "#[contract]" in f.read_text(errors="ignore")]
    return len(contract_files), len(rs_files)


def scan_branches():
    try:
        out = subprocess.check_output(
            ["git", "branch", "-a"], cwd=REPO_ROOT
        ).decode()
        branches = [b.strip().lstrip("* ") for b in out.splitlines() if b.strip()]
        return branches
    except Exception:
        return []


def scan_test_logs():
    results = []
    for logfile in REPORT_DIR.glob("*.log"):
        content = logfile.read_text(errors="ignore")
        passed = content.count("test result: ok") + content.count("PASSED")
        failed = content.count("FAILED")
        results.append({
            "log": logfile.name,
            "passed": passed,
            "failed": failed,
            "status": "PASS" if failed == 0 else "FAIL",
        })
    return results


def build_report():
    commit, branch = git_info()
    contract_count, rs_count = count_contracts()
    branches = scan_branches()
    test_logs = scan_test_logs()
    now = datetime.now(timezone.utc).isoformat()

    report = {
        "meta": {
            "title": "PiRC Comprehensive Test & Deployment Report",
            "generated_at": now,
            "commit": commit,
            "branch": branch,
            "repo": "https://github.com/Ze0ro99/PiRC",
        },
        "repository_stats": {
            "total_branches": len(branches),
            "branches": branches,
            "total_rust_files": rs_count,
            "contracts_with_contract_macro": contract_count,
        },
        "networks": {
            "testnet1": {
                "rpc": "https://rpc.testnet.minepi.com",
                "network_passphrase": "Pi Testnet",
                "description": "Pi Testnet 1 — primary testnet for Soroban contract deployment",
            },
            "testnet2": {
                "rpc": "https://rpc2.testnet.minepi.com",
                "network_passphrase": "Pi Testnet",
                "description": "Pi Testnet 2 — secondary testnet for redundant settlement",
            },
            "stellar_horizon": "https://horizon-testnet.stellar.org",
        },
        "zk_bn254": {
            "curve": "BN254 (alt_bn128)",
            "proof_system": "Groth16",
            "proof_commitment_bytes": 32,
            "public_inputs_hash_bytes": 32,
            "vk_hash_bytes": 32,
            "description": (
                "BN254 is the elliptic curve used by Groth16. "
                "On Soroban we store a 32-byte Poseidon/Keccak commitment of the full proof "
                "(pi_A || pi_B || pi_C hashed) to minimise on-chain storage while allowing "
                "off-chain verifiers to attest validity."
            ),
            "contracts": ["PiRCZkBN254 (PiRC-225/226)", "PiRC241ZKCorporateID (PiRC-241)"],
        },
        "pi_coin_distinction": {
            "mined_pi": {
                "source": "Walled Garden (in-app mining)",
                "qwf_multiplier": 10_000_000,
                "example_value_usd": 0.2248,
                "example_internal_units": 0.2248 * 10_000_000,
                "subject_to_qwf": True,
                "pirc_standard": "PiRC-207",
                "note": (
                    "Mined Pi exists inside Pi Network's walled garden. "
                    "It is NOT the same as Pi listed on exchanges. "
                    "Its internal value is computed as market_price * QWF_MULTIPLIER."
                ),
            },
            "exchange_pi": {
                "source": "External exchanges (OKX, Bitget, etc.)",
                "qwf_multiplier": 1,
                "subject_to_qwf": False,
                "note": (
                    "Exchange-listed Pi represents a separate liquidity pool. "
                    "Do NOT apply the 10M:1 multiplier to exchange Pi."
                ),
            },
        },
        "gold_layer_registry": GOLD_LAYER_CONTRACTS,
        "new_contracts": NEW_CONTRACTS,
        "fixed_contracts": FIXED_CONTRACTS,
        "warehouse": {
            "description": "Withdrawal request submitted in the warehouse. Immediate settlement on Testnet 1 & 2.",
            "contract": "pirc_warehouse_payment.rs",
            "pirc": "PiRC-220 / PiRC-252",
            "settlement_networks": [1, 2],
            "payment_flow": [
                "1. submit_withdrawal() — requester submits amount + BN254 ZK proof + network_id",
                "2. settle() — settler authority (multi-sig) immediately processes payment",
                "3. Event emitted: (WHPAY, SETTLED, request_id, recipient, amount, network_id)",
                "4. Team verifies settlement on testnet explorer",
            ],
        },
        "test_results": test_logs,
        "ci_workflows": {
            "master_pipeline": ".github/workflows/pirc-master-testnet-pipeline.yml",
            "description": "Full Soroban build, unit tests, economic simulations, testnet1 & testnet2 deployment",
            "jobs": [
                "build-contracts",
                "test-contracts",
                "test-simulations",
                "deploy-testnet1",
                "deploy-testnet2",
                "generate-report",
            ],
        },
    }

    # Save JSON
    json_path = REPORT_DIR / "PIRC_DETAILED_REPORT.json"
    json_path.write_text(json.dumps(report, indent=2))
    print(f"JSON report saved: {json_path}")

    # Save Markdown
    md_path = REPORT_DIR / "PIRC_DETAILED_REPORT.md"
    md = generate_markdown(report)
    md_path.write_text(md)
    print(f"Markdown report saved: {md_path}")

    return report


def generate_markdown(r: dict) -> str:
    m = r["meta"]
    zk = r["zk_bn254"]
    pi = r["pi_coin_distinction"]
    wh = r["warehouse"]

    lines = [
        f"# {m['title']}",
        f"",
        f"**Generated:** {m['generated_at']}  ",
        f"**Commit:** `{m['commit']}` | **Branch:** `{m['branch']}`  ",
        f"**Repo:** [{m['repo']}]({m['repo']})",
        f"",
        f"---",
        f"",
        f"## Networks",
        f"",
        f"| Network | RPC URL |",
        f"|---------|---------|",
        f"| Pi Testnet 1 | `{r['networks']['testnet1']['rpc']}` |",
        f"| Pi Testnet 2 | `{r['networks']['testnet2']['rpc']}` |",
        f"| Stellar Horizon | `{r['networks']['stellar_horizon']}` |",
        f"",
        f"---",
        f"",
        f"## ZK / BN254 Configuration",
        f"",
        f"| Parameter | Value |",
        f"|-----------|-------|",
        f"| Curve | **{zk['curve']}** |",
        f"| Proof System | **{zk['proof_system']}** |",
        f"| Proof Commitment Size | {zk['proof_commitment_bytes']} bytes |",
        f"| Public Inputs Hash | {zk['public_inputs_hash_bytes']} bytes |",
        f"| VK Hash | {zk['vk_hash_bytes']} bytes |",
        f"",
        f"{zk['description']}",
        f"",
        f"---",
        f"",
        f"## Pi Coin Distinction (PiRC-207)",
        f"",
        f"### Mined Pi (Walled Garden)",
        f"- QWF Multiplier: **{pi['mined_pi']['qwf_multiplier']:,}**",
        f"- At $0.2248 market price: **1 Mined Pi = {pi['mined_pi']['example_internal_units']:,.0f} internal units**",
        f"- {pi['mined_pi']['note']}",
        f"",
        f"### Exchange Pi",
        f"- QWF Multiplier: **1** (no multiplier)",
        f"- {pi['exchange_pi']['note']}",
        f"",
        f"---",
        f"",
        f"## Gold Layer Registry",
        f"",
        f"| Layer | Contract / Account ID |",
        f"|-------|-----------------------|",
    ]

    for k, v in r["gold_layer_registry"].items():
        lines.append(f"| {k} | `{v}` |")

    lines += [
        f"",
        f"---",
        f"",
        f"## Warehouse Settlement",
        f"",
        f"**{wh['description']}**",
        f"",
        f"Contract: `{wh['contract']}` | Standard: {wh['pirc']}",
        f"",
        f"Settlement flow:",
    ]
    for step in wh["payment_flow"]:
        lines.append(f"{step}  ")

    lines += [
        f"",
        f"---",
        f"",
        f"## New Contracts",
        f"",
    ]
    for c in r["new_contracts"]:
        lines += [
            f"### `{c['name']}` ({c['pirc']})",
            f"{c['description']}",
            f"",
            f"Tests:",
        ]
        for t in c["tests"]:
            lines.append(f"- `{t}`")
        lines.append("")

    lines += [
        f"---",
        f"",
        f"## Fixed Contracts",
        f"",
    ]
    for c in r["fixed_contracts"]:
        lines += [f"### `{c['name']}`", f"**File:** `{c['file']}`", f""]
        for fix in c["issues_fixed"]:
            lines.append(f"- {fix}")
        lines.append("")

    lines += [
        f"---",
        f"",
        f"## Repository Stats",
        f"",
        f"- Total branches: **{r['repository_stats']['total_branches']}**",
        f"- Total Rust files: **{r['repository_stats']['total_rust_files']}**",
        f"- Contracts with `#[contract]` macro: **{r['repository_stats']['contracts_with_contract_macro']}**",
        f"",
        f"---",
        f"",
        f"## CI/CD Pipeline",
        f"",
        f"Workflow: `{r['ci_workflows']['master_pipeline']}`",
        f"",
        f"Jobs:",
    ]
    for job in r["ci_workflows"]["jobs"]:
        lines.append(f"- `{job}`")

    lines += [f"", f"---", f"", f"*Report generated by PiRC automated pipeline*"]
    return "\n".join(lines)


if __name__ == "__main__":
    report = build_report()
    print("\n" + "=" * 60)
    print("  PIRC REPORT SUMMARY")
    print("=" * 60)
    print(f"  Commit:        {report['meta']['commit']}")
    print(f"  Branch:        {report['meta']['branch']}")
    print(f"  Branches:      {report['repository_stats']['total_branches']}")
    print(f"  Rust files:    {report['repository_stats']['total_rust_files']}")
    print(f"  Contracts:     {report['repository_stats']['contracts_with_contract_macro']}")
    print(f"  New contracts: {len(report['new_contracts'])}")
    print(f"  Fixed:         {len(report['fixed_contracts'])}")
    print("=" * 60)
    print(f"  Reports: {REPORT_DIR}/")
