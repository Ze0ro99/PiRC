"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BookOpen,
  Boxes,
  Factory,
  LayoutDashboard,
  Library,
  Radio,
  Scale,
  ScrollText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import clsx from "clsx";

const NAV = [
  { href: "/",              label: "Overview",     icon: LayoutDashboard },
  { href: "/contracts",     label: "Contracts",    icon: Boxes },
  { href: "/standards",     label: "Standards",    icon: Library },
  { href: "/architecture",  label: "Architecture", icon: BookOpen },
  { href: "/factory",       label: "Factory",      icon: Factory },
  { href: "/studio",        label: "Studio",       icon: Sparkles },
  { href: "/raw-log",       label: "Raw Log",      icon: ScrollText },
  { href: "/divine",        label: "Divine",       icon: Scale },
  { href: "/subscriptions", label: "Subs",         icon: Radio },
  { href: "/admin",         label: "Admin",        icon: ShieldCheck },
];

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <div className="relative grid h-8 w-8 place-items-center rounded-md border border-primary/40 bg-primary/10">
            <span className="font-mono text-sm font-bold text-primary">π</span>
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary glow-gold" aria-hidden />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">
              PiRC <span className="text-imperial">Warehouse</span>
            </span>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:inline">
              Sovereign Monetary Standard · v2.1
            </span>
          </div>
        </Link>

        <nav className="hidden flex-1 items-center gap-0.5 lg:flex">
          {NAV.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors",
                  active
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <span className="hidden items-center gap-2 rounded-full border border-primary/30 bg-primary/[0.08] px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-primary sm:inline-flex">
            <Activity className="h-3 w-3 pulse-dot" aria-hidden />
            Pi Testnet
          </span>
          <a
            href="https://github.com/Ze0ro99/PiRC"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>

      {/* Mobile / tablet nav */}
      <nav className="flex items-center gap-0.5 overflow-x-auto border-t border-border px-3 py-2 lg:hidden scrollbar-thin">
        {NAV.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors",
                active
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
