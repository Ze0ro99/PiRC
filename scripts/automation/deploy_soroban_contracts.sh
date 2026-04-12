#!/bin/bash

# ==============================================================================
# PiRC Soroban Automated Deployment Factory
# Compiles and deploys Rust contracts to Stellar Testnet
# ==============================================================================

set -e

echo "🚀 [1/4] Initializing Soroban Deployment Factory..."

NETWORK="testnet"
RPC_URL="https://testnet.sorobanrpc.com"
NETWORK_PASSPHRASE="Test SDF Network ; September 2015"

echo "⚙️ [2/4] Setting up Stellar Identity..."

stellar network add $NETWORK --rpc-url $RPC_URL --network-passphrase "$NETWORK_PASSPHRASE" || true

if [ -n "$STELLAR_TESTNET_SECRET" ]; then
    echo "$STELLAR_TESTNET_SECRET" | stellar keys add deployer_account --secret-key || true
    echo "✅ Stellar Testnet Identity configured successfully."
else
    echo "❌ ERROR: STELLAR_TESTNET_SECRET environment variable is missing in GitHub Secrets!"
    exit 1
fi

echo "🔨 [3/4] Compiling and Deploying Soroban Contracts..."
mkdir -p deployment_logs
LOG_FILE="deployment_logs/live_contracts_$(date +%Y%m%d_%H%M%S).txt"
echo "PiRC Live Contract Deployments - $(date)" > "$LOG_FILE"
echo "---------------------------------------------------" >> "$LOG_FILE"

find contracts/soroban -name "Cargo.toml" | while read -r cargo_file; do
    contract_dir=$(dirname "$cargo_file")
    contract_name=$(basename "$contract_dir")
    
    echo "⏳ Processing Contract: $contract_name in $contract_dir"
    cd "$contract_dir"
    
    echo "   -> Compiling..."
    cargo build --target wasm32-unknown-unknown --release
    
    wasm_file=$(find target/wasm32-unknown-unknown/release -name "*.wasm" | head -n 1)
    
    if [ -n "$wasm_file" ]; then
        echo "   -> Deploying $wasm_file to $NETWORK..."
        contract_id=$(stellar contract deploy --wasm "$wasm_file" --source deployer_account --network $NETWORK)
        
        if [ -n "$contract_id" ]; then
            echo "   ✅ Deployed Successfully! ID: $contract_id"
            echo "$contract_name : $contract_id" >> "../../$LOG_FILE"
        else
            echo "   ❌ Deployment Failed for $contract_name"
        fi
    else
        echo "   ❌ Compilation Failed or .wasm not found for $contract_name"
    fi
    cd - > /dev/null
done

echo "🌐 [4/4] Committing Deployment Logs to GitHub..."
git config --global user.name "github-actions[bot]"
git config --global user.email "github-actions[bot]@users.noreply.github.com"
git add deployment_logs/
git commit -m "chore: Auto-deployed Soroban contracts to Stellar Testnet" 2>/dev/null || true
git push origin main

echo "🎉 DEPLOYMENT FACTORY COMPLETE! Check the deployment_logs folder for your live Contract IDs."
