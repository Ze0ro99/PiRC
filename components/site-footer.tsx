import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-background/60">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="grid h-7 w-7 place-items-center rounded-md border border-primary/40 bg-primary/10 font-mono text-xs font-bold text-primary">
                π
              </div>
              <span className="text-sm font-semibold">PiRC Warehouse</span>
            </div>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground text-pretty">
              The official 7-layer Sovereign Monetary Standard for the Pi Network. Built on Soroban
              + Stellar Testnet with Rust 2024, Soroban SDK v22, and a forbid-unsafe-code policy.
            </p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Read-only · Testnet · No autonomous mainnet writes
            </p>
          </div>
          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Warehouse
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/" className="hover:text-primary">Overview</Link></li>
              <li><Link href="/contracts" className="hover:text-primary">Contracts</Link></li>
              <li><Link href="/architecture" className="hover:text-primary">Architecture</Link></li>
              <li><Link href="/subscriptions" className="hover:text-primary">Subscriptions</Link></li>
              <li><Link href="/admin" className="hover:text-primary">Admin</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Endpoints
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href="/api/status" className="font-mono hover:text-primary">/api/status</a></li>
              <li><a href="/api/matrix" className="font-mono hover:text-primary">/api/matrix</a></li>
              <li>
                <a href="https://github.com/Ze0ro99/PiRC" target="_blank" rel="noreferrer" className="hover:text-primary">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} PiRC Ecosystem · Pi Network Sovereign Monetary Standard</span>
          <span className="font-mono">v2.0.0 · Soroban SDK v22 · Rust 2024</span>
        </div>
      </div>
    </footer>
  );
}
