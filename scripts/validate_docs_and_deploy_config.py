#!/usr/bin/env python3
"""Validate documentation/deployment metadata using only the Python standard library."""
from __future__ import annotations

import json
import tomllib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def json_files() -> list[Path]:
    paths: set[Path] = set()
    for pattern in ("schemas/v1/*.json", "registries/*.json", "fixtures/*.json"):
        paths.update(ROOT.glob(pattern))
    return sorted(paths)


def main() -> int:
    files = json_files()
    for path in files:
        json.loads(path.read_text(encoding="utf-8"))

    config = tomllib.loads((ROOT / "netlify.toml").read_text(encoding="utf-8"))
    build = config.get("build", {})
    assert "pnpm install --frozen-lockfile" in build.get("command", "")
    assert "@workspace/pirc-wealth-core" in build.get("command", "")
    assert build.get("publish") == "artifacts/pirc-wealth-core/dist/public"
    assert (ROOT / "artifacts/pirc-wealth-core/vite.config.ts").is_file()

    redirects = config.get("redirects", [])
    assert len(redirects) >= 2
    assert redirects[0].get("from") == "/api/*"
    assert redirects[0].get("status") == 404
    assert redirects[-1].get("from") == "/*"
    assert redirects[-1].get("status") == 200

    headers_path = ROOT / "artifacts/pirc-wealth-core/public/_headers"
    headers = headers_path.read_text(encoding="utf-8")
    for required in (
        "X-Content-Type-Options: nosniff",
        "Referrer-Policy: strict-origin-when-cross-origin",
        "X-Frame-Options: DENY",
        "Strict-Transport-Security:",
        "Cache-Control: no-cache, no-store, must-revalidate",
        "Cache-Control: public, max-age=31536000, immutable",
    ):
        assert required in headers, f"Missing Netlify header: {required}"

    print(f"Validated {len(files)} JSON schema/registry/fixture documents.")
    print("Validated Netlify build command, publish path, API fail-closed rule, SPA fallback and static security/cache headers.")
    print("Scope: repository metadata/configuration only; no hosted deployment is implied.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
