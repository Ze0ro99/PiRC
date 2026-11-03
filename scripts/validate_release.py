#!/usr/bin/env python3
"""Validate PiRC release JSON schemas and local Markdown links using stdlib only."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCHEMA_DIR = ROOT / "schemas" / "v1"
DOC_ROOTS = [ROOT / "README.md", ROOT / "CHANGELOG.md", ROOT / "docs"]

def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)

def validate_schemas() -> bool:
    ok = True
    schema_files = sorted(SCHEMA_DIR.glob("*.schema.json"))
    if not schema_files:
        fail("No versioned JSON schemas found.")
        return False
    for path in schema_files:
        try:
            schema = json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:
            fail(f"{path.relative_to(ROOT)}: invalid JSON: {exc}")
            ok = False
            continue
        if schema.get("$schema") != "https://json-schema.org/draft/2020-12/schema":
            fail(f"{path.relative_to(ROOT)}: unexpected or missing JSON Schema draft.")
            ok = False
        if not isinstance(schema.get("$id"), str) or not schema["$id"].startswith("urn:pirc:"):
            fail(f"{path.relative_to(ROOT)}: stable urn:pirc schema ID required.")
            ok = False
        if schema.get("type") != "object" or not isinstance(schema.get("properties"), dict):
            fail(f"{path.relative_to(ROOT)}: top-level object/properties required.")
            ok = False
        required = schema.get("required", [])
        if not isinstance(required, list) or any(key not in schema.get("properties", {}) for key in required):
            fail(f"{path.relative_to(ROOT)}: required keys must exist in properties.")
            ok = False
        print(f"SCHEMA {'OK' if ok else 'CHECK'}: {path.relative_to(ROOT)}")
    return ok

def validate_markdown_links() -> bool:
    ok = True
    markdown_files = []
    for root in DOC_ROOTS:
        if root.is_file():
            markdown_files.append(root)
        elif root.exists():
            markdown_files.extend(root.rglob("*.md"))
    pattern = re.compile(r"(?<!!)\[[^\]]*\]\(([^)]+)\)")
    for md in sorted(set(markdown_files)):
        text = md.read_text(encoding="utf-8")
        for target in pattern.findall(text):
            target = target.strip().split("#", 1)[0]
            if not target or target.startswith(("https://", "http://", "mailto:", "tel:", "#")):
                continue
            if target.startswith("<") and target.endswith(">"):
                target = target[1:-1]
            resolved = (md.parent / target).resolve()
            if not resolved.exists():
                fail(f"{md.relative_to(ROOT)}: broken local link: {target}")
                ok = False
    print(f"Markdown links: {'OK' if ok else 'FAILED'}")
    return ok

def main() -> int:
    schema_ok = validate_schemas()
    links_ok = validate_markdown_links()
    if schema_ok and links_ok:
        print("PiRC release documentation validation passed.")
        return 0
    return 1

if __name__ == "__main__":
    raise SystemExit(main())
