# External Component Compatibility and Integration Matrix

**Status:** Evidence-based integration plan. This document is not an endorsement, partnership statement, or certification by Pi Network, Pi Desktop, SoloHost, or Hermes maintainers.

## 1. Scope and source boundaries

| Component | Public source | Observed repository evidence | PiRC integration role | Current status |
|---|---|---|---|---|
| PiRC | Ze0ro99/PiRC | Standards, architecture, economics, schemas and release workflows | Normative project specification and integration registry | Project-owned |
| SmartContracts | Ze0ro99/SmartContracts | Rust/Soroban contract workspace and reference modules | Contract implementation of versioned PiRC standards | Project-owned; contract-by-contract verification required |
| Unity Sphere | Ze0ro99/project-unity-sphere-0e2c810d | Application/UI and API workspace | Consumer of schemas, APIs and contract interfaces | Project-owned; feature status must be evidenced |
| SoloHost | pi-node/solohost | Agent Skill for producing docker-compose.yml and config_options.yml packages from already-published public images; v0 contract and validator | Optional distribution/install target for a packaged PiRC application | Read-only reference; package not yet published |
| Pi node / Pi Desktop reference | pi-node/pi-node | Default-branch README currently contains only “Latest version: 0.5.4” | Version/provenance reference only; not a complete Desktop API specification | Insufficient public evidence for 0.6.4 compatibility |
| Hermes package example | SoloHost skills/solohost-package/examples/hermes | Multi-service Compose example, Web UI primary label, loopback ports, named volumes, optional Docker Model Runner | Reference pattern for a future multi-service SoloHost package | Example only; not an endorsement or a PiRC dependency |

The team-provided target context is **Pi Desktop 0.6.4**. The public pi-node/pi-node README inspected for this integration note reports **0.5.4**. These version references differ and must not be silently reconciled. Record the exact installed Desktop build, runtime and platform from the target machine before claiming compatibility.

## 2. SoloHost package contract

SoloHost's current public v0 contract describes a content-based package with two files:

- docker-compose.yml: references already-published public container images; Desktop pulls images and does not build them.
- config_options.yml: declares the installer form and writes operator values to an output file such as .env.

Important current contract requirements include:
- A non-empty services map and an image for every service.
- Exactly one service surfaced as the UI service with pi.ui.primary: "true".
- Exactly one loopback-bound published port on the UI service in 127.0.0.1:HOST:CONTAINER form.
- Every Compose variable interpolation must be declared by a form field or fixed_values entry.
- No build directives; no privileged mode, added capabilities, unsafe host mounts, host networking, host namespaces, or file-backed secrets/configs.
- Prefer version-pinned image tags and named volumes; avoid mutable latest tags.
- Local model use through Docker Model Runner requires it to be enabled on the host and clearly disclosed in the install form.

The full current contract is authoritative over this summary. Fetch and revalidate it before generating a package because SoloHost may change its enforced rules.

## 3. Hermes example: safe interpretation

The SoloHost Hermes example demonstrates:
- A separate agent gateway and Web UI service.
- A single pi.ui.primary Web UI service.
- Loopback-published host ports mapped to the actual container ports.
- Named volumes instead of host bind mounts.
- Optional Docker Model Runner integration and cloud-provider configuration.

It is a reference package, not the Hermes source of truth and not proof that a PiRC build has been packaged, installed, or tested. A PiRC package must be derived from the actual PiRC application image and its documented runtime contract, not copied from the Hermes example.

## 4. Compatibility evidence required for Pi Desktop 0.6.4

Before status can advance from PREPARATION, capture:
1. Exact Pi Desktop 0.6.4 build identifier, operating system, CPU architecture and Docker/Compose versions.
2. SoloHost installer/package schema revision and validator result.
3. Public immutable image reference and image digest for every service.
4. Compose validation output and proof that only one service is marked as the UI primary.
5. Port binding, health endpoint and embedded UI launch result.
6. Install-form variable coverage: every interpolated variable is declared; secret fields preserve existing values when blank.
7. Persistence/restart/uninstall behavior and named-volume ownership.
8. Network egress, filesystem, process, credential and signing-capability review.
9. Test logs with secrets redacted, timestamped test report and independent reviewer.

Never grant a package wallet signing, private-key, treasury, issuer, production deployment, or arbitrary host filesystem privileges to demonstrate UI compatibility.

## 5. State machine

PREPARATION → PACKAGE_VALIDATED → INSTALLED_TESTED → COMPATIBILITY_REVIEWED

A state transition requires its evidence artifact. Missing or inaccessible evidence keeps the status at the previous state. A passing YAML validator alone does not prove that the image is pullable, that the app starts, that the UI embeds, or that Pi Desktop 0.6.4 is compatible.

## 6. Minimal-cost validation policy

- On documentation/schema changes: run the standard-library Python schema and local-link validator.
- On API changes: run the targeted API safety smoke workflow.
- On frontend/backend workspace or lockfile changes: run install, typecheck and build.
- On contract source/toolchain changes in the SmartContracts repository: run that repository's Rust formatting, tests and relevant WASM build; do not run these on docs-only PiRC changes.
- Run full cross-repository compatibility tests only when a versioned interface, schema, contract ABI, network adapter, or release candidate changes.
- Keep expensive deployment, external image pulls, full model downloads, and Testnet/Mainnet actions manual or explicitly approved.

## 7. Reference sources

- https://github.com/pi-node/solohost
- https://github.com/pi-node/solohost/blob/main/skills/solohost-package/SKILL.md
- https://github.com/pi-node/solohost/blob/main/skills/solohost-package/references/contract.md
- https://github.com/pi-node/solohost/blob/main/skills/solohost-package/references/config-options.md
- https://github.com/pi-node/solohost/tree/main/skills/solohost-package/examples/hermes
- https://github.com/pi-node/pi-node
