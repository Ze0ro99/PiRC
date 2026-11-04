# Termux Validation and Economic Architecture

Status: independent community engineering proposal. No GitHub Actions minutes are required for the local test runner. The default suite is offline. The optional network profile performs read-only health checks only; it never signs, submits transactions, deploys contracts, or writes to Mainnet.

## 1. Termux bootstrap

~~~bash
pkg update
pkg install git python nodejs-lts rust clang make cmake jq curl
python -m pip install --upgrade pip
python -m pip install pytest
npm install --global pnpm
git clone https://github.com/Ze0ro99/PiRC.git
cd PiRC
git checkout main && git pull --ff-only
chmod +x scripts/termux-test.sh scripts/termux_validate.py
./scripts/termux-test.sh
~~~

Install only toolchains required by the component being tested. Rust builds can consume substantial mobile storage and battery; run fast checks first.

## 2. Test profiles

| Profile | Command | Network | Writes |
|---|---|---|---|
| Offline validation | ./scripts/termux-test.sh | None | Local report only |
| Read-only health | ./scripts/termux-test.sh --network-smoke | Pi and Stellar Testnet | HTTP GET / JSON-RPC getHealth |
| Rust contracts | cargo test --workspace --locked | None by default | Local build artifacts |
| Unity Sphere | pnpm -r test after frozen install | None by default | Local build artifacts |
| Contract deployment | Separate reviewed procedure | Explicit Testnet only | Disabled in runner |

Clone the three repositories separately and record each commit SHA. In SmartContracts inspect Cargo workspace members and run targeted crate tests before the full workspace. In Unity Sphere inspect package.json and lockfile before selecting scripts. Do not assume the same commands apply to all repositories.

## 3. Dual-value economic model

The project distinguishes internal reference values, external market observations, merchant utility prices, accounting values, collateral marks, and legally redeemable liabilities. A single ambiguous price field is prohibited.

**The external quote belongs to the project's economic information environment and can contribute to the overall utility model, but it does not automatically replace the internal utility schedule.** It may inform merchant quote presentation, market-risk controls, accounting views, or a governed pricing policy. It must not mutate balances, GCV parameters, or redemption rights by itself.

~~~mermaid
flowchart TD
 A[Goods, services, technology] --> B[Merchant utility quote]
 B --> C[Internal reference schedule]
 D[CEX or DEX observation] --> E[Venue, pair, timestamp, confidence]
 E --> F[Freshness, quorum, deviation checks]
 C --> G[Typed quote composer]
 F --> G
 G --> H[User consent and payment intent]
 H --> I[Authorized settlement adapter]
 I --> J[Network finality and readback]
 J --> K[Reconciliation and audit evidence]
 K --> L[Utility and service metrics]
 D -. observation only .-> C
~~~

The dotted edge is not an automatic price mutation. External market data is one input to a governed valuation process, not an authorization to convert or redeem.

### Core equations

1. Distributable surplus: **D_t = max(0, R_t - C_t - P_t - L_t)**. R is collected and reconciled earned revenue; C is verified operating cost; P is refunds, taxes and provisions; L is required liquidity and risk reserves. GMV is not revenue.
2. Weighted allocation: **B_i = D_t × w_i / Σw_j**. Apply eligibility before allocation, caps and vesting as specified, and deterministic largest-remainder rounding in atomic units. The conservation invariant is ΣB_i = D_t.
3. Dual-value scenario: **S = P_internal / P_external**. 314159 / 0.0314159 = 10,000,000 is arithmetic only; it does not establish a peg, target price, conversion, reserve, debt, or redemption entitlement.
4. Oracle deviation: **d = |P_new - P_ref| / P_ref**. Reject stale data, mismatched units/pairs, invalid signatures, insufficient source quorum, and deviations outside approved policy.
5. Reserve coverage: **CR = independently verified eligible reserve value after haircuts / legally redeemable liabilities**. If there are no legally redeemable liabilities, report NOT_APPLICABLE. A quote is not reserve evidence.

