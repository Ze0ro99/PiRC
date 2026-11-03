# Pi Testnet Network Profile

**Status:** Integration profile; verify live network identity before deployment.  
**Target:** Pi Testnet (project alias: Testnet1).  
**Production:** Mainnet deployment is disabled by policy.

## Canonical endpoints

- Horizon: `https://api.testnet.minepi.com`
- Soroban RPC: `https://rpc.testnet.minepi.com`

Treat these as configured endpoint references, not proof that a particular deployment is connected correctly. At process startup and before every deployment, query the network and verify the expected network passphrase, chain/network identity, protocol version, and RPC health against the official Pi developer documentation and live responses. Fail closed on mismatch.

## Required environment variables

| Variable | Purpose | Secret? |
|---|---|---|
| `PI_NETWORK` | Must be `testnet` for this profile | No |
| `PI_HORIZON_URL` | Testnet Horizon endpoint | No |
| `PI_SOROBAN_RPC_URL` | Testnet Soroban endpoint | No |
| `PI_NETWORK_PASSPHRASE` | Exact network passphrase fetched/verified from authoritative source | Treat as configuration |
| `PI_PROTOCOL_EXPECTED` | Expected protocol compatibility, initially v28 | No |
| `PI_CONTRACT_ID_*` | Testnet contract instance identifiers | No |
| `PI_SIGNER_PROVIDER` | Name of isolated signing service | No |
| `PI_SIGNER_CREDENTIAL_REF` | Reference to secret-manager item, never secret value | Yes/reference |
| `PI_DEPLOYMENT_ALLOWLIST` | Explicit list of deployable contract packages | No |

Never hardcode a guessed passphrase. Do not copy Mainnet values into Testnet configuration. Do not store seeds or private keys in repository files, CI output, QR/NFC payloads, agent prompts, or logs.

## Startup guard

The application MUST:
1. Require `PI_NETWORK=testnet`.
2. Require HTTPS endpoints from the approved host allowlist.
3. Query Horizon and Soroban health.
4. Verify network passphrase and protocol compatibility from trusted configuration and live network data.
5. Verify contract ID network association and read back contract metadata/code hash where supported.
6. Abort writes and deployments if any check fails.

## Deployment guard

Testnet deployment scripts must require an explicit package allowlist, reproducible WASM artifact hash, expected network passphrase, signer capability scoped to Testnet, and a recorded operator approval. Never iterate over every Cargo package and deploy automatically.

## Mainnet readiness (not activation)

A future Mainnet profile must be a separate configuration and separate approval workflow. It must not be selectable by changing one environment variable in a public preview. Require independent security audit, team approval, contract verification, legal/compliance review where applicable, key ceremony, rollback/incident plan, and explicit release authorization.
