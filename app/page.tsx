import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Boxes,
  Coins,
  Factory,
  Github,
  Layers,
  Library,
  Lock,
  Radio,
  Scale,
  ScrollText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { LiveStatus } from "@/components/live-status";
import { LayerCard } from "@/components/layer-card";
import { CopyButton } from "@/components/copy-button";
import { PACKETS, PIRC, shortenAddress } from "@/lib/pirc";
import { STANDARDS } from "@/lib/standards";

const ordered = [...PACKETS].sort((a, b) => b.index - a.index);

export default function OverviewPage() {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid opacity-30" aria-hidden />
        <div className="absolute inset-0 bg-imperial opacity-90" aria-hidden />
        <div className="relative mx-auto max-w-[1400px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/[0.08] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              <Layers className="h-3 w-3" aria-hidden /> 7-Layer Matrix · v2.1
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/[0.08] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
              <Library className="h-3 w-3" aria-hidden /> {STANDARDS.length} Standards
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              <Lock className="h-3 w-3" aria-hidden /> Rust 2024 · Soroban SDK v22
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              <ShieldCheck className="h-3 w-3" aria-hidden /> forbid(unsafe_code)
            </span>
          </div>

          <h1 className="mt-7 max-w-4xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            The sovereign warehouse for the{" "}
            <span className="text-imperial">Pi Reserve Currency</span>.
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            PiRC is a 7-layer Soroban + Stellar architecture deployed on Pi Testnet. The warehouse
            unifies the colored packet matrix, {STANDARDS.length} compiled standards, the Sovereign
            Smart-Contract Factory, the Divine Justice System, and an immutable raw-record log —
            all backed by live on-chain telemetry.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contracts"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Explore contracts <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/standards"
              className="inline-flex items-center gap-2 rounded-md border border-accent/40 bg-accent/[0.10] px-4 py-2 text-sm text-accent-foreground transition-colors hover:bg-accent/20"
            >
              <Library className="h-4 w-4" aria-hidden />
              Standards Library
            </Link>
            <Link
              href="/architecture"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-muted/40 px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
            >
              <BookOpen className="h-4 w-4" aria-hidden />
              Architecture
            </Link>
            <a
              href="https://github.com/Ze0ro99/PiRC"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-muted/40 px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
            >
              <Github className="h-4 w-4" aria-hidden />
              Source
            </a>
          </div>

          {/* Identity card */}
          <div className="mt-12 grid gap-4 lg:grid-cols-2">
            <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-card/80 p-5">
              <span className="absolute inset-y-0 left-0 w-1 bg-primary" aria-hidden />
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                  Master Issuer · Stellar G-address
                </span>
                <Coins className="h-4 w-4 text-primary" aria-hidden />
              </div>
              <div className="mt-3 break-all font-mono text-sm leading-relaxed">
                {PIRC.master_issuer}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{shortenAddress(PIRC.master_issuer, 10, 10)}</span>
                <CopyButton value={PIRC.master_issuer} label="copy issuer" />
              </div>
            </div>
            <div className="relative overflow-hidden rounded-xl border border-accent/30 bg-card/80 p-5">
              <span className="absolute inset-y-0 left-0 w-1 bg-accent" aria-hidden />
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
                  PiRC2 Subscription · Soroban C-address
                </span>
                <Radio className="h-4 w-4 text-accent" aria-hidden />
              </div>
              <div className="mt-3 break-all font-mono text-sm leading-relaxed">
                {PIRC.pirc2_subscription}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{shortenAddress(PIRC.pirc2_subscription, 10, 10)}</span>
                <CopyButton value={PIRC.pirc2_subscription} label="copy contract" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live status */}
      <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <LiveStatus />
      </section>

      {/* 7-layer matrix */}
      <section
        className="mx-auto max-w-[1400px] px-4 pb-12 sm:px-6 lg:px-8"
        aria-labelledby="matrix-heading"
      >
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="matrix-heading" className="flex items-center gap-2 text-xl font-semibold tracking-tight">
              <Boxes className="h-5 w-5 text-primary" aria-hidden />
              7-Layer project packets
            </h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground text-pretty">
              The colored matrix issued by the master issuer. Each role is a sovereign building
              block of the monetary stack.
            </p>
          </div>
          <Link
            href="/contracts"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
          >
            All contracts <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ordered.map((p) => (
            <LayerCard key={p.contract} packet={p} />
          ))}

          {/* PiRC2 callout card */}
          <article className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-accent/30 bg-accent/[0.06] p-5">
            <span className="absolute inset-y-0 left-0 w-1 bg-accent" aria-hidden />
            <div>
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-accent" aria-hidden />
                <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-accent">
                  PiRC2 · Subscription Engine
                </span>
              </div>
              <h3 className="mt-3 text-lg font-semibold">Recurring payments via do_approve</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground text-pretty">
                The Soroban allowance pattern lets subscribers authorize the engine once. A
                decentralized keeper triggers batch renewal and earns a bounty.
              </p>
            </div>
            <Link
              href="/subscriptions"
              className="mt-4 inline-flex items-center gap-2 self-start rounded-md border border-accent/40 bg-accent/10 px-3 py-1.5 text-sm text-accent hover:bg-accent/15"
            >
              Open subscription portal <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </article>
        </div>
      </section>

      {/* Capabilities row */}
      <section className="mx-auto max-w-[1400px] px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold tracking-tight">Sovereign infrastructure surface</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground text-pretty">
            Every capability of the warehouse is reachable from the navigation bar. These six
            entries are the operator surface for the team and community.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <QuickLink
            href="/standards"
            title="Standards Library"
            description={`${STANDARDS.length} compiled PiRC standards, searchable by category, with quantum-audit status.`}
            icon={Library}
            tone="primary"
          />
          <QuickLink
            href="/factory"
            title="Raw Record Factory"
            description="Soroban factory + sovereign registry that deploys and indexes every product contract."
            icon={Factory}
            tone="primary"
          />
          <QuickLink
            href="/studio"
            title="Smart-Contract Studio"
            description="Compose Rust + Soroban contract scaffolds from validated PiRC templates in seconds."
            icon={Sparkles}
            tone="accent"
          />
          <QuickLink
            href="/raw-log"
            title="Raw Log Explorer"
            description="Append-only immutable record chain with deterministic hash linking. Audit-grade."
            icon={ScrollText}
            tone="accent"
          />
          <QuickLink
            href="/divine"
            title="Divine Justice System"
            description="Seven-layer DJS with deterministic inheritance and zakat engines, ready to run."
            icon={Scale}
            tone="accent"
          />
          <QuickLink
            href="/admin"
            title="Operator Console"
            description="Telemetry, env wiring, and orchestrator state. Read-only by design."
            icon={ShieldCheck}
            tone="default"
          />
        </div>
      </section>
    </div>
  );
}

function QuickLink({
  href,
  title,
  description,
  icon: Icon,
  tone = "default",
  external,
}: {
  href: string;
  title: string;
  description: string;
  icon: typeof BookOpen;
  tone?: "default" | "primary" | "accent";
  external?: boolean;
}) {
  const Tag: any = external ? "a" : Link;
  const props = external ? { href, target: "_blank", rel: "noreferrer" } : { href };
  const ring =
    tone === "primary"
      ? "hover:border-primary/40"
      : tone === "accent"
        ? "hover:border-accent/40"
        : "hover:border-border";
  const iconColor =
    tone === "primary" ? "text-primary" : tone === "accent" ? "text-accent" : "text-muted-foreground";
  return (
    <Tag
      {...props}
      className={`group flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:bg-card/80 ${ring}`}
    >
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${iconColor}`} aria-hidden />
        <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-muted-foreground">
          {title}
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
        {description}
      </p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm text-primary">
        Open <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </span>
    </Tag>
  );
}
