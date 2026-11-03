# PiRC Versioned Schema Registry

**Schema namespace:** `urn:pirc:schema:v1`  
**Schema dialect:** JSON Schema Draft 2020-12  
**Compatibility:** additive optional fields may be introduced in a minor revision; required-field changes, semantic changes, and enum removals require a major schema version.

## Published v1 schemas

| Schema | Purpose | Canonical file |
|---|---|---|
| Payment intent | QR/NFC bounded payment request | [payment-intent.schema.json](../../schemas/v1/payment-intent.schema.json) |
| Product valuation | Versioned product price and evidence | [product-valuation.schema.json](../../schemas/v1/product-valuation.schema.json) |
| Commerce event | Append-only cross-component lifecycle event | [commerce-event.schema.json](../../schemas/v1/commerce-event.schema.json) |
| V18 metrics report | Reproducible commerce velocity report | [v18-metrics-report.schema.json](../../schemas/v1/v18-metrics-report.schema.json) |
| Implementation evidence | Machine-readable feature, source, test, review, and deployment evidence record | [implementation-evidence.schema.json](../../schemas/v1/implementation-evidence.schema.json) |
| Payment event | Versioned payment/subscription event envelope with replay and finality references | [payment-event.schema.json](../../schemas/v1/payment-event.schema.json) |
| Economic settlement | Atomic-unit accounting result and deterministic allocation record | [economic-settlement.schema.json](../../schemas/v1/economic-settlement.schema.json) |
| Oracle observation | Signed source observation envelope with sequence and freshness fields | [oracle-observation.schema.json](../../schemas/v1/oracle-observation.schema.json) |
| Asset provenance | Issuer, origin, ownership-event, and verification-state record | [asset-provenance.schema.json](../../schemas/v1/asset-provenance.schema.json) |
| Seven-layer registry schema | Validates layer IDs, dependencies, versions, statuses, and taxonomy conflicts | [seven-layer-registry.schema.json](../../schemas/v1/seven-layer-registry.schema.json) |
| Seven-layer registry data | Canonical v1 layer records and unresolved Gold/Indigo conflict | [seven-layer-registry.v1.json](../../registries/seven-layer-registry.v1.json) |

## Validation and implementation requirements

- Producers validate payloads before signing or publishing.
- Consumers validate schema version and reject unknown critical fields.
- Monetary amounts are decimal strings of integer atomic units; never JSON floating-point numbers.
- Timestamps are RFC 3339 date-time strings in UTC unless a field explicitly documents another timezone.
- Signatures cover canonical serialization and all security-relevant fields.
- Schema validation does not replace authorization, business-rule validation, signature verification, replay protection, or chain readback.
- Do not put personal data, secrets, seed phrases or private keys in these payloads.

## Versioning

Publish a new immutable schema file for breaking changes. Keep prior versions available for historical event decoding. Each event and payment intent carries its schema version. A migration must document old-to-new field mapping and dual-read period.

## Evidence record policy

The implementation-evidence schema records immutable source references, interface identifiers, test outcomes, security-review state, and optional network readback fields. A record is a traceability aid, not an attestation: reviewers must verify every URL, commit, test result, artifact hash, transaction reference, and claimed status independently. For non-deployed features, set network evidence fields to `null`; do not invent contract IDs or transaction references.
