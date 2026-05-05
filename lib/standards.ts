// PiRC Standards Roster — 84 deployed standards across the Compiled Ecosystem.
// Source: Omni_Sovereign_Architecture/Compiled_Ecosystem/

export type StandardCategory =
  | "Core"
  | "DeFi"
  | "Identity"
  | "Subscriptions"
  | "Governance"
  | "RWA"
  | "Institutional"
  | "Justice"
  | "Sovereign";

export type Standard = {
  id: number;
  name: string;
  category: StandardCategory;
  status: "Deployed" | "Audited" | "Live";
  quantum: boolean;
  summary: string;
};

const IDS = [
  1, 2, 45, 100, 101, 102, 103, 105, 111, 112, 120, 121, 131, 135, 141, 151, 155,
  161, 171, 180, 181, 196, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209,
  210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225,
  226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241,
  242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255, 256, 257,
  258, 259, 260,
];

// Curated mapping for the well-known standards (others derived programmatically).
const NAMED: Record<number, Pick<Standard, "name" | "category" | "summary">> = {
  1:   { name: "Sovereign Monetary Standard",   category: "Core",          summary: "Foundational issuance contract for the PiRC reserve asset and the 7-layer packet matrix." },
  2:   { name: "Subscription Engine",           category: "Subscriptions", summary: "Recurring payments via Soroban token allowance — keeper-driven batch renewal, no re-signing." },
  45:  { name: "Treasury Anchor",               category: "Core",          summary: "Reserve treasury anchor enforcing 7-decimal precision and the 314,159 parity." },
  100: { name: "Unified System",                category: "Core",          summary: "Unified system contract binding the colored packets to the master issuer surface." },
  101: { name: "Sovereign Monetary Layer-1",    category: "Core",          summary: "Layer-1 monetary semantics: mint, burn, allowance, transfer, with quorum hooks." },
  102: { name: "Reserve Vault",                 category: "DeFi",          summary: "Reserve vault contract with parameterized collateralization and emergency halt." },
  103: { name: "AMM Engine",                    category: "DeFi",          summary: "Constant-product AMM tuned for low-slippage Pi Cash routing." },
  105: { name: "Liquidity Router",              category: "DeFi",          summary: "Multi-hop router across PiRC pools with deterministic price oracles." },
  111: { name: "Identity Anchor",               category: "Identity",      summary: "Self-sovereign identity anchor — KYC and attestation rooting." },
  112: { name: "Reputation Graph",              category: "Identity",      summary: "Edge-weighted reputation graph used by governance and lending." },
  120: { name: "Governance Quorum",             category: "Governance",    summary: "RED-layer quorum and quadratic-vote tabulation contract." },
  121: { name: "Upgrade Authority",             category: "Governance",    summary: "Time-locked upgrade authority for protocol parameters." },
  131: { name: "Subscription Registry",         category: "Subscriptions", summary: "Merchant + service registry behind the YELLOW Subscribe lane." },
  135: { name: "Recurring Allowance",           category: "Subscriptions", summary: "do_approve allowance pattern with bounded charge windows." },
  141: { name: "Pay-Upfront Lane",              category: "Subscriptions", summary: "Atomic prepayment of N billing periods in a single allowance." },
  151: { name: "Physical RWA Bridge",           category: "RWA",           summary: "Bridge for physical real-world-asset attestations." },
  155: { name: "RWA Custody",                   category: "RWA",           summary: "Custody contract for tokenized physical assets." },
  161: { name: "Institutional KYC",             category: "Institutional", summary: "Institutional onboarding with multi-jurisdiction attestations." },
  171: { name: "Compliance Hooks",              category: "Institutional", summary: "Pre-trade and post-trade compliance hooks." },
  180: { name: "Audit Trail",                   category: "Sovereign",     summary: "Immutable audit trail anchoring critical state transitions." },
  181: { name: "Telemetry Beacon",              category: "Sovereign",     summary: "Read-only telemetry beacon for orchestrator state." },
  196: { name: "Quantum Audit Surface",         category: "Sovereign",     summary: "Post-quantum audit surface with verifiable randomness." },
  199: { name: "Capstone Manifest",             category: "Sovereign",     summary: "Capstone manifest contract sealing the v2.0 ecosystem." },
  200: { name: "Raw Record Factory",            category: "Sovereign",     summary: "Factory pattern for deploying immutable raw record contracts." },
  201: { name: "Sovereign Registry",            category: "Sovereign",     summary: "Global product registry mapping product ID to contract address." },
  202: { name: "Divine Justice — Identity",     category: "Justice",       summary: "Identity layer for the Divine Justice System (KYC + voice fallback)." },
  203: { name: "Divine Justice — Assets",       category: "Justice",       summary: "Asset aggregation across wallet + real-world holdings." },
  204: { name: "Divine Justice — Debts",        category: "Justice",       summary: "Priority settlement of outstanding obligations." },
  205: { name: "Divine Justice — Religion",     category: "Justice",       summary: "Rulepack engine for religious / legal jurisprudence." },
  206: { name: "Divine Justice — Governance",   category: "Justice",       summary: "Review and voting layer for distribution proposals." },
  207: { name: "Divine Justice — Execution",    category: "Justice",       summary: "Smart-contract execution surface for inheritance and zakat." },
  208: { name: "Divine Justice — Audit",        category: "Justice",       summary: "Cryptographic + immutable audit layer for the DJS." },
};

const CATEGORY_FALLBACK = (id: number): StandardCategory => {
  if (id < 100) return "Core";
  if (id < 110) return "DeFi";
  if (id < 120) return "Identity";
  if (id < 150) return "Subscriptions";
  if (id < 170) return "RWA";
  if (id < 200) return "Institutional";
  if (id <= 209) return "Sovereign";
  if (id <= 230) return "Justice";
  return "Sovereign";
};

export const STANDARDS: Standard[] = IDS.map((id) => {
  const named = NAMED[id];
  return {
    id,
    name: named?.name ?? `PiRC-${id}`,
    category: named?.category ?? CATEGORY_FALLBACK(id),
    status: "Deployed",
    quantum: true,
    summary:
      named?.summary ??
      `Compiled-ecosystem standard ${id}. Soroban Rust contract integrated into the sovereign telemetry surface.`,
  };
});

export const CATEGORIES: StandardCategory[] = [
  "Core",
  "DeFi",
  "Identity",
  "Subscriptions",
  "Governance",
  "RWA",
  "Institutional",
  "Justice",
  "Sovereign",
];

export function categoryColor(c: StandardCategory): string {
  switch (c) {
    case "Core":          return "var(--color-layer-gold)";
    case "DeFi":          return "var(--color-layer-green)";
    case "Identity":      return "var(--color-layer-blue)";
    case "Subscriptions": return "var(--color-layer-yellow)";
    case "Governance":    return "var(--color-layer-red)";
    case "RWA":           return "var(--color-layer-orange)";
    case "Institutional": return "var(--color-layer-blue)";
    case "Justice":       return "var(--color-layer-purple)";
    case "Sovereign":     return "var(--color-primary)";
  }
}
