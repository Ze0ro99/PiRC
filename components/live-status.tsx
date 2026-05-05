"use client";

import { Activity, Database, Hash, Network, ShieldAlert } from "lucide-react";
import { useStatus } from "@/lib/use-status";
import { StatusTile } from "@/components/status-tile";

function fmt(n: number | string | undefined): string {
  if (n == null) return "—";
  const s = String(n);
  if (!/^\d+$/.test(s)) return s;
  return Number(s).toLocaleString();
}

export function LiveStatus() {
  const { data, error, isLoading } = useStatus();

  const issuerOK = !!data && !data.issuer.error;
  const sorobanOK = !!data && !!data.soroban?.network && !(data.soroban as any)?.network?.error;

  const issuerSeq = data?.issuer.sequence;
  const ledgerSeq =
    (data?.soroban?.latest_ledger as any)?.sequence ??
    (data?.soroban?.latest_ledger as any)?.lastLedger;
  const passphrase =
    (data?.soroban?.network as any)?.passphrase ??
    (data?.soroban?.network as any)?.networkPassphrase;
  const protoVersion =
    (data?.soroban?.latest_ledger as any)?.protocolVersion ??
    (data?.soroban?.network as any)?.protocolVersion;

  return (
    <section aria-labelledby="live-status-heading">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 id="live-status-heading" className="text-xl font-semibold tracking-tight">
            Live network status
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Read-only signals from Horizon and Soroban RPC. Refreshes every 15s.
          </p>
        </div>
        <div className="hidden font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground sm:block">
          {error ? "rpc · degraded" : isLoading ? "rpc · syncing" : "rpc · healthy"}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatusTile
          label="Issuer Sequence"
          value={fmt(issuerSeq)}
          hint={issuerOK ? "horizon · pi testnet" : (data?.issuer.error ?? "fetching…")}
          icon={Hash}
          tone={issuerOK ? "primary" : error ? "destructive" : "default"}
          loading={isLoading}
        />
        <StatusTile
          label="Latest Ledger"
          value={fmt(ledgerSeq)}
          hint={ledgerSeq ? "soroban · getLatestLedger" : "fetching…"}
          icon={Database}
          tone={ledgerSeq ? "primary" : error ? "destructive" : "default"}
          loading={isLoading}
        />
        <StatusTile
          label="Network"
          value={passphrase ? (passphrase.includes("Test") ? "Pi Testnet" : "Pi Network") : "—"}
          hint={protoVersion ? `proto v${protoVersion}` : "soroban · getNetwork"}
          icon={Network}
          tone={sorobanOK ? "primary" : error ? "destructive" : "default"}
          loading={isLoading}
        />
        <StatusTile
          label="Operator Mode"
          value={data?.env.network ?? "TESTNET"}
          hint={
            <span className="inline-flex items-center gap-1">
              <ShieldAlert className="h-3 w-3" />
              No autonomous mainnet writes
            </span>
          }
          icon={Activity}
          tone="accent"
          loading={isLoading}
        />
      </div>
    </section>
  );
}
