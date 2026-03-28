#!/bin/bash
# === PiRC-207 FULL DEPLOYMENT SCRIPT (updated for get_value) ===
KEY_NAME="test-account"          # ← Change ONLY if your soroban key has a different name
NETWORK="testnet"

echo "🚀 Deploying + Activating ALL 7 PiRC-207 Colored Token Layers on Stellar $NETWORK..."

for dir in contracts/soroban/pirc-207-*-token; do
  color=$(basename "$dir" | sed 's/pirc-207-//;s/-token//')
  echo "🔨 Building & deploying $color layer..."

  cd "$dir" || continue
  soroban contract build

  CONTRACT_ID=$(soroban contract deploy \
    --wasm target/wasm32-unknown-unknown/release/*.wasm \
    --source "$KEY_NAME" \
    --network "$NETWORK")

  echo "✅ Deployed $color → $CONTRACT_ID"

  # Initialize / Activate
  soroban contract invoke \
    --id "$CONTRACT_ID" \
    --source "$KEY_NAME" \
    --network "$NETWORK" \
    -- initialize \
    --admin "$(soroban keys address "$KEY_NAME")"

  # Test get_value() immediately
  VALUE=$(soroban contract invoke \
    --id "$CONTRACT_ID" \
    --network "$NETWORK" \
    -- get_value)
  echo "📊 $color layer value = $VALUE"

  cd - > /dev/null
done

echo ""
echo "🎉 ALL 7 LAYERS ARE NOW LIVE ON STELLAR TESTNET!"
echo "Copy these links and paste them in PiNetwo #72 discussion:"
echo ""
for dir in contracts/soroban/pirc-207-*-token; do
  color=$(basename "$dir" | sed 's/pirc-207-//;s/-token//')
  echo "• $color layer → https://testnet.stellarexplorer.org/contract/<PASTE_CONTRACT_ID_HERE>"
done
