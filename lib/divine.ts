// Divine Justice System — port of the deterministic engines under PiRC_divine_justice/core
// Sources:
//   PiRC_divine_justice/core/zakat/advancedZakat.js
//   PiRC_divine_justice/core/inheritance/islamicEngine.js
//   PiRC_divine_justice/raw/immutable_records/chain.js

export type DJSLayer = {
  index: number;
  key: "identity" | "asset" | "debt" | "religion" | "governance" | "execution" | "audit";
  name: string;
  summary: string;
  source: string;
};

export const DJS_LAYERS: DJSLayer[] = [
  { index: 1, key: "identity",   name: "Identity",   summary: "KYC, biometrics, voice fallback. Anchors the petitioner to a sovereign identity.", source: "core/identity/voiceAuth.js" },
  { index: 2, key: "asset",      name: "Asset",      summary: "Wallet + real-world aggregation. Establishes the full estate before any distribution.", source: "core/assets/minorVault.js" },
  { index: 3, key: "debt",       name: "Debt",       summary: "Priority settlement. Outstanding obligations are settled before heirs receive shares.", source: "core/inheritance/fullEngine.js" },
  { index: 4, key: "religion",   name: "Religion",   summary: "Deterministic rulepacks. Quranic shares applied with hierarchical exclusion logic.", source: "core/inheritance/islamicEngine.js" },
  { index: 5, key: "governance", name: "Governance", summary: "Review + voting. Disputes escalate to the governance quorum for human-in-the-loop signing.", source: "core/governance/fullGovernance.js" },
  { index: 6, key: "execution",  name: "Execution",  summary: "Smart-contract execution. Finalized distributions are sealed on Soroban via the Raw Factory.", source: "contracts/Inheritance.sol" },
  { index: 7, key: "audit",      name: "Audit",      summary: "Cryptographic + immutable record chain. Each event is hashed and linked to the previous record.", source: "raw/immutable_records/chain.js" },
];

export type Heir = { name: string; type: "wife" | "mother" | "father" | "son" | "daughter" };

export type HeirShare = Heir & { share: number };

// Faithful port of calculateIslamicFull from islamicEngine.js
export function calculateIslamicShares(estate: number, heirs: Heir[]): HeirShare[] {
  let remaining = estate;
  let result: HeirShare[] = [];

  const hasSon = heirs.some((h) => h.type === "son");

  const wife = heirs.find((h) => h.type === "wife");
  if (wife) {
    const share = hasSon ? estate * (1 / 8) : estate * (1 / 4);
    result.push({ ...wife, share });
    remaining -= share;
  }

  const mother = heirs.find((h) => h.type === "mother");
  if (mother) {
    const share = estate * (1 / 6);
    result.push({ ...mother, share });
    remaining -= share;
  }

  const father = heirs.find((h) => h.type === "father");
  if (father) {
    result.push({ ...father, share: remaining });
    remaining = 0;
  }

  const children = heirs.filter((h) => h.type === "son" || h.type === "daughter");
  if (children.length > 0) {
    const totalWeight = children.reduce((s, c) => s + (c.type === "son" ? 2 : 1), 0);
    children.forEach((c) => {
      const w = c.type === "son" ? 2 : 1;
      const share = (remaining * w) / totalWeight;
      result.push({ ...c, share });
    });
    remaining = 0;
  }

  return result;
}

// Faithful port of calculateAdvancedZakat from advancedZakat.js
export function calculateZakat(input: {
  cash: number;
  gold: number;
  investments: number;
  debts: number;
}): number {
  const total = input.cash + input.gold + input.investments - input.debts;
  if (total <= 0) return 0;
  return total * 0.025;
}

// Audit chain — ported from raw/immutable_records/chain.js, with a deterministic hash.
export type RawRecord = {
  index: number;
  prevHash: string | null;
  hash: string;
  timestamp: number;
  type: string;
  payload: Record<string, unknown>;
};

// Lightweight non-cryptographic hash for client-side previewing.
// (The on-chain audit layer uses Soroban's keccak; this preview is for UI only.)
export function djbHash(str: string): string {
  let h = 5381n;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5n) + h) + BigInt(str.charCodeAt(i));
    h &= 0xffffffffffffffffn;
  }
  return "0x" + h.toString(16).padStart(16, "0");
}

export function appendRawRecord(
  prev: RawRecord[],
  type: string,
  payload: Record<string, unknown>,
): RawRecord[] {
  const index = prev.length;
  const prevHash = index > 0 ? prev[index - 1].hash : null;
  const timestamp = Date.now();
  const body = JSON.stringify({ index, prevHash, type, payload, timestamp });
  const hash = djbHash(body);
  return [...prev, { index, prevHash, hash, timestamp, type, payload }];
}
