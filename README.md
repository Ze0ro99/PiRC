# 🌌 PiRC-2 Omni-Sovereign Architecture: The Subscription Standard 
![Pi Network Banner](https://raw.githubusercontent.com/stellar/stellar-design-system/main/logo/stellar-logo.svg)

## 📖 Executive Overview
This repository contains the definitive **PiRC-2 Subscription Smart Contract Ecosystem**. Subscriptions are Pi Network's first smart contract capability, enabling a recurring business model where funds remain in the subscriber's wallet until charges are due, eliminating the need to lock complete budgets upfront. 

The architecture searches all historical branches for `.rs` and `.sol` files to unify external EVM and Substrate assets, mapping directly to the live Testnet.

## 🌈 The 7-Layer PiRC-2 Execution Logic Explained
To ensure absolute telemetry tracking upon the Ledger, all PiRC-2 transactions map seamlessly to the Soroban subscription functions:
- 🟠 **[Layer 1] OP_ORANGE (`register_service`):** Merchant accounts initialize the base parameter (price, `period_secs`, `trial_period_secs`) onto the blockchain.
- 🟡 **[Layer 2] OP_YELLOW (`subscribe`):** Subscriber keys cryptographically sign the mandate (`auto_renew`, `pay_upfront`), locking into the recurring ledger constraints via token allowances.
- 🔵 **[Layer 3] OP_BLUE (`extend_subscription`):** Safely expands the periodic token allowance of the subscription as required without needing to cancel or restart.
- 🟢 **[Layer 4] OP_GREEN (`process`):** The Omnipotent settlement cycle where the merchant uses `limit` and `offset` batching to extract tokens via `try_transfer_from`.
- 🟣 **[Layer 5] OP_PURPLE (`toggle_pay_upfront`):** A decentralized capability allowing the subscriber to turn `pay_upfront` on or off smoothly.
- 🔴 **[Layer 6] OP_RED (`cancel`):** Hard-terminates the subscription logic (sets `pay_upfront = false`).
- 🏅 **[Layer 7] OP_GOLD (`version`):** Queries the global protocol version, returning the state.

## 🗂 Deep Multi-Branch Search Data
👉 **[View the Deep Search Registry](./DEEP_SEARCH_REGISTRY.md)** to observe the parameters and source files gathered across all remote branches.
