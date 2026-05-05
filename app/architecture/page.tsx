import type { Metadata } from "next";
import { Cpu, FileCode2, GitBranch, Globe, KeyRound, Layers, ShieldCheck, Workflow } from "lucide-react";
import clsx from "clsx";
import { ARCHITECTURE_LAYERS, COLOR_CLASSES, PACKETS } from "@/lib/pirc";

export const metadata: Metadata = {
  title: "Architecture",
  description: "How the 7-layer Soroban warehouse interlocks — from Pi Testnet infrastructure up to sovereign governance.",
};

const PRINCIPLES = [
  {
    icon: Layers,
    title: "Sovereign by design",
    body: "Each color is a self-contained role: governance, reserve, register, subscribe, extend, upfront, status. Roles compose, never overlap.",
  },
  {
    icon: ShieldCheck,
    title: "Read-only orchestration",
    body: "The vFinal orchestrator inspects Horizon and Soroban RPC only. No autonomous mainnet writes, ever.",
  },
  {
    icon: KeyRound,
    title: "Secrets stay in env",
    body: "STELLAR_TESTNET_SECRET, PI_API_KEY, OMNI_SYNC_TOKEN are env-only. The /api/status endpoint surfaces presence, never values.",
  },
  {
    icon: FileCode2,
    title: "Forbid unsafe code",
    body: "Rust 2024 edition with #![forbid(unsafe_code)] in every contract. Soroban SDK v22.0. Differential + post-quantum crypto layer prepared.",
  },
];

const FLOW = [
  { label: "Pioneer authenticates", detail: "Pi App SDK / wallet" },
  { label: "Subscribe via PiRC2", detail: "do_approve allowance issued once" },
  { label: "Operator triggers batch renewal", detail: "trigger_batch_renewal()" },
  { label: "Engine charges subscribers", detail: "process(merchant, offset, limit)" },
  { label: "Bounty paid to caller", detail: "PiRC-260 keeper protocol" },
];

export default function ArchitecturePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <header className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">Architecture</p>
        <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          A sovereign 7-layer matrix on Soroban + Stellar.
        </h1>
        <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
          PiRC is organized into a stack of seven layers. Lower layers are on-chain primitives;
          higher layers are application surfaces. Every layer maps to a public contract and an
          operator-driven flow.
        </p>
      </header>

      {/* Principles */}
      <section className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {PRINCIPLES.map((p) => (
          <div key={p.title} className="rounded-xl border border-border bg-card p-5">
            <p.icon className="h-5 w-5 text-primary" aria-hidden />
            <h3 className="mt-3 text-sm font-semibold">{p.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground text-pretty">{p.body}</p>
          </div>
        ))}
      </section>

      {/* Layer stack */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight">The seven-layer stack</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Read top-down: governance is the apex; infrastructure is the floor.
        </p>

        <ol className="mt-6 space-y-3">
          {[...ARCHITECTURE_LAYERS].reverse().map((layer, i) => {
            const idx = ARCHITECTURE_LAYERS.length - 1 - i;
            return (
              <li
                key={layer.name}
                className="grid grid-cols-[3rem_1fr] items-stretch gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-[4rem_1fr_auto]"
              >
                <div className="flex flex-col items-center justify-center gap-1 rounded-md border border-border bg-muted/30 p-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">L{idx}</span>
                  <span className="font-mono text-base font-semibold text-foreground">{idx}</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold tracking-tight">{layer.name}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">{layer.summary}</p>
                </div>
                <div className="hidden items-center sm:flex">
                  <LayerIcon name={layer.name} />
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Packet matrix */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight">Packet → role map</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          The PiRC-200 series binds each color to a contract role. The same colors appear as
          chips throughout this warehouse.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...PACKETS]
            .sort((a, b) => b.index - a.index)
            .map((p) => {
              const c = COLOR_CLASSES[p.color];
              return (
                <div key={p.color} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <span className={clsx("inline-flex rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase", c.chip)}>
                      {p.color}
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">L{p.index}</span>
                  </div>
                  <h4 className="mt-3 font-semibold">{p.role}</h4>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground text-pretty">
                    {p.description}
                  </p>
                </div>
              );
            })}
        </div>
      </section>

      {/* Subscription flow */}
      <section className="mt-14">
        <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
          <Workflow className="h-5 w-5 text-primary" aria-hidden />
          PiRC2 subscription lifecycle
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Subscribers authorize once via Soroban <code className="font-mono">do_approve</code>.
          Anyone can trigger the batch renewal — the contract pays a bounty for keeping uptime.
        </p>

        <ol className="mt-6 grid gap-3 lg:grid-cols-5">
          {FLOW.map((step, i) => (
            <li key={step.label} className="relative flex h-full flex-col rounded-xl border border-border bg-card p-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">Step {i + 1}</span>
              <h4 className="mt-2 text-sm font-semibold">{step.label}</h4>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">{step.detail}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function LayerIcon({ name }: { name: string }) {
  const map: Record<string, typeof Cpu> = {
    Infrastructure: Globe,
    Protocol: Layers,
    "Smart Contract": FileCode2,
    Service: Cpu,
    Interoperability: GitBranch,
    Application: Workflow,
    Governance: ShieldCheck,
  };
  const Icon = map[name] ?? Layers;
  return <Icon className="h-5 w-5 text-muted-foreground" aria-hidden />;
}
