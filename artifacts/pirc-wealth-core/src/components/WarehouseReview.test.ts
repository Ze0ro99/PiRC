import assert from "node:assert/strict";
import test from "node:test";
import { inspectDocument } from "./WarehouseReview";

test("normalizes CRLF and extracts integration request fields", () => {
  const document = inspectDocument(
    {
      path: "docs/withdrawal-requests/integration-intake.md",
      name: "integration-intake.md",
      content: [
        "# Repository integration request",
        "Request ID: INT-42",
        "Status: Proposed",
        "Summary: Import the audited branch.",
        "Target branch: integration/sovereign-hybrid-ecosystem",
        "Scope: Documentation and tests",
        "Validation: CI evidence attached",
      ].join("\r\n"),
    },
    ["main", "integration/sovereign-hybrid-ecosystem"],
    true,
  );

  assert.equal(document.kind, "integration");
  assert.equal(document.fields.find((field) => field.label === "Request ID")?.value, "INT-42");
  assert.equal(document.fields.find((field) => field.label === "Request context")?.value, "Import the audited branch.");
  assert.equal(document.branch?.exists, true);
  assert.equal(document.branch?.listComplete, true);
});

test("classifies financial withdrawal evidence without treating it as integration", () => {
  const document = inspectDocument(
    {
      path: "docs/financial/withdrawal-request.md",
      name: "withdrawal-request.md",
      content: "Request ID: PAY-9\nAsset: PI\nAmount: 12.5\nNetwork: Pi Testnet\nDestination: GABC",
    },
    ["main"],
    true,
  );

  assert.equal(document.kind, "financial");
  assert.equal(document.fields.find((field) => field.label === "Amount")?.value, "12.5");
});

test("keeps ambiguous documents unclassified instead of inventing a category", () => {
  const document = inspectDocument(
    {
      path: "docs/requests/notes.md",
      name: "notes.md",
      content: "A note containing background information only.",
    },
    ["main"],
    false,
  );

  assert.equal(document.kind, "unclassified");
  assert.equal(document.branch, undefined);
});
