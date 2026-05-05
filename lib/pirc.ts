// Single source of truth for PiRC public on-chain identifiers.
// All values are PUBLIC and safe to commit. Secrets live only in environment variables.

export const PIRC = {
  master_issuer: "GA3ECRFJ6SO5BW6NEIKW3ACJXNG5UNBTLRRXWC742NHUEDV6KL3RNEN6",
  pirc2_subscription: "CCUF75B6W3HRJTJD6O7OXNI72HGJ7DERZ5MUNOMFMSK23ME5GUIKPFYV",
  horizon: process.env.STELLAR_HORIZON_URL || "https://api.testnet.minepi.com",
  soroban: process.env.SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org:443",
  network: process.env.NETWORK || "TESTNET",
} as const;

export type LayerColor =
  | "RED" | "ORANGE" | "YELLOW" | "GREEN" | "BLUE" | "PURPLE" | "GOLD";

export type Packet = {
  index: number;
  color: LayerColor;
  role: string;
  contract: string;
  description: string;
  pi_explorer: string;
  stellar_expert: string;
};

const explorerPi = (id: string) =>
  `https://api.testnet.minepi.com/contract/${id}`;
const explorerStellar = (id: string) =>
  `https://stellar.expert/explorer/testnet/contract/${id}`;

export const PACKETS: Packet[] = [
  {
    index: 6,
    color: "RED",
    role: "Governance",
    contract: "CC6WMAHKOPWY6HW46VNKTAV4DZZLRTTNMYLDEKCAICQGMCWV5PZYNTBO",
    description:
      "Sovereign governance layer. Controls protocol parameters, upgrade authority, and quorum-based decisions across the 7-layer matrix.",
    pi_explorer: explorerPi("CC6WMAHKOPWY6HW46VNKTAV4DZZLRTTNMYLDEKCAICQGMCWV5PZYNTBO"),
    stellar_expert: explorerStellar("CC6WMAHKOPWY6HW46VNKTAV4DZZLRTTNMYLDEKCAICQGMCWV5PZYNTBO"),
  },
  {
    index: 5,
    color: "GREEN",
    role: "Pi Cash",
    contract: "CBPG33E7RUX6MGU65IMM4HXCAGLA4OZRBOUWKQSBTIZWE2RD52VGWDT4",
    description:
      "Official ecosystem currency for P2P and merchant use. Issued by the master issuer with 7-decimal precision.",
    pi_explorer: explorerPi("CBPG33E7RUX6MGU65IMM4HXCAGLA4OZRBOUWKQSBTIZWE2RD52VGWDT4"),
    stellar_expert: explorerStellar("CBPG33E7RUX6MGU65IMM4HXCAGLA4OZRBOUWKQSBTIZWE2RD52VGWDT4"),
  },
  {
    index: 4,
    color: "BLUE",
    role: "Extend",
    contract: "CAMSQZTSCTF3MG4UEIAWKRZNSX7LLKGKXMVBEQO2ETVPGS3CINM7JBQD",
    description:
      "Extension surface for the subscription lifecycle — renewal windows, grace periods, and operator-driven extensions.",
    pi_explorer: explorerPi("CAMSQZTSCTF3MG4UEIAWKRZNSX7LLKGKXMVBEQO2ETVPGS3CINM7JBQD"),
    stellar_expert: explorerStellar("CAMSQZTSCTF3MG4UEIAWKRZNSX7LLKGKXMVBEQO2ETVPGS3CINM7JBQD"),
  },
  {
    index: 3,
    color: "ORANGE",
    role: "Register",
    contract: "CB7T6TDSZ5B2MQI7NI4EG6ZASYPRMJ3XVUWS6BON4Z64OBMUJ4ZD6GKF",
    description:
      "Registry of merchants, services, and subscription products. Backbone for the PiRC2 subscription flow.",
    pi_explorer: explorerPi("CB7T6TDSZ5B2MQI7NI4EG6ZASYPRMJ3XVUWS6BON4Z64OBMUJ4ZD6GKF"),
    stellar_expert: explorerStellar("CB7T6TDSZ5B2MQI7NI4EG6ZASYPRMJ3XVUWS6BON4Z64OBMUJ4ZD6GKF"),
  },
  {
    index: 2,
    color: "YELLOW",
    role: "Subscribe",
    contract: "CANLSQUPUZYKE3S2HAIGXAHMOQWE4FVX5DS7GTL42BVKSNHLFVMQSDFF",
    description:
      "Subscriber-facing entry point. Issues allowance via Soroban do_approve so subscribers do not re-sign each charge.",
    pi_explorer: explorerPi("CANLSQUPUZYKE3S2HAIGXAHMOQWE4FVX5DS7GTL42BVKSNHLFVMQSDFF"),
    stellar_expert: explorerStellar("CANLSQUPUZYKE3S2HAIGXAHMOQWE4FVX5DS7GTL42BVKSNHLFVMQSDFF"),
  },
  {
    index: 1,
    color: "GOLD",
    role: "Status",
    contract: "CD3UAUN4FU3VHPMLOZWFQWJ2UBUUBBD37SZ7WBEGJQACJ7YF6QVE2SYG",
    description:
      "PiRC Reserve Asset (GOLD) — primary reserve currency anchored to a parity of 314,159 with 7-decimal precision.",
    pi_explorer: explorerPi("CD3UAUN4FU3VHPMLOZWFQWJ2UBUUBBD37SZ7WBEGJQACJ7YF6QVE2SYG"),
    stellar_expert: explorerStellar("CD3UAUN4FU3VHPMLOZWFQWJ2UBUUBBD37SZ7WBEGJQACJ7YF6QVE2SYG"),
  },
  {
    index: 0,
    color: "PURPLE",
    role: "Pay Upfront",
    contract: "CCGEMIEAZFJSBTRL5VGJJAUGPJI3B7UQ3BTAB2OQGW73JMWLS57YVVA4",
    description:
      "Upfront-payment lane. Lets subscribers prepay one or many billing periods atomically with a single allowance.",
    pi_explorer: explorerPi("CCGEMIEAZFJSBTRL5VGJJAUGPJI3B7UQ3BTAB2OQGW73JMWLS57YVVA4"),
    stellar_expert: explorerStellar("CCGEMIEAZFJSBTRL5VGJJAUGPJI3B7UQ3BTAB2OQGW73JMWLS57YVVA4"),
  },
];

