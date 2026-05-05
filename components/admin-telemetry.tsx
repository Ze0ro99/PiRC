"use client";

import { Check, X } from "lucide-react";
import clsx from "clsx";
import { useStatus } from "@/lib/use-status";
import { CopyButton } from "@/components/copy-button";

export function AdminTelemetry() {
  const { data, error, isLoading } = useStatus();

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Health */}
      <div className="lg:col-span-2 space-y-4">
        <SectionCard title="Issuer · Horizon">
          {isLoading ? (
            <Skeleton rows={3} />
          ) : data?.issuer.error ? (
            <ErrorRow message={data.issuer.error} />
          ) : (
            <dl className="grid gap-3 sm:grid-cols-2">
              <KV label="Account" value={data?.issuer.id ?? "—"} mono copy />
              <KV label="Sequence" value={data?.issuer.sequence ?? "—"} mono />
              <KV label="Subentries" value={String(data?.issuer.subentry_count ?? "—")} mono />
              <KV label="Signers" value={String(data?.issuer.signers ?? "—")} mono />
              <div className="sm:col-span-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Balances
                </span>
                <ul className="mt-2 space-y-1.5">
                  {(data?.issuer.balances ?? []).map((b, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-1.5 font-mono text-xs"
                    >
                      <span className="text-muted-foreground">
                        {b.asset_code ?? b.asset_type}
                      </span>
                      <span>{b.balance}</span>
                    </li>
                  ))}
                  {(data?.issuer.balances ?? []).length === 0 ? (
                    <li className="text-xs text-muted-foreground">No native balances reported.</li>
                  ) : null}
                </ul>
              </div>
            </dl>
          )}
        </SectionCard>

        <SectionCard title="Soroban RPC">
          {isLoading ? (
            <Skeleton rows={2} />
          ) : (
            <dl className="grid gap-3 sm:grid-cols-2">
              <KV
                label="Latest ledger"
                value={String(
                  (data?.soroban.latest_ledger as any)?.sequence ??
                    (data?.soroban.latest_ledger as any)?.lastLedger ??
                    "—",
                )}
                mono
              />
              <KV
                label="Protocol"
                value={
                  String(
                    (data?.soroban.latest_ledger as any)?.protocolVersion ??
                      (data?.soroban.network as any)?.protocolVersion ??
                      "—",
                  )
                }
                mono
              />
              <KV
                label="Network passphrase"
                value={
                  ((data?.soroban.network as any)?.passphrase ??
                    (data?.soroban.network as any)?.networkPassphrase ??
                    "—") as string
                }
                mono
              />
              <KV
                label="Friendbot"
                value={(data?.soroban.network as any)?.friendbotUrl ?? "—"}
                mono
              />
            </dl>
          )}
        </SectionCard>
      </div>

      {/* Env wiring */}
      <SectionCard title="Operator wiring">
        {isLoading ? (
          <Skeleton rows={4} />
        ) : (
          <ul className="space-y-2">
            <EnvFlag label="Network mode" value={data?.env.network ?? "TESTNET"} mono />
            <EnvFlag label="Horizon URL" value={data?.env.horizon ?? "—"} mono small />
            <EnvFlag label="Soroban RPC" value={data?.env.soroban_rpc ?? "—"} mono small />
            <Divider />
            <EnvBool label="STELLAR_TESTNET_SECRET" present={data?.env.stellar_secret_present} />
            <EnvBool label="PI_API_KEY" present={data?.env.pi_api_key_present} />
            <EnvBool label="OMNI_SYNC_TOKEN" present={data?.env.omni_sync_token_present} />
            <p className="mt-3 rounded-md border border-accent/30 bg-accent/5 p-3 text-[11px] leading-relaxed text-muted-foreground">
              The orchestrator is read-only. CI may run the status helper to gate deploys, but
              must never be granted secret seeds. {error ? <span className="text-destructive">RPC error: {String(error)}</span> : null}
            </p>
          </ul>
        )}
      </SectionCard>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function KV({
  label,
  value,
  mono,
  copy,
}: {
  label: string;
  value: string;
  mono?: boolean;
  copy?: boolean;
}) {
  return (
    <div className="rounded-md border border-border bg-muted/30 p-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
        {copy ? <CopyButton value={value} label="copy" /> : null}
      </div>
      <div className={clsx("mt-1 break-all text-sm", mono && "font-mono")}>{value}</div>
    </div>
  );
}

function EnvFlag({ label, value, mono, small }: { label: string; value: string; mono?: boolean; small?: boolean }) {
  return (
    <li className="flex items-start justify-between gap-3 rounded-md border border-border bg-muted/30 px-3 py-2">
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <span className={clsx("text-right", mono && "font-mono", small ? "text-[11px]" : "text-xs", "break-all")}>
        {value}
      </span>
    </li>
  );
}

function EnvBool({ label, present }: { label: string; present?: boolean }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/30 px-3 py-2">
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <span
        className={clsx(
          "inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-[10px] uppercase",
          present
            ? "border-primary/40 bg-primary/10 text-primary"
            : "border-border bg-muted/40 text-muted-foreground",
        )}
      >
        {present ? <Check className="h-3 w-3" aria-hidden /> : <X className="h-3 w-3" aria-hidden />}
        {present ? "set" : "missing"}
      </span>
    </li>
  );
}

function Divider() {
  return <li className="my-2 border-t border-border" aria-hidden />;
}

function Skeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 animate-pulse rounded-md bg-muted" />
      ))}
    </div>
  );
}
