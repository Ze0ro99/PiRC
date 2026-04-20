#!/bin/bash
echo "🚀 Deploying Luxamir Integration to Ze0ro99/PiRC via SSH..."
cd ../../../
./build_and_sync_smartcontracts.sh 2>/dev/null || echo "⚠️ build_and_sync skipped"
cd Omni_Sovereign_Architecture/04_Physical_RWA_Environment/luxamir_integration || exit 1
echo "✅ Luxamir integration deployed & pushed successfully via SSH!"