export const ARCHITECTURE_LAYERS = [
  {
    name: "Infrastructure",
    summary: "Pi Testnet (Stellar) + Soroban RPC. Horizon for accounts, RPC for ledgers.",
  },
  {
    name: "Protocol",
    summary: "7-layer packet matrix. Each color is a sovereign role in the monetary stack.",
  },
  {
    name: "Smart Contract",
    summary: "Soroban SDK v22.0, Rust 2024 edition, forbid(unsafe_code) across all contracts.",
  },
  {
    name: "Service",
    summary: "Read-only orchestrator + serverless status endpoints. No autonomous mainnet writes.",
  },
  {
    name: "Interoperability",
    summary: "Differential engineering layer with post-quantum encryption matrix prepared.",
  },
  {
    name: "Application",
    summary: "Subscription portal, dashboard, and developer hub running on Vercel.",
  },
  {
    name: "Governance",
    summary: "RED layer — quorum-based control of protocol parameters and upgrade authority.",
  },
] as const;

export const COLOR_CLASSES: Record<LayerColor, { ring: string; chip: string; dot: string; text: string }> = {
  RED:    { ring: "ring-[var(--color-layer-red)]/40",    chip: "bg-[var(--color-layer-red)]/10 text-[var(--color-layer-red)] border-[var(--color-layer-red)]/30",    dot: "bg-[var(--color-layer-red)]",    text: "text-[var(--color-layer-red)]" },
  ORANGE: { ring: "ring-[var(--color-layer-orange)]/40", chip: "bg-[var(--color-layer-orange)]/10 text-[var(--color-layer-orange)] border-[var(--color-layer-orange)]/30", dot: "bg-[var(--color-layer-orange)]", text: "text-[var(--color-layer-orange)]" },
  YELLOW: { ring: "ring-[var(--color-layer-yellow)]/40", chip: "bg-[var(--color-layer-yellow)]/10 text-[var(--color-layer-yellow)] border-[var(--color-layer-yellow)]/30", dot: "bg-[var(--color-layer-yellow)]", text: "text-[var(--color-layer-yellow)]" },
  GREEN:  { ring: "ring-[var(--color-layer-green)]/40",  chip: "bg-[var(--color-layer-green)]/10 text-[var(--color-layer-green)] border-[var(--color-layer-green)]/30",  dot: "bg-[var(--color-layer-green)]",  text: "text-[var(--color-layer-green)]" },
  BLUE:   { ring: "ring-[var(--color-layer-blue)]/40",   chip: "bg-[var(--color-layer-blue)]/10 text-[var(--color-layer-blue)] border-[var(--color-layer-blue)]/30",   dot: "bg-[var(--color-layer-blue)]",   text: "text-[var(--color-layer-blue)]" },
  PURPLE: { ring: "ring-[var(--color-layer-purple)]/40", chip: "bg-[var(--color-layer-purple)]/10 text-[var(--color-layer-purple)] border-[var(--color-layer-purple)]/30", dot: "bg-[var(--color-layer-purple)]", text: "text-[var(--color-layer-purple)]" },
  GOLD:   { ring: "ring-[var(--color-layer-gold)]/40",   chip: "bg-[var(--color-layer-gold)]/10 text-[var(--color-layer-gold)] border-[var(--color-layer-gold)]/30",   dot: "bg-[var(--color-layer-gold)]",   text: "text-[var(--color-layer-gold)]" },
};

export function shortenAddress(addr: string, head = 6, tail = 6): string {
  if (!addr) return "";
  if (addr.length <= head + tail + 3) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}
