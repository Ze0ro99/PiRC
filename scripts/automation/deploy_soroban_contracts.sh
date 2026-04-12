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

echo "🩹 [3/5] Auto-Healing Rust Files (Fixing #![no_std] placement)..."
# هذا الجزء الذكي سيقوم بإصلاح خطأ الترتيب في كل ملفات Rust تلقائياً
find contracts/soroban -name "*.rs" -type f | while read -r file; do
    if grep -q "#\!\[no_std\]" "$file" || grep -q "mod pirc_config;" "$file"; then
        # حذف الأسطر من مكانها الخاطئ
        sed -i '/mod pirc_config;/d' "$file"
        sed -i '/#\!\[no_std\]/d' "$file"
        
        # إعادة كتابتها بالترتيب الصحيح الإجباري في لغة Rust
        echo "#![no_std]" > temp_fix.rs
        echo "mod pirc_config;" >> temp_fix.rs
        cat "$file" >> temp_fix.rs
        mv temp_fix.rs "$file"
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
git commit -m "chore: Auto-healed Rust contracts and deployed to Stellar Testnet" 2>/dev/null || true
git push origin main

echo "🎉 SMART DEPLOYMENT COMPLETE!"
