#!/bin/bash

# ==============================================================================
# PiRC Soroban Smart Deployment Factory (Self-Healing & Fault-Tolerant)
# ==============================================================================

echo "🚀 [1/5] Initializing Smart Soroban Deployment Factory..."

NETWORK="testnet"
RPC_URL="https://testnet.sorobanrpc.com"
NETWORK_PASSPHRASE="Test SDF Network ; September 2015"

echo "⚙️ [2/5] Setting up Stellar Identity..."
stellar network add $NETWORK --rpc-url $RPC_URL --network-passphrase "$NETWORK_PASSPHRASE" || true

if [ -n "$STELLAR_TESTNET_SECRET" ]; then
    echo "$STELLAR_TESTNET_SECRET" | stellar keys add deployer_account --secret-key || true
    echo "✅ Stellar Testnet Identity configured successfully."
else
    echo "❌ ERROR: STELLAR_TESTNET_SECRET is missing! Cannot deploy."
    exit 1
fi

echo "🩹 [3/5] Auto-Healing Rust Files (Fixing Module Architecture)..."
# 1. تنظيف كل الملفات من الأكواد التي تم حقنها بشكل خاطئ في كل مكان
find contracts/soroban -name "*.rs" -type f -exec sed -i '/#\!\[no_std\]/d' {} +
find contracts/soroban -name "*.rs" -type f -exec sed -i '/mod pirc_config;/d' {} +

# 2. وضع الأكواد الأساسية في الملف الرئيسي (lib.rs) فقط كما تتطلب لغة Rust
find contracts/soroban -name "Cargo.toml" | while read -r cargo_file; do
    contract_dir=$(dirname "$cargo_file")
    lib_rs="$contract_dir/src/lib.rs"
    
    if [ -f "$lib_rs" ]; then
        sed -i '1i #![no_std]' "$lib_rs"
        sed -i '2i mod pirc_config;' "$lib_rs"
    fi
done

# 3. إصلاح الخطأ البرمجي الخاص بعقد justice_engine
find contracts/soroban -name "justice_engine.rs" -type f | while read -r file; do
    if ! grep -q "use soroban_sdk::contracterror;" "$file"; then
        sed -i '1i use soroban_sdk::contracterror;' "$file"
    fi
done
echo "✅ Auto-Healing Complete."

echo "🔨 [4/5] Compiling and Deploying Soroban Contracts..."
mkdir -p deployment_logs
LOG_FILE="deployment_logs/live_contracts_$(date +%Y%m%d_%H%M%S).txt"
ERROR_LOG="deployment_logs/failed_contracts_$(date +%Y%m%d_%H%M%S).txt"

echo "PiRC Live Contract Deployments - $(date)" > "$LOG_FILE"
echo "PiRC Failed Deployments (Needs Review) - $(date)" > "$ERROR_LOG"
echo "---------------------------------------------------" >> "$LOG_FILE"

find contracts/soroban -name "Cargo.toml" | while read -r cargo_file; do
    contract_dir=$(dirname "$cargo_file")
    contract_name=$(basename "$contract_dir")
    
    echo "⏳ Processing Contract: $contract_name in $contract_dir"
    cd "$contract_dir"
    
    echo "   -> Compiling..."
    if ! cargo build --target wasm32-unknown-unknown --release; then
        echo "   ❌ Compilation Failed for $contract_name. Skipping to next..."
        echo "$contract_name : Compilation Error" >> "../../$ERROR_LOG"
        cd - > /dev/null
        continue
    fi
    
    wasm_file=$(find target/wasm32-unknown-unknown/release -name "*.wasm" | head -n 1)
    
    if [ -n "$wasm_file" ]; then
        echo "   -> Deploying $wasm_file to $NETWORK..."
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

echo "🌐 [5/5] Committing Deployment Logs and Auto-Fixes to GitHub..."
git config --global user.name "github-actions[bot]"
git config --global user.email "github-actions[bot]@users.noreply.github.com"
git add .
git commit -m "chore: Fixed Rust module architecture and deployed to Testnet" 2>/dev/null || true
git push origin main

echo "🎉 SMART DEPLOYMENT COMPLETE!"
