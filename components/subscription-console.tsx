"use client";

import { useEffect, useRef, useState } from "react";
import { Ban, KeyRound, Repeat, Terminal, Wallet } from "lucide-react";
import clsx from "clsx";

type LogLine = { id: number; text: string; tone?: "info" | "ok" | "warn" | "err" };

const SUBSCRIPTION = "CCUF75B6W3HRJTJD6O7OXNI72HGJ7DERZ5MUNOMFMSK23ME5GUIKPFYV";

let counter = 0;

export function SubscriptionConsole() {
  const [authed, setAuthed] = useState(false);
  const [busy, setBusy] = useState<null | string>(null);
  const [lines, setLines] = useState<LogLine[]>([]);
  const termRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    push("PiRC-2 subscription console ready · contract " + short(SUBSCRIPTION));
    push("Awaiting Pioneer authentication…", "info");
  }, []);

  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
  }, [lines]);

  function push(text: string, tone: LogLine["tone"] = "info") {
    counter += 1;
    setLines((prev) => [...prev, { id: counter, text, tone }]);
  }

  function short(s: string) {
    return `${s.slice(0, 6)}…${s.slice(-6)}`;
  }

  async function step(action: string, steps: { delay: number; text: string; tone?: LogLine["tone"] }[]) {
    setBusy(action);
    for (const s of steps) {
      await new Promise((r) => setTimeout(r, s.delay));
      push(s.text, s.tone);
    }
    setBusy(null);
  }

  const authenticate = () =>
    step("auth", [
      { delay: 250, text: "→ Pi.authenticate({ scopes: ['username','payments'] })" },
      { delay: 500, text: "✓ Pioneer authenticated via Pi App SDK", tone: "ok" },
    ]).then(() => setAuthed(true));

  const subscribe = () =>
    step("subscribe", [
      { delay: 250, text: "→ subscribe(subscriber, service_id=0, pay_upfront=true)" },
      { delay: 600, text: "[Event: approve] do_approve allowance issued", tone: "info" },
      { delay: 700, text: "✓ Access granted to L1 GOLD layer", tone: "ok" },
    ]);

  const cancel = () =>
    step("cancel", [
      { delay: 250, text: "→ toggle_pay_upfront(false)" },
      { delay: 600, text: "[Event: cancel] auto-renew disabled — subscription remains active until period ends", tone: "warn" },
    ]);

  const batch = () =>
    step("batch", [
      { delay: 250, text: "→ trigger_batch_renewal()" },
      { delay: 700, text: "  invoking process(merchant, offset=0, limit=200)…" },
      { delay: 900, text: "[Event: charge] 145 subscribers charged successfully", tone: "ok" },
      { delay: 600, text: "✓ Bounty 0.01 Pi paid to keeper", tone: "ok" },
    ]);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div className="rounded-xl border border-primary/30 bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
              Pioneer · Subscriber
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">L1 · GOLD layer</span>
          </div>
          <h3 className="mt-3 text-lg font-semibold">L1 GOLD layer access</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            One-time allowance via <code className="font-mono">do_approve</code>. Auto-renews
            each billing period until canceled.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
            <Stat label="Price" value="1 π / month" />
            <Stat label="Cycle" value="Monthly" />
            <Stat label="Pattern" value="do_approve" />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Button
              tone="primary"
              icon={KeyRound}
              onClick={authenticate}
              disabled={!!busy || authed}
              loading={busy === "auth"}
            >
              {authed ? "Authenticated" : "Authenticate with Pi"}
            </Button>
            <Button
              tone="primary"
              icon={Wallet}
              onClick={subscribe}
              disabled={!authed || !!busy}
              loading={busy === "subscribe"}
            >
              subscribe()
            </Button>
            <Button
              tone="destructive"
              icon={Ban}
              onClick={cancel}
              disabled={!authed || !!busy}
              loading={busy === "cancel"}
            >
              cancel()
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-accent/30 bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
              Decentralized Keeper · PiRC-260
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">Bounty 0.01 π</span>
          </div>
          <h3 className="mt-3 text-lg font-semibold">trigger_batch_renewal()</h3>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">
            Anyone can keep the network running. The contract pays a bounty to the caller per
            successful batch.
          </p>
          <div className="mt-4">
            <Button
              tone="accent"
              icon={Repeat}
              onClick={batch}
              disabled={!!busy}
              loading={busy === "batch"}
            >
              Run batch renewal
            </Button>
          </div>
        </div>
      </div>

      {/* Terminal */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <div className="flex items-center gap-2 text-xs">
            <Terminal className="h-3.5 w-3.5 text-primary" aria-hidden />
            <span className="font-mono uppercase tracking-[0.18em] text-muted-foreground">
              soroban://invoke
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-destructive/70" aria-hidden />
            <span className="h-2 w-2 rounded-full bg-accent/70" aria-hidden />
            <span className="h-2 w-2 rounded-full bg-primary/70" aria-hidden />
          </div>
        </div>
        <div
          ref={termRef}
          className="scrollbar-thin h-[360px] overflow-y-auto px-4 py-3 font-mono text-[12px] leading-relaxed"
        >
          {lines.map((l) => (
            <p
              key={l.id}
              className={clsx(
                "whitespace-pre-wrap",
                l.tone === "ok" && "text-primary",
                l.tone === "warn" && "text-accent",
                l.tone === "err" && "text-destructive",
                (!l.tone || l.tone === "info") && "text-muted-foreground",
              )}
            >
              <span className="text-muted-foreground/60">{">"} </span>
              {l.text}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-muted/30 p-2">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-1 font-mono text-sm">{value}</div>
    </div>
  );
}

function Button({
  children,
  onClick,
  disabled,
  loading,
  tone = "primary",
  icon: Icon,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  tone?: "primary" | "accent" | "destructive";
  icon?: typeof Wallet;
}) {
  const TONE: Record<string, string> = {
    primary:
      "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15 disabled:border-border disabled:bg-muted/30 disabled:text-muted-foreground",
    accent:
      "border-accent/40 bg-accent/10 text-accent hover:bg-accent/15 disabled:border-border disabled:bg-muted/30 disabled:text-muted-foreground",
    destructive:
      "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15 disabled:border-border disabled:bg-muted/30 disabled:text-muted-foreground",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
        TONE[tone],
        "disabled:cursor-not-allowed",
      )}
    >
      {Icon ? <Icon className={clsx("h-3.5 w-3.5", loading && "animate-pulse")} aria-hidden /> : null}
      {children}
    </button>
  );
}
