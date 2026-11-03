# AI Agent Capability and Safety Standard

**Status:** Proposed standard. **Network:** Pi Testnet only for all write-capable testing.

## Permitted default capabilities

Agents may read and summarize listings, identify duplicate catalog entries, calculate transparent indicative comparisons, detect stale quotes, reconcile ledger events, explain standards, draft governance submissions, and raise anomaly alerts.

## Prohibited autonomous actions

Agents must not autonomously:
- sign or submit transfers;
- mint, burn, freeze, or upgrade tokens;
- approve issuers, KYB, or governance proposals;
- release escrow or issue refunds;
- change a buyer-approved price or payment intent;
- bypass allowlists, spending limits, review gates, or human approvals.

## Capability envelope

Every tool invocation must be constrained by:
- agent identity and version;
- explicit capability and resource scope;
- allowed network (Testnet only);
- rate and amount limits;
- expiry and revocation state;
- human approval requirement;
- trace ID and immutable audit event.

## Secure action path

`Agent proposal -> policy engine -> deterministic validation -> human/app approval -> isolated signer -> Testnet RPC -> readback -> audit log`

The agent must never access signer secrets. The signer is a separate service with a Testnet-only key, allowlisted contract methods, transaction simulation, spending caps, and emergency revocation.

## Prompt injection and untrusted data

Treat product descriptions, QR/NFC payloads, comments, uploaded files, oracle metadata, and external API responses as untrusted input. They cannot modify agent system policy or grant new capabilities.

## Monitoring

Record model/tool version, inputs by privacy-safe hashes, policy decision, approval identity, transaction hash, result, and readback. Provide a kill switch that disables all write capabilities without disabling read-only monitoring.
