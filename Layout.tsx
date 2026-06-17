import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import {
  LayoutDashboard,
  Database,
  FileCode2,
  Search,
  LineChart,
  Layers,
  Building2,
  CreditCard,
  GitMerge,
  Menu,
  X,
  Wifi,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

// ─── Navigation items ─────────────────────────────────────────────────────────

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Repository Sync", href: "/sync", icon: GitMerge },
  { name: "Matrix Registry", href: "/matrix", icon: Database },
  { name: "Contracts Hub", href: "/contracts", icon: FileCode2 },
  { name: "Data Explorer", href: "/explorer", icon: Search },
  { name: "Economics Simulator", href: "/economics", icon: LineChart },
  { name: "7-Layer Visualizer", href: "/layers", icon: Layers },
  { name: "Real World Assets", href: "/rwa", icon: Building2 },
  { name: "Subscriptions", href: "/subscriptions", icon: CreditCard },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns a short label for the current deployment platform */
function getPlatformLabel(): string {
  if (typeof window === "undefined") return "server";
  const { hostname } = window.location;
  if (hostname.endsWith(".vercel.app") || hostname.endsWith(".vercel.sh")) return "Vercel";
  if (hostname.endsWith(".lovable.app") || hostname.endsWith(".lovableproject.com")) return "Lovable";
  if (hostname.endsWith(".replit.dev") || hostname.endsWith(".repl.co")) return "Replit";
  return "Local";
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut, loading, error, signIn } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const platform = getPlatformLabel();

  // ── Loading screen ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050505] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
          <p className="text-slate-400 text-sm">Authenticating with Pi Network...</p>
          <p className="text-slate-600 text-xs font-mono">{platform}</p>
        </div>
      </div>
    );
  }

  // ── Sign-in gate ──────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050505] text-white">
        <div className="p-8 max-w-md w-full bg-[#111111] border border-white/5 rounded-2xl shadow-2xl flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-violet-600 rounded-full flex items-center justify-center mb-6 text-white font-bold text-3xl select-none">
            π
          </div>
          <h2 className="text-2xl font-semibold mb-2 text-white">PiRC Sovereign Platform</h2>
          <p className="text-slate-400 text-sm mb-8">
            Connect your Pi Network account to access the dashboard and registries.
          </p>

          {error && (
            <div className="bg-red-950/50 border border-red-900/50 text-red-400 p-4 rounded-lg mb-6 w-full text-sm text-left">
              {error}
            </div>
          )}

          <button
            onClick={signIn}
            className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-500 active:scale-95 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
          >
            Sign in with Pi
          </button>

          <p className="mt-6 text-slate-600 text-xs font-mono">
            v2.4.0-quantum-ready &middot; {platform}
          </p>
        </div>
      </div>
    );
  }

  // ── Sidebar nav ───────────────────────────────────────────────────────────
  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
        <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center font-bold text-white select-none text-sm">
          π
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-tight text-white leading-none">PiRC Sovereign</h1>
          <span className="text-[10px] text-violet-400 font-mono">{platform}</span>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5">
        <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold px-2 mb-3">
          Platform
        </div>
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/5">
        <p className="text-[10px] text-slate-600 font-mono">v2.4.0-quantum-ready</p>
      </div>
    </>
  );

  // ── Full layout ───────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#050505] text-slate-200 overflow-hidden">

      {/* ── Mobile sidebar overlay ─────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Desktop sidebar ────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 bg-[#0a0a0a] border-r border-white/10 flex-col">
        <SidebarContent />
      </aside>

      {/* ── Mobile sidebar drawer ──────────────────────────────────────────── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-[#0a0a0a] border-r border-white/10 transform transition-transform duration-200 lg:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Navigation"
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Top header */}
        <header className="h-14 flex-shrink-0 border-b border-white/5 px-4 lg:px-8 flex items-center justify-between bg-black/40 backdrop-blur-md sticky top-0 z-30">
          {/* Left: Mobile menu + status pill */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-400 hover:text-white"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1 border border-white/10">
              <Wifi className="h-3 w-3 text-emerald-400" />
              <span className="text-xs font-mono text-emerald-400 hidden sm:inline">Matrix Connected</span>
            </div>
          </div>

          {/* Right: User + sign-out */}
          <div className="flex items-center gap-3">
            <button
              onClick={signOut}
              className="text-xs font-semibold px-3 py-1.5 border border-white/10 rounded-lg hover:bg-white/5 transition-all active:scale-95 text-slate-300"
            >
              Sign Out
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-white leading-none">@{user.username}</div>
                <div className="text-[10px] text-slate-500 font-mono w-20 truncate" title={user.uid}>
                  {user.uid}
                </div>
              </div>
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 border border-white/20 flex-shrink-0" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
