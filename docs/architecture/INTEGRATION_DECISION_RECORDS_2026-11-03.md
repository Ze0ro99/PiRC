# Integration Decision Records — 2026-11-03

## ADR-001 — Three-repository ownership
**Status:** Accepted as repository governance proposal.

PiRC owns standards, economics, schemas and acceptance criteria. SmartContracts owns Soroban behavior and tests. Unity Sphere owns application APIs, adapters, UI and operations. Cross-repo changes pin immutable refs and schema versions.

## ADR-002 — Seven colored layers are proposal taxonomy
**Status:** Accepted; Gold/Indigo unresolved.

Colors are proposal categories, not protocol layers. Shared technical planes support multiple categories. Registry migration requires a reviewed decision; no silent alias.

## ADR-003 — Integer atomic-unit settlement
**Status:** Accepted.

Settlement uses integer atomic units, explicit asset identity/scale, checked arithmetic, deterministic remainder handling and exact conservation. No floating point in authoritative monetary paths.

## ADR-004 — Fail-closed network operations
**Status:** Accepted.

No network action without explicit network identity, allowlisted contract/function, signer authorization and evidence capture. Submission is not final until network finality and readback.

## ADR-005 — Separate static frontend and API deployment
**Status:** Accepted for initial Netlify setup.

Netlify hosts Vite static frontend. Vercel catch-all is not assumed to be a Netlify Function. Until a tested API origin/adapter exists, /api/* deliberately returns 404. Secrets remain server-side.

## ADR-006 — Evidence-based capability states
**Status:** Accepted.

Use PROPOSED, SPECIFIED, IMPLEMENTED, TESTED, CI_VERIFIED, TESTNET_VERIFIED, AUDITED and MAINNET_VERIFIED only with evidence. Queued or missing CI is never passing.
