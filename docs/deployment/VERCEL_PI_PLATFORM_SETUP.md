# Vercel Pi Platform API Setup

## Runtime architecture

The Vite frontend is built from `artifacts/pirc-wealth-core`. The root `api/[...route].ts` function forwards API requests to the shared Express application in `artifacts/api-server/src/app.ts`. The Express application mounts its routes under `/api`.

## Required server-side environment variables

Configure these variables in the Vercel project that serves the PiRC Wealth Core frontend:

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `PI_API_KEY` | Required for payment operations | None | Pi Platform server API key. Store as a Vercel secret; never expose it in client-side variables. |
| `PI_PAYMENT_MODE` | Recommended | `sandbox` | Set to `sandbox` for development. Use `production` only after the Pi app and server key are approved and configured for production. |
| `PORT` | Hosting dependent | `3000` | Local Express server port. Vercel functions do not call the standalone listener. |

The application fails closed when `PI_API_KEY` is missing. It does not simulate successful approvals or completions.

## Payment safety rules

- The backend calls the official Pi Platform API at `https://api.minepi.com/v2`.
- The API key is sent only in the server-side `Authorization: Key` header.
- Before approval or completion, the backend retrieves the payment from Pi and checks its product ID and amount against a server-owned allowlist.
- Only the four fixed products in the payment service are accepted. Client-defined custom amounts are disabled until a persistent, server-owned order workflow is implemented.
- The frontend marks a payment complete only after the backend receives a successful response from Pi's completion endpoint.
- Incomplete payments are re-checked against Pi before recovery is attempted.
- Sandbox is the default. The frontend reads the configured mode from `/api/payments/config` before initializing the Pi SDK.
- Do not enable production mode until the production app registration, server key, payment catalog, and fulfillment workflow have been reviewed.

## Verification checklist

1. Confirm `/api/healthz` returns HTTP 200.
2. Confirm `/api/payments/config` returns `configured: true` without exposing the key.
3. In Sandbox, test one approved product through approval and completion.
4. Confirm unknown product IDs and amount mismatches are rejected.
5. Confirm missing keys and upstream Pi API errors never return a successful payment state.
6. Confirm the app does not unlock a product unless server-side completion succeeds.
7. Keep the Pi SDK in Sandbox until the production environment has been explicitly configured.

Official references:
- Pi Platform API: https://developers.minepi.com/docs/api-reference/PlatformAPI
- Pi Payments: https://developers.minepi.com/docs/accept-payment/Payments
- Pi SDK Reference: https://developers.minepi.com/docs/api-reference/SdkReference
