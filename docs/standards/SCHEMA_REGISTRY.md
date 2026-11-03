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
