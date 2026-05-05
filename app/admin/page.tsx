import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";
import { AdminTelemetry } from "@/components/admin-telemetry";

export const metadata: Metadata = {
  title: "Operator Console",
  description: "PiRC operator telemetry — issuer health, Soroban RPC vitals, and environment wiring. Read-only by design.",
};

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <header className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
          Operator console · read-only
        </p>
        <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Telemetry &amp; environment wiring.
        </h1>
        <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
          Live signals from the master issuer (Horizon) and the Soroban RPC powering the PiRC2
          subscription engine. Secrets are never returned — only their presence is surfaced.
        </p>

        <div className="mt-5 inline-flex items-start gap-2 rounded-md border border-accent/30 bg-accent/5 px-3 py-2 text-xs text-muted-foreground">
          <ShieldAlert className="mt-0.5 h-3.5 w-3.5 text-accent" aria-hidden />
          <span>
            This console reads <code className="font-mono">/api/status</code> every 15s. It does
            not sign, deploy, or mutate state.
          </span>
        </div>
      </header>

      <section className="mt-10">
        <AdminTelemetry />
      </section>
    </div>
  );
}
