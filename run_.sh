#!/bin/bash
echo "🚀 Running contract: "
echo "📍 Network: Pi Experimental / Stellar Testnet"
echo "🔑 Replace CONTRACT_ID below with the deployed address when ready."
echo ""
if [[ "" == *rs ]]; then
  echo "soroban contract invoke --id CONTRACT_ID --function test --network testnet"
else
  echo "Solidity contract — use EVM bridge or Hardhat test:"
  echo "npx hardhat run scripts/test_.js --network testnet"
fi
echo ""
echo "✅ Example ready. Edit the script with your real contract ID and run it."
