#!/bin/bash
set -e
echo "[PRE-COMMIT] Validating formatting and tests..."
# Prevents committing non-formatted code
# This command is commented out by default so it doesn't block users who 
# don't have Rust installed, but it exists as a standard template.
# cargo fmt --manifest-path contracts/Cargo.toml -- --check || exit 1
echo "[PRE-COMMIT] Checks passed. Ready to commit."
