# SoloHost Package and Pi Desktop Compatibility Gate

**Current state: PREPARATION / NOT RUNTIME-VERIFIED.**

The machine-readable preparation profile is `packaging/solohost/compatibility-profile.json`. Its static guard is `scripts/validate_solohost_profile.py`. Run:

```sh
python scripts/validate_solohost_profile.py
```

This validates the evidence contract and privileged-capability denylist only. It does **not** install SoloHost, launch Pi Desktop, or prove compatibility.

## Required runtime evidence

Before changing the profile to TESTED, an operator must record:
- exact Pi Desktop 0.6.4 build ID, platform, architecture, and SHA-256 checksum;
- SoloHost and Hermes source/version references and verified checksums;
- install/package command, runtime versions, and environment;
- version-negotiation, least-privilege, malformed-input, expiry, replay, timeout, restart, and secret-redaction test results;
- logs and test report hashes, with secrets redacted.

VERIFIED additionally requires independent reviewer identity and timestamp. A missing build, package, checksum, test report, or reviewer keeps the state at PREPARATION or BLOCKED.

## Packaging boundary

SoloHost and Hermes remain external, read-only references. This repository does not claim they have been vendored, packaged, installed, or deployed. Do not include private keys, seed phrases, production credentials, or unrestricted signing capabilities. Start with a sandboxed, read-only capability profile; privileged operations require separate threat modeling and explicit authorization.

The public pi-node README has been reported in this integration context as identifying a different version from the team-provided 0.6.4 target. Resolve version identity with an exact build artifact and runtime evidence; do not infer compatibility from version labels alone.
