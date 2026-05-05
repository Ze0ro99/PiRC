import clsx from "clsx";
import type { LucideIcon } from "lucide-react";

type StatusTileProps = {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: LucideIcon;
  tone?: "default" | "primary" | "accent" | "destructive";
  loading?: boolean;
};

const TONE: Record<NonNullable<StatusTileProps["tone"]>, string> = {
  default: "border-border",
  primary: "border-primary/40",
  accent: "border-accent/40",
  destructive: "border-destructive/40",
};

const DOT: Record<NonNullable<StatusTileProps["tone"]>, string> = {
  default: "bg-muted-foreground",
  primary: "bg-primary",
  accent: "bg-accent",
  destructive: "bg-destructive",
};

export function StatusTile({ label, value, hint, icon: Icon, tone = "default", loading }: StatusTileProps) {
  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-xl border bg-card p-5 transition-colors",
        TONE[tone],
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon ? <Icon className="h-4 w-4 text-muted-foreground" aria-hidden /> : null}
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </span>
        </div>
        <span className="relative flex h-2 w-2">
          <span className={clsx("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", DOT[tone])} />
          <span className={clsx("relative inline-flex h-2 w-2 rounded-full", DOT[tone])} />
        </span>
      </div>
      <div className="mt-3 min-h-[2.5rem]">
        {loading ? (
          <div className="h-7 w-32 animate-pulse rounded-md bg-muted" />
        ) : (
          <div className="font-mono text-2xl tracking-tight text-foreground">{value}</div>
        )}
      </div>
      {hint ? (
        <div className="mt-1 font-mono text-[11px] text-muted-foreground">{hint}</div>
      ) : null}
    </div>
  );
}
