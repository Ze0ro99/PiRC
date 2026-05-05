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
  default: "bg-muted-foreground text-muted-foreground",
  primary: "bg-primary text-primary",
  accent: "bg-accent text-accent",
  destructive: "bg-destructive text-destructive",
};

const TONE_LABEL: Record<NonNullable<StatusTileProps["tone"]>, string> = {
  default: "INIT",
  primary: "ONLINE",
  accent: "READY",
  destructive: "DOWN",
};

export function StatusTile({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  loading,
}: StatusTileProps) {
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
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {label}
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden
            className={clsx(
              "relative inline-flex h-1.5 w-1.5 rounded-full pulse-dot",
              DOT[tone],
            )}
          />
          <span className={clsx("font-mono text-[9px] uppercase tracking-[0.2em]", DOT[tone].split(" ")[1])}>
            {TONE_LABEL[tone]}
          </span>
        </span>
      </div>
      <div className="mt-3 min-h-[2.25rem]">
        {loading ? (
          <div className="h-7 w-32 animate-pulse rounded-md bg-muted" />
        ) : (
          <div className="font-mono text-2xl tabular-nums tracking-tight text-foreground">
            {value}
          </div>
        )}
      </div>
      {hint ? (
        <div className="mt-1 truncate font-mono text-[11px] text-muted-foreground">{hint}</div>
      ) : null}
    </div>
  );
}
