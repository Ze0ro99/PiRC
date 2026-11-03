#!/usr/bin/env python3
"""Read-only inventory and triage of all branches across the PiRC ecosystem.

The tool never creates, updates, merges, deletes, or deploys branches. It records
branch-head identity, divergence from each repository's default branch, changed
path risk signals, and duplicate heads. GitHub API contents are treated as data.
"""
from __future__ import annotations

import argparse
import concurrent.futures
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

REPOSITORIES = (
    "Ze0ro99/PiRC",
    "Ze0ro99/SmartContracts",
    "Ze0ro99/project-unity-sphere-0e2c810d",
)
API = "https://api.github.com"
MAX_WORKERS = 6

SNAPSHOT_MARKERS = (
    "/node_modules/", "/target/", "/dist/", "/build/", "/.cargo/registry/",
    "/.migration-backup/", "/public/data/full-repo/", "/public/data/isolated-envs/",
    "/PiRC_Isolated_Workspace/", "/PiRC_Master_Workspace/",
)
SECRET_MARKERS = (".env", ".pem", ".key", "id_rsa", "credentials", "secrets.")
AUTOMATION_MARKERS = ("deploy", "publish", "sync", "factory", "orchestrator", "master", "release")


def api_json(url: str, token: str | None) -> dict | list:
    headers = {"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    request = urllib.request.Request(url, headers=headers)
    for attempt in range(4):
        try:
            with urllib.request.urlopen(request, timeout=45) as response:
                return json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            if exc.code in (429, 500, 502, 503, 504) and attempt < 3:
                time.sleep(2 ** attempt)
                continue
            body = exc.read().decode("utf-8", errors="replace")[:500]
            raise RuntimeError(f"GitHub API {exc.code} for {url}: {body}") from exc
        except (urllib.error.URLError, TimeoutError) as exc:
            if attempt < 3:
                time.sleep(2 ** attempt)
                continue
            raise RuntimeError(f"GitHub API request failed for {url}: {exc}") from exc
    raise RuntimeError(f"GitHub API retries exhausted: {url}")


def list_branches(repo: str, token: str | None) -> list[dict]:
    result: list[dict] = []
    page = 1
    while True:
        url = f"{API}/repos/{repo}/branches?per_page=100&page={page}"
        batch = api_json(url, token)
        if not isinstance(batch, list):
            raise RuntimeError(f"Unexpected branch response for {repo}")
        result.extend(batch)
        if len(batch) < 100:
            break
        page += 1
    return result


def classify(branch: dict, ahead: int, behind: int, paths: list[str], compare_error: str | None = None) -> list[str]:
    flags: list[str] = []
    lower_paths = [p.lower() for p in paths]
    normalized_paths = ["/" + p.strip("/") + "/" for p in lower_paths]
    if any(any(marker in p for marker in SECRET_MARKERS) for p in lower_paths):
        flags.append("SECRET_OR_ENV_REVIEW")
    if any(any(marker in p for marker in SNAPSHOT_MARKERS) for p in normalized_paths):
        flags.append("NESTED_SNAPSHOT_OR_VENDOR_REVIEW")
    if any(
        p.startswith(".github/workflows/") and any(marker in p for marker in AUTOMATION_MARKERS)
        for p in lower_paths
    ):
        flags.append("PRIVILEGED_AUTOMATION_REVIEW")
    if compare_error:
        flags.append("COMPARE_UNAVAILABLE")
    if ahead == 0:
        flags.append("NO_UNIQUE_COMMITS")
    elif behind > 0:
        flags.append("DIVERGED_REVIEW")
    elif not flags:
        flags.append("FAST_FORWARD_REVIEW_CANDIDATE")
    if ahead > 0 and not paths:
        flags.append("PATH_DIFF_UNAVAILABLE")
    return sorted(set(flags))


def audit_branch(repo: str, default_sha: str, branch: dict, token: str | None) -> dict:
    name = branch["name"]
    head_sha = branch["commit"]["sha"]
    if head_sha == default_sha:
        return {
            "repository": repo, "branch": name, "head_sha": head_sha,
            "ahead": 0, "behind": 0, "commits": 0, "changed_files": 0,
            "paths": [], "flags": ["DEFAULT_HEAD"],
        }
    url = f"{API}/repos/{repo}/compare/{default_sha}...{head_sha}"
    try:
        comparison = api_json(url, token)
        ahead = int(comparison.get("ahead_by", 0))
        behind = int(comparison.get("behind_by", 0))
        files = comparison.get("files") or []
        paths = [item.get("filename", "") for item in files if item.get("filename")]
        flags = classify(branch, ahead, behind, paths)
        return {
            "repository": repo, "branch": name, "head_sha": head_sha,
            "ahead": ahead, "behind": behind,
            "commits": int(comparison.get("total_commits", 0)),
            "changed_files": len(paths), "paths_truncated": len(files) >= 300,
            "paths": paths, "flags": flags,
        }
    except Exception as exc:
        return {
            "repository": repo, "branch": name, "head_sha": head_sha,
            "ahead": None, "behind": None, "commits": None,
            "changed_files": None, "paths": [],
            "flags": ["COMPARE_UNAVAILABLE"], "error": str(exc),
        }


def audit_repository(repo: str, token: str | None) -> dict:
    metadata = api_json(f"{API}/repos/{repo}", token)
    default_branch = metadata["default_branch"]
    default = api_json(f"{API}/repos/{repo}/branches/{urllib.parse.quote(default_branch, safe='')}", token)
    default_sha = default["commit"]["sha"]
    branches = list_branches(repo, token)

    rows: list[dict] = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        futures = [pool.submit(audit_branch, repo, default_sha, item, token) for item in branches]
        for future in concurrent.futures.as_completed(futures):
            rows.append(future.result())
    rows.sort(key=lambda row: row["branch"])

    by_head: dict[str, list[str]] = defaultdict(list)
    for row in rows:
        by_head[row["head_sha"]].append(row["branch"])
    duplicate_heads = [
        {"head_sha": sha, "branches": names}
        for sha, names in sorted(by_head.items()) if len(names) > 1
    ]
    counts: dict[str, int] = defaultdict(int)
    for row in rows:
        for flag in row["flags"]:
            counts[flag] += 1
    return {
        "repository": repo,
        "default_branch": default_branch,
        "default_sha": default_sha,
        "branch_count": len(rows),
        "unique_head_count": len(by_head),
        "duplicate_head_groups": duplicate_heads,
        "flag_counts": dict(sorted(counts.items())),
        "branches": rows,
    }


def markdown_report(report: dict) -> str:
    lines = [
        "# Cross-Repository Branch Audit",
        "",
        f"Generated: {report['generated_at']}",
        "",
        "Read-only report. No branch was changed, merged, deleted, deployed, or force-pushed.",
        "Compare results are point-in-time GitHub metadata; changed-file lists may be truncated by GitHub.",
        "",
    ]
    for repo in report["repositories"]:
        lines += [
            f"## {repo['repository']}",
            "",
            f"- Default branch: `{repo['default_branch']}`",
            f"- Branch refs: **{repo['branch_count']}**",
            f"- Unique head commits: **{repo['unique_head_count']}**",
            f"- Duplicate-head groups: **{len(repo['duplicate_head_groups'])}**",
            "",
            "| Disposition signal | Branch count |",
            "|---|---:|",
        ]
        for flag, count in repo["flag_counts"].items():
            lines.append(f"| `{flag}` | {count} |")
        lines += [
            "",
            "| Branch | Ahead | Behind | Changed paths | Signals |",
            "|---|---:|---:|---:|---|",
        ]
        for row in repo["branches"]:
            lines.append(
                f"| `{row['branch']}` | {row['ahead'] if row['ahead'] is not None else 'n/a'} "
                f"| {row['behind'] if row['behind'] is not None else 'n/a'} "
                f"| {row['changed_files'] if row['changed_files'] is not None else 'n/a'} "
                f"| {', '.join(row['flags'])} |"
            )
        lines.append("")
    lines += [
        "## Merge policy",
        "",
        "- Never merge a branch solely because it is ahead of the default branch.",
        "- Review secrets, deployment workflows, nested repository copies, vendored dependencies and generated outputs separately.",
        "- Require tests, ownership, source provenance, ABI compatibility, migration and rollback evidence.",
        "- AI agents may classify and propose changes; they cannot approve or merge their own output.",
        "",
    ]
    return "\n".join(lines)


def self_test() -> None:
    cases = [
        (1, 0, ["src/lib.rs"], ["FAST_FORWARD_REVIEW_CANDIDATE"]),
        (3, 8, ["src/lib.rs"], ["DIVERGED_REVIEW"]),
        (5, 4, [".env", ".github/workflows/deploy.yml", "public/data/full-repo/x"], [
            "DIVERGED_REVIEW", "NESTED_SNAPSHOT_OR_VENDOR_REVIEW",
            "PRIVILEGED_AUTOMATION_REVIEW", "SECRET_OR_ENV_REVIEW",
        ]),
        (0, 20, [], ["NO_UNIQUE_COMMITS"]),
    ]
    for ahead, behind, paths, expected in cases:
        actual = classify({}, ahead, behind, paths)
        for flag in expected:
            assert flag in actual, (ahead, behind, paths, flag, actual)
    print("Branch audit self-test: PASS")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--output-dir", default="branch-audit-report")
    args = parser.parse_args()
    if args.self_test:
        self_test()
        return 0

    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        print("GITHUB_TOKEN is required for the full cross-repository audit.", file=sys.stderr)
        return 2

    repositories = []
    for repo in REPOSITORIES:
        print(f"Auditing {repo} ...", flush=True)
        repositories.append(audit_repository(repo, token))
    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "repositories": repositories,
        "total_branch_refs": sum(item["branch_count"] for item in repositories),
        "total_unique_heads_per_repo": sum(item["unique_head_count"] for item in repositories),
    }

    output = Path(args.output_dir)
    output.mkdir(parents=True, exist_ok=True)
    (output / "branch-audit-report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    (output / "branch-audit-report.md").write_text(markdown_report(report), encoding="utf-8")
    print(markdown_report(report))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
