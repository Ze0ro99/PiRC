"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, ShieldCheck } from "lucide-react";
import clsx from "clsx";
import {
  STANDARDS,
  CATEGORIES,
  categoryColor,
  type StandardCategory,
} from "@/lib/standards";

export function StandardsBrowser() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<StandardCategory | "ALL">("ALL");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return STANDARDS.filter((s) => {
      if (cat !== "ALL" && s.category !== cat) return false;
      if (!needle) return true;
      return (
        s.name.toLowerCase().includes(needle) ||
        s.summary.toLowerCase().includes(needle) ||
        String(s.id).includes(needle) ||
        s.category.toLowerCase().includes(needle)
      );
    });
  }, [q, cat]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { ALL: STANDARDS.length };
    CATEGORIES.forEach((c) => {
      map[c] = STANDARDS.filter((s) => s.category === c).length;
    });
    return map;
  }, []);

  return (
    <div>
      {/* search + filters */}
      <div className="sticky top-14 z-30 -mx-4 mb-6 border-b border-border bg-background/85 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Search standards</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, ID, category, or keyword…"
              className="w-full rounded-md border border-border bg-input px-9 py-2 text-sm placeholder:text-muted-foreground/70 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </label>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin">
            <FilterChip label="All" count={counts.ALL} active={cat === "ALL"} onClick={() => setCat("ALL")} />
            {CATEGORIES.map((c) => (
              <FilterChip
                key={c}
                label={c}
                count={counts[c] ?? 0}
                color={categoryColor(c)}
                active={cat === c}
                onClick={() => setCat(c)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* result row */}
      <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-mono uppercase tracking-[0.18em]">
          {filtered.length} / {STANDARDS.length} standards
        </span>
        <span className="hidden font-mono uppercase tracking-[0.18em] sm:inline">
          ALL · DEPLOYED · QUANTUM AUDITED
        </span>
      </div>

      {/* grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No standards match this query.
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((s) => (
            <li key={s.id}>
              <Link
                href={`/standards/${s.id}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40"
              >
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 w-1"
                  style={{ background: categoryColor(s.category) }}
                />
                <div className="flex items-center justify-between">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em]"
                    style={{
                      borderColor: `color-mix(in oklab, ${categoryColor(s.category)} 35%, transparent)`,
                      color: categoryColor(s.category),
                      background: `color-mix(in oklab, ${categoryColor(s.category)} 10%, transparent)`,
                    }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: categoryColor(s.category) }} aria-hidden />
                    {s.category}
                  </span>
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
                    PiRC-{s.id}
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-semibold tracking-tight">{s.name}</h3>
                <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-muted-foreground text-pretty">
                  {s.summary}
                </p>
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    <ShieldCheck className="h-3 w-3 text-primary" aria-hidden />
                    {s.status}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-primary">
                    Open <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterChip({
  label,
  count,
  color,
  active,
  onClick,
}: {
  label: string;
  count: number;
  color?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "inline-flex shrink-0 items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs transition-colors",
        active
          ? "border-primary/40 bg-primary/[0.10] text-foreground"
          : "border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {color ? (
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} aria-hidden />
      ) : null}
      {label}
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {count}
      </span>
    </button>
  );
}
