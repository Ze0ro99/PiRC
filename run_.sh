#!/bin/bash
echo "🚀 Running contract: "
echo "📍 Network: Pi Experimental / Stellar Testnet"
echo "🔑 Replace CONTRACT_ID with the actual deployed address when ready."
echo ""
if [[ "" == *.rs ]]; then
  echo "soroban contract invoke --id CONTRACT_ID --function test --network testnet"
else
  echo "Solidity contract (use EVM bridge or Hardhat):"
  echo "npx hardhat run scripts/test_.js --network testnet"
fi
echo "✅ Example ready."