~~~mermaid
flowchart LR
 A[Merchant goods and services] --> B[Pi-enabled utility demand]
 B --> C[Collected and reconciled settlement]
 C --> D[Earned platform revenue]
 D --> E[Costs, refunds, taxes, provisions]
 E --> F[Liquidity and risk reserves]
 F --> G[Distributable surplus]
 G --> H[Governed ecosystem allocation]
 H --> I[More services and merchant utility]
 I --> A
~~~

This is a proposed economic feedback mechanism, not a guarantee of demand, revenue, or token appreciation.

## 4. Stellar and Pi network separation

| Network | Purpose | Local tests | Not implied |
|---|---|---|---|
| Stellar Testnet | Soroban reference development | Compile, unit tests, read-only health | Pi deployment or ledger compatibility |
| Pi Testnet | Pi-specific integration target | Network identity, RPC health, explicit gated deployment | Mainnet readiness |
| Pi Mainnet | Production network | Not targeted by this runner | No automatic production write |

Soroban source compatibility does not prove that a contract deploys unchanged to Pi. Verify the supported Pi SDK, network passphrase, protocol, RPC behavior, generated contract spec, and deployment policy against authoritative developer documentation. Use separate signer identities and endpoint profiles.

## 5. Seven conceptual layers

These colors are PiRC's proposal taxonomy, not official Pi Network protocol layers or token classes.

~~~mermaid
flowchart TB
 L1[1 Red: Governance and protocol policy]
 L2[2 Orange: Basic utility]
 L3[3 Yellow: Commerce and services]
 L4[4 Green: Payment and settlement proposals]
 L5[5 Blue: Treasury and institutional interfaces]
 L6[6 Indigo: Reserve evidence and risk]
 L7[7 Purple: Provenance and atomic accounting]
 L1 --> L2 --> L3 --> L4 --> L5 --> L6 --> L7
 L7 -. evidence and feedback .-> L1
~~~

Each layer must map to an owning repository, versioned schema, implementation path, security boundary, and test evidence.

## 6. RAW/RWA product lifecycle

~~~mermaid
stateDiagram-v2
 [*] --> Draft
 Draft --> EvidencePending
 EvidencePending --> Verified: issuer and device signatures
 EvidencePending --> Rejected: invalid evidence
 Verified --> Listed: registry approval
 Listed --> Reserved: valid payment intent
 Reserved --> Settled: network finality and reconciliation
 Settled --> Disputed: evidence challenge
 Disputed --> Suspended: trust revoked
 Disputed --> Settled: dispute resolved
 Suspended --> [*]
~~~

A physical claim must verify challenge freshness, device-key binding, issuer signature, ownership evidence, revocation status, and replay protection. An event log or boolean success response is not proof of ownership or custody.

## 7. Local evidence and PR workflow

~~~mermaid
flowchart TD
 A[Pin exact commit SHA] --> B[Run Termux validation]
 B --> C{Required checks pass?}
 C -- No --> D[Fix locally and retain failed report]
 C -- Yes --> E[Review diff and redact private data]
 E --> F[Commit report to feature branch]
 F --> G[Open PR with commands and evidence]
 G --> H[Human review and merge]
~~~

Reports must never contain environment values, seeds, private keys, authorization headers, wallet backups, or personal information. A local PASS applies only to the exact commit and recorded device/toolchain. It is not an independent security audit.

## 8. How this relates to Pi Network's vision

PiRC is an independent community engineering proposal exploring practical utility, merchant commerce, accessible application development, identity and provenance, developer tooling, and interoperable services. These themes can be compared with public Pi Network materials, but this repository is not an official Pi Core Team roadmap, endorsement, or implementation. Describe alignment in themes only where supported by a specific public source.

## 9. Non-goals and release gates

- No guaranteed GCV redemption, USD peg, yield, reserve, or cash claim.
- No automatic CEX-to-internal conversion or balance mutation.
- No real payment or transfer from the Termux runner.
- No secret retrieval, signing, automatic deployment, or Mainnet operation.
- No claim that every historical branch has been semantically extracted until the capability matrix is populated and reviewed.
- Testnet verification requires transaction hash, network identity, contract ID, code hash, initialized-state readback, and state-transition tests. Mainnet requires a separate audit, keys, approvals, and release process.
