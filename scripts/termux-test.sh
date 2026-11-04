#!/data/data/com.termux/files/usr/bin/bash
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
command -v python >/dev/null || { echo "Install Python: pkg install python"; exit 2; }
exec python scripts/termux_validate.py "$@"
