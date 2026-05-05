import { Library, ShieldCheck } from "lucide-react";
import { StandardsBrowser } from "@/components/standards-browser";
import { STANDARDS } from "@/lib/standards";

export const metadata = {
  title: "Standards Library — PiRC Warehouse",
  description: `${STANDARDS.length} compiled PiRC standards across the sovereign monetary stack.`,
};

export default function StandardsPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/[0.08] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            <Library className="h-3 w-3" aria-hidden />
            Standards Library
          </span>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            {STANDARDS.length} compiled PiRC standards.
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            The full Compiled Ecosystem under{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[12px]">
              Omni_Sovereign_Architecture/Compiled_Ecosystem
            </code>
            . Each standard is a Soroban Rust crate pinned to <code className="font-mono">soroban-sdk v22</code> with{" "}
            <code className="font-mono">forbid(unsafe_code)</code>.
          </p>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <ShieldCheck className="h-3 w-3 text-primary" aria-hidden />
            Quantum audited
          </span>
        </div>
      </header>

      <StandardsBrowser />
    </div>
  );
}
