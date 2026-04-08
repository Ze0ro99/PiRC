#!/bin/bash
echo "🚀 PiRC Master Test — Running examples for ALL contracts"
for script in run_*.sh; do
  echo "────────────────────────────────────"
  echo "Testing: $script"
  ./"$script"
done
echo "────────────────────────────────────"
echo "✅ Master test completed — all systems have examples ready."
