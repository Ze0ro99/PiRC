#!/bin/bash

# ==============================================================================
# PiRC Soroban Smart Deployment Factory (Fault-Tolerant)
# Compiles and deploys Rust contracts. If one fails, it logs and continues!
# ==============================================================================

echo "🚀 [1/4] Initializing Smart Soroban Deployment Factory..."

NETWORK="testnet"
RPC_URL="https://testnet.sorobanrpc.com"
NETWORK_PASSPHRASE="Test SDF Network ; September 2015"

echo "⚙️ [2/4] Setting up Stellar Identity..."
stellar network add $NETWORK --rpc-url $RPC_URL --network-passphrase "$NETWORK_PASSPHRASE" || true

if [ -n "$STELLAR_TESTNET_SECRET" ]; then
    echo "$STELLAR_TESTNET_SECRET" | stellar keys add deployer_account --secret-key || true
    echo "✅ Stellar Testnet Identity configured successfully."
else
    echo "❌ ERROR: STELLAR_TESTNET_SECRET is missing! Cannot deploy."
    exit 1
fi

echo "🔨 [3/4] Compiling and Deploying Soroban Contracts..."
mkdir -p deployment_logs
LOG_FILE="deployment_logs/live_contracts_$(date +%Y%m%d_%H%M%S).txt"
ERROR_LOG="deployment_logs/failed_contracts_$(date +%Y%m%d_%H%M%S).txt"

echo "PiRC Live Contract Deployments - $(date)" > "$LOG_FILE"
echo "PiRC Failed Deployments (Needs Review) - $(date)" > "$ERROR_LOG"
echo "---------------------------------------------------" >> "$LOG_FILE"

# إزالة set -e لكي لا يتوقف السكربت بالكامل إذا فشل عقد واحد
find contracts/soroban -name "Cargo.toml" | while read -r cargo_file; do
    contract_dir=$(dirname "$cargo_file")
    contract_name=$(basename "$contract_dir")
    
    echo "⏳ Processing Contract: $contract_name in $contract_dir"
    cd "$contract_dir"
    
    echo "   -> Compiling..."
    # إذا فشل التجميع، سجل الخطأ وانتقل للعقد التالي فوراً
    if ! cargo build --target wasm32-unknown-unknown --release; then
        echo "   ❌ Compilation Failed for $contract_name. Skipping to next..."
        echo "$contract_name : Compilation Error" >> "../../$ERROR_LOG"
        cd - > /dev/null
        continue
    fi
    
    wasm_file=$(find target/wasm32-unknown-unknown/release -name "*.wasm" | head -n 1)
    
    if [ -n "$wasm_file" ]; then
        echo "   -> Deploying $wasm_file to $NETWORK..."
        # محاولة النشر، إذا فشلت لا توقف السكربت
        contract_id=$(stellar contract deploy --wasm "$wasm_file" --source deployer_account --network $NETWORK 2>/dev/null) || contract_id=""
        
        if [ -n "$contract_id" ]; then
            echo "   ✅ Deployed Successfully! ID: $contract_id"
            echo "$contract_name : $contract_id" >> "../../$LOG_FILE"
        else
            echo "   ❌ Deployment Failed for $contract_name. Skipping..."
            echo "$contract_name : Deployment Error" >> "../../$ERROR_LOG"
        fi
    else
        echo "   ❌ .wasm file not found for $contract_name"
        echo "$contract_name : WASM Missing" >> "../../$ERROR_LOG"
    fi
    
    cd - > /dev/null
done

echo "🌐 [4/4] Committing Deployment Logs to GitHub..."
git config --global user.name "github-actions[bot]"
git config --global user.email "github-actions[bot]@users.noreply.github.com"
git add deployment_logs/
git commit -m "chore: Smart Auto-deploy Soroban contracts to Stellar Testnet" 2>/dev/null || true
git push origin main

echo "🎉 SMART DEPLOYMENT COMPLETE!"
echo "Check deployment_logs/ for successful contracts and errors."
