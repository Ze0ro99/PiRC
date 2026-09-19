#!/data/data/com.termux/files/usr/bin/bash
echo "Re-optimizing PiRC development environment..."
pkg update -y && pkg upgrade -y
if [ -f package.json ]; then npm install; fi
if [ -f Cargo.toml ]; then cargo check || true; fi
echo "Environment re-optimized successfully."
