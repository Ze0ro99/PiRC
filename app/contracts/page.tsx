import { ArrowUpRight, Coins, Radio } from "lucide-react";
import clsx from "clsx";
import type { Metadata } from "next";
import { COLOR_CLASSES, PACKETS, PIRC, shortenAddress } from "@/lib/pirc";
import { CopyButton } from "@/components/copy-button";

export const metadata: Metadata = {
  title: "Contract Registry",
  description: "Authoritative registry of every PiRC contract on Pi Testnet — master issuer, PiRC2 subscription engine, and the 7 colored project packets.",
};

const ordered = [...PACKETS].sort((a, b) => b.index - a.index);

export default function ContractsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <header className="mb-10 max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
          Authoritative registry · pi.7-layer-packets/v1
        </p>
        <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Contract registry
        </h1>
        <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
          Every public on-chain identifier in the PiRC warehouse. All addresses are public and
          safe to commit. The master issuer signs the seven colored packets; PiRC2 carries the
          subscription engine.
        </p>
      </header>

      {/* Top-level identifiers */}
      <section className="grid gap-4 md:grid-cols-2">
        <IdentityRow
          label="Master Issuer"
          subtitle="7 Project Packets · Pi Testnet (Stellar)"
          address={PIRC.master_issuer}
          icon={Coins}
          tone="accent"
        />
        <IdentityRow
          label="PiRC2 Subscription"
          subtitle="Soroban · do_approve allowance pattern"
          address={PIRC.pirc2_subscription}
          icon={Radio}
          tone="primary"
          external={`https://stellar.expert/explorer/testnet/contract/${PIRC.pirc2_subscription}`}
        />
      </section>

      {/* 7-layer table */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold tracking-tight">The 7 colored packets</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Each packet is a sovereign role. Click an address to copy it. Stellar Expert links
          open in a new tab.
        </p>

        <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
          {/* Desktop table */}
          <table className="hidden w-full text-left lg:table">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="w-24 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Layer</th>
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Role</th>
                <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Contract</th>
                <th className="w-40 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Explorer</th>
              </tr>
            </thead>
            <tbody>
              {ordered.map((p) => {
                const c = COLOR_CLASSES[p.color];
                return (
                  <tr id={p.color.toLowerCase()} key={p.contract} className="border-b border-border last:border-0">
                    <td className="px-4 py-4 align-top">
                      <div className="flex items-center gap-2">
                        <span className={clsx("h-2 w-2 rounded-full", c.dot)} aria-hidden />
                        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                          L{p.index}
                        </span>
                      </div>
                      <span className={clsx("mt-1 inline-flex rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase", c.chip)}>
                        {p.color}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="font-medium">{p.role}</div>
                      <p className="mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">
                        {p.description}
                      </p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex items-center gap-2">
                        <code className="break-all font-mono text-[12px] text-foreground/90">{p.contract}</code>
                      </div>
                      <div className="mt-2">
                        <CopyButton value={p.contract} label="copy id" />
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <a
                        href={p.stellar_expert}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                      >
                        Stellar Expert <ArrowUpRight className="h-3 w-3" aria-hidden />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Mobile stacked */}
          <div className="divide-y divide-border lg:hidden">
            {ordered.map((p) => {
              const c = COLOR_CLASSES[p.color];
              return (
                <div id={p.color.toLowerCase()} key={p.contract} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={clsx("h-2 w-2 rounded-full", c.dot)} aria-hidden />
                      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        L{p.index}
                      </span>
                      <span className={clsx("inline-flex rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase", c.chip)}>
                        {p.color}
                      </span>
                    </div>
                    <a
                      href={p.stellar_expert}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                    >
                      Explorer <ArrowUpRight className="h-3 w-3" aria-hidden />
                    </a>
                  </div>
                  <div className="mt-2 font-medium">{p.role}</div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{p.description}</p>
                  <div className="mt-3 flex items-center justify-between gap-2 rounded-md border border-border bg-muted/30 p-2">
                    <code className="truncate font-mono text-[11px] text-foreground/90" title={p.contract}>
                      {shortenAddress(p.contract, 10, 10)}
                    </code>
                    <CopyButton value={p.contract} label="copy" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Reserve assets */}
      <section className="mt-12 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <span className={clsx("inline-flex rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase", COLOR_CLASSES.GOLD.chip)}>
            GOLD · L1
          </span>
          <h3 className="mt-3 text-lg font-semibold">PiRC Reserve Asset</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Primary reserve currency. Anchored to a parity of <span className="font-mono">314,159</span>{" "}
            with 7-decimal precision. Status: <span className="text-primary">live</span>.
          </p>
          <dl className="mt-4 grid grid-cols-3 gap-3 text-xs">
            <div className="rounded-md border border-border bg-muted/30 p-2">
              <dt className="text-muted-foreground">Code</dt>
              <dd className="font-mono">GOLD</dd>
            </div>
            <div className="rounded-md border border-border bg-muted/30 p-2">
              <dt className="text-muted-foreground">Decimals</dt>
              <dd className="font-mono">7</dd>
            </div>
            <div className="rounded-md border border-border bg-muted/30 p-2">
              <dt className="text-muted-foreground">Network</dt>
              <dd className="font-mono">Pi Testnet</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <span className={clsx("inline-flex rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase", COLOR_CLASSES.GREEN.chip)}>
            GREEN · L5
          </span>
          <h3 className="mt-3 text-lg font-semibold">PiCash</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Official ecosystem currency for P2P and merchant use. Minted by the master issuer
            with 7-decimal precision. Status: <span className="text-primary">live</span>.
          </p>
          <dl className="mt-4 grid grid-cols-3 gap-3 text-xs">
            <div className="rounded-md border border-border bg-muted/30 p-2">
              <dt className="text-muted-foreground">Code</dt>
              <dd className="font-mono">GREEN</dd>
            </div>
            <div className="rounded-md border border-border bg-muted/30 p-2">
              <dt className="text-muted-foreground">Decimals</dt>
              <dd className="font-mono">7</dd>
            </div>
            <div className="rounded-md border border-border bg-muted/30 p-2">
              <dt className="text-muted-foreground">Network</dt>
              <dd className="font-mono">Pi Testnet</dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}

function IdentityRow({
  label,
  subtitle,
  address,
  icon: Icon,
  tone,
  external,
}: {
  label: string;
  subtitle: string;
  address: string;
  icon: typeof Coins;
  tone: "primary" | "accent";
  external?: string;
}) {
  return (
    <div
      className={clsx(
        "rounded-xl border bg-card p-5",
        tone === "primary" ? "border-primary/30" : "border-accent/30",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={clsx("h-4 w-4", tone === "primary" ? "text-primary" : "text-accent")} aria-hidden />
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
        </div>
        {external ? (
          <a
            href={external}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
          >
            Explorer <ArrowUpRight className="h-3 w-3" aria-hidden />
          </a>
        ) : null}
      </div>
      <div className="mt-3 break-all font-mono text-sm leading-relaxed">{address}</div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{subtitle}</span>
        <CopyButton value={address} label="copy" />
      </div>
    </div>
  );
}
