# PiRC v3.0 Unified Monorepo Architecture

## Overview
This is a consolidated Rust + TypeScript monorepo housing the complete PiRC protocol ecosystem:
- **Contracts**: Soroban smart contracts (Rust, WASM)
- **Backend**: Node.js validation gateway (Express.js)
- **Frontend**: Web UI for dashboards and monitoring

## Directory Structure
```
pirc/
├── Cargo.toml                    # Root workspace definition
├── tsconfig.json                 # Unified TypeScript configuration
├── contracts/                    # Soroban smart contracts
│   ├── pirc-justice-engine/
│   ├── pirc-master-registry/
│   └── ...
├── PiRC/
│   ├── apps/
│   │   ├── backend/             # Express.js telemetry gateway
│   │   │   ├── package.json
│   │   │   └── index.js
│   │   └── frontend/            # Web dashboard (Vite)
│   ├── pirc-unified-hub/        # Shared types & utilities
│   └── Cargo.toml               # Contract workspace
└── docs/                         # Protocol documentation
```

## Build Instructions

### Prerequisites
- Node.js >= 18.0.0
- Rust 1.70+ with `wasm32-unknown-unknown` target
- `soroban-cli` (for contract deployment)

### Setup
```bash
# Install dependencies
cd PiRC
npm install
cd apps/backend && npm install
cd ../frontend && npm install

# Build Rust contracts
cargo build --target wasm32-unknown-unknown --release

# Build TypeScript
cd apps/frontend && npm run build
```

### Development
```bash
# Start backend telemetry gateway
cd PiRC/apps/backend
npm run dev

# Start frontend in another terminal
cd PiRC/apps/frontend
npm run dev
```

## Branch Strategy

### Main Tier
- **`main`** (Protected): Production-ready code
  - Direct deployment to Vercel production environment
  - Requires passing CI/CD checks
  - Only accept squashed PRs from staging

### Staging Tier
- **`staging`** (Integration): Pre-release testing ground
  - Preview deployments to Vercel staging
  - Integration point for feature branches
  - Automated testing required

### Feature Tier
- **`feature/*`** (Short-lived): Individual feature development
  - Example: `feature/wcf-calculation-fix`
  - Delete after merging to staging
  - Never merge directly to main

## Configuration Management

### Environment Variables
Create `.env` files for each environment:

**Backend (.env)**
```
NODE_ENV=development
PORT=3001
LOVABLE_WEBHOOK_SECRET=<your-secret-here>
```

**Frontend (.env.local)**
```
VITE_BACKEND_URL=http://localhost:3001
VITE_SOROBAN_RPC=https://soroban-testnet.stellar.org
```

## Phase 3: Webhook Integration

The backend includes a `/telemetry` endpoint for transmitting:
- `circuit_breaker_status` (Boolean)
- `active_wcf_weight` (Float)
- `total_tokenized_rwa_units` (Integer)
- `system_timestamp` (Epoch)

All payloads are signed with `X-Hub-Signature-256` HMAC-SHA256.

## Rust Edition & Dependencies

All Cargo projects now standardized on:
- **Edition**: 2021
- **Soroban SDK**: 26.0.1
- **Target**: wasm32-unknown-unknown

Child contracts inherit configuration via `[workspace.dependencies]`.

## TypeScript Configuration

Root `tsconfig.json` defines:
- **Target**: ES2022
- **Module Resolution**: bundler
- **Path Aliases**:
  - `@contracts/*` → `contracts/`
  - `@backend/*` → `apps/backend/`
  - `@shared/*` → `pirc-unified-hub/src/`

## CI/CD Pipeline

Vercel will automatically:
1. Install dependencies
2. Run tests (if configured)
3. Build Rust contracts to WASM
4. Compile TypeScript
5. Deploy to preview/production

## Support & Documentation

See `/docs` for:
- PiRC-101 Economic Framework
- Smart Contract API reference
- RWA Tokenization standards
- Webhook payload specifications
