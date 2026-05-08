# 🧩 Atomic Solutions Blueprint: PiRC-103 to PiRC-200

**Architect:** Ze0ro99 | **Focus:** Separation of Concerns (SoC)

This document guarantees that the 97 standards (PiRC-103 to 200) contain **ZERO DUPLICATION** with the 200+ series. The 200+ series handles _Macro-Applications_ (Institutional Lending, AI, Subscriptions), while the 100+ series handles the _Micro-Mathematical Primitives_ that power them.

## 🧮 1. Mathematical Bonding Curves (PiRC 103 - 130)

_Non-repetitive problem solved: Finding the correct price of an asset without an order book._

- **PiRC-103 (xy=k Standard):** The raw geometric invariant curve.
- **PiRC-105 (Tick Math):** Logarithmic calculation for concentrated ranges.
- **PiRC-112 (Slippage Safety):** Cryptographic math to revert transactions if front-run (MEV protection).
  _(Note: These do not govern lending or identity; they purely govern how two tokens exchange value mathmatically.)_

## ⏱️ 2. Raw Timing & Oracles (PiRC 131 - 150)

_Non-repetitive problem solved: Preventing flash-crash manipulation in a single block._

- **PiRC-131 (TWAP Engine):** Time-Weighted Average Price algorithms holding historical cumulative prices.
- **PiRC-135 (Medianizer):** Taking the median of 5 external feeds to drop outliers.
  _(Distinction: This is raw numeric sorting, distinct from PiRC-208 which is AI/zkML sentiment analysis)._

## 🎫 3. Token Accounting Standards (PiRC 151 - 170)

_Non-repetitive problem solved: Proving a user owns liquidity._

- **PiRC-151 (LP Receipt Standard):** Issues a fractional token mapping exact pool ownership.
- **PiRC-155 (Reward Debt Math):** Standardizes `user.rewardDebt = (user.amount * pool.accRewardPerShare)`. Allows infinite users to claim rewards via O(1) complexity.

## 🔄 4. The Symbiosis Vaults (PiRC 171 - 200)

_Non-repetitive problem solved: Handling money over time without crashing the contract state._

- **PiRC-180 (ERC-4626 style Vaults):** Standardizes `deposit`, `withdraw`, `previewMint`.
- **PiRC-200 (Subscription Fueling):** The atomic connector. It solves the UX issue of manual PiRC-2 subscription renewals by mapping PiRC-180 Vault Yields to automatically trigger the PiRC-2 `subscribe()` function.

### Conclusion

By strictly isolating these lower-level formulas, PiDEX achieves **Turing-complete composability**. Higher-level constructs (like PiRC-231 Institutional Lending) simply reference PiRC-131 (TWAP) and PiRC-180 (Vaults) rather than rewriting them, completely eliminating standard bloat.
