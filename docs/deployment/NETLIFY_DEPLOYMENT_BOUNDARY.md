# Netlify Deployment Boundary — PiRC Wealth Core

## What is deployed

The Vite frontend lives at artifacts/pirc-wealth-core and builds to artifacts/pirc-wealth-core/dist/public. The Netlify config builds from the repository root using the root pnpm workspace and lockfile.

This is a static frontend deployment. It does not deploy Soroban contracts, a signer, relayer, database or production payment backend.

## API hosting mismatch

The existing api/[...route].ts entry follows Vercel function conventions. Netlify does not automatically execute it as a Netlify Function. Until a separately hosted API origin or tested Netlify Functions adapter is configured, /api/* deliberately returns HTTP 404. This prevents API paths from silently returning SPA HTML and being mistaken for successful API responses.

Before enabling API routes, either:
- deploy the Express API separately and configure a same-origin proxy to its exact HTTPS origin; or
- implement and test a Netlify Functions adapter with explicit request/response, timeout, body-size and secret-handling behavior.

Never place PI_API_KEY in VITE_* variables. Payment credentials stay server-side.

## Netlify setup

1. Connect the PiRC repository to the intended Netlify site.
2. Set the production branch to the reviewed branch after PR merge.
3. Use the build command and publish directory in netlify.toml.
4. Confirm Node 22.14.0 and pnpm 10.8.1.
5. Do not configure payment secrets on the static frontend.
6. Verify deploy preview, asset paths and SPA navigation.
7. Confirm /api/* remains unavailable until the backend is connected.
8. After API hosting, test health, sandbox payment, product/amount mismatch, missing-key behavior and upstream failures.

## Rollback and evidence

Netlify deploys are immutable; roll back to the last known-good frontend deploy if smoke tests fail. A frontend rollback does not roll back backend, contract or chain state.

Record site name, deploy URL/ID, source SHA, build log, asset list, smoke-test result and rollback reference. A configuration PR is not proof of a live deploy.

## Static hosting hardening

The Vite public directory contains `_headers`, which Netlify copies to the publish root. It sets:
- MIME sniffing protection, clickjacking protection, a strict referrer policy and HSTS.
- A restrictive Permissions-Policy for camera, microphone and geolocation; review this if a future feature explicitly needs browser permissions.
- No-store/no-cache for the HTML entry point.
- One-year immutable caching for Vite's fingerprinted `/assets/*` output.

No Content-Security-Policy is imposed yet because the application loads the Pi SDK and other runtime dependencies; establish an explicit source inventory and test the Pi Browser flow before enforcing CSP. HSTS assumes the custom domain and all subdomains are HTTPS-only before production enablement.
