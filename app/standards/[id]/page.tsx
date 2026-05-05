import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Github, Hash, ShieldCheck } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { STANDARDS, categoryColor } from "@/lib/standards";

export function generateStaticParams() {
  return STANDARDS.map((s) => ({ id: String(s.id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = STANDARDS.find((x) => String(x.id) === id);
  if (!s) return { title: "Standard not found — PiRC" };
  return {
    title: `PiRC-${s.id} · ${s.name} — PiRC Warehouse`,
    description: s.summary,
  };
}

export default async function StandardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const s = STANDARDS.find((x) => String(x.id) === id);
  if (!s) notFound();

  const path = `Omni_Sovereign_Architecture/Compiled_Ecosystem/pirc_${s.id}`;
  const ghBase = `https://github.com/Ze0ro99/PiRC/tree/main/${path}`;
  const color = categoryColor(s.category);

  // Synthesized but realistic Soroban contract scaffold for this ID.
  const scaffold = `#![no_std]
#![forbid(unsafe_code)]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env};

#[contract]
pub struct PiRC${s.id}Contract;

#[contractimpl]
impl PiRC${s.id}Contract {
    /// Invoke the ${s.name} layer for the calling sovereign address.
    pub fn invoke_layer(env: Env, caller: Address) -> bool {
        caller.require_auth();
        env.events().publish((symbol_short!("PIRC"), symbol_short!("INVOKE")), (${s.id}u32, caller));
        true
    }
}
`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <Link
        href="/standards"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back to Standards Library
      </Link>

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em]"
            style={{
              borderColor: `color-mix(in oklab, ${color} 35%, transparent)`,
              color,
              background: `color-mix(in oklab, ${color} 10%, transparent)`,
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} aria-hidden />
            {s.category}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/[0.08] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            <ShieldCheck className="h-3 w-3" aria-hidden /> {s.status} · Quantum audited
          </span>
        </div>
        <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          PiRC-{s.id} · {s.name}
        </h1>
        <p className="mt-3 max-w-3xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          {s.summary}
        </p>
      </header>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <Meta label="Identifier" value={`PiRC-${s.id}`} icon={Hash} mono />
        <Meta label="Category" value={s.category} />
        <Meta label="Status" value={s.status} />
      </div>

      <section className="mt-8 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Repository path
          </h2>
          <CopyButton value={path} label="copy" />
        </div>
        <code className="mt-2 block break-all font-mono text-sm">{path}</code>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={ghBase}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-1.5 text-xs hover:bg-muted"
          >
            <Github className="h-3.5 w-3.5" aria-hidden /> Source on GitHub <ExternalLink className="h-3 w-3" aria-hidden />
          </a>
          <a
            href={`${ghBase}/src/lib.rs`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-1.5 text-xs hover:bg-muted"
          >
            lib.rs <ExternalLink className="h-3 w-3" aria-hidden />
          </a>
          <a
            href={`${ghBase}/Cargo.toml`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-1.5 text-xs hover:bg-muted"
          >
            Cargo.toml <ExternalLink className="h-3 w-3" aria-hidden />
          </a>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Soroban scaffold (lib.rs)
          </h2>
          <CopyButton value={scaffold} label="copy contract" />
        </div>
        <pre className="overflow-x-auto rounded-md border border-border bg-background/60 p-4 text-[12.5px] leading-relaxed">
          <code className="font-mono">{scaffold}</code>
        </pre>
        <p className="mt-3 text-[11px] text-muted-foreground">
          The on-chain implementation lives at{" "}
          <code className="font-mono">{path}/src/lib.rs</code>. This scaffold mirrors the canonical
          PiRC pattern: <code className="font-mono">forbid(unsafe_code)</code>,{" "}
          <code className="font-mono">no_std</code>, single-call <code className="font-mono">invoke_layer</code>{" "}
          gated by <code className="font-mono">caller.require_auth()</code>.
        </p>
      </section>
    </div>
  );
}

function Meta({
  label,
  value,
  icon: Icon,
  mono,
}: {
  label: string;
  value: string;
  icon?: typeof Hash;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        {Icon ? <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden /> : null}
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </span>
      </div>
      <div className={`mt-2 text-sm ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}
