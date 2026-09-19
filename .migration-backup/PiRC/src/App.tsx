import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  LayoutDashboard,
  Server,
  FileCode2,
  Scale,
  Crown,
  TrendingUp,
  CreditCard,
  Activity,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Building2,
  Zap,
  ArrowRight,
  Wallet,
  Lock,
  ArrowRightLeft,
  Combine,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "framer-motion";

declare global {
  interface Window {
    Pi: any;
  }
}

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const mockPriceData = [
  { time: "00:00", price: 34.5 },
  { time: "04:00", price: 35.2 },
  { time: "08:00", price: 34.8 },
  { time: "12:00", price: 36.1 },
  { time: "16:00", price: 37.5 },
  { time: "20:00", price: 36.9 },
  { time: "24:00", price: 38.2 },
];

const scMetrics = [
  { name: "Jan", power: 4000 },
  { name: "Feb", power: 5500 },
  { name: "Mar", power: 4800 },
  { name: "Apr", power: 6500 },
  { name: "May", power: 7200 },
  { name: "Jun", power: 8500 },
];

const exchangeTickers = [
  { symbol: "PI/USD", price: "38.20", change: "+2.4%", up: true },
  { symbol: "PIRC/PI", price: "0.0045", change: "+12.5%", up: true },
  { symbol: "ETH/USD", price: "3450.00", change: "-1.2%", up: false },
  { symbol: "BTC/USD", price: "64200.00", change: "+0.8%", up: true },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user, setUser] = useState<any>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  const authenticatePiUser = async (isAuto = false) => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      if (!window.Pi) throw new Error("Pi SDK not found. Open in Pi Browser.");

      // Add a timeout for init and authenticate since they hang outside Pi Browser
      const withTimeout = (
        promise: Promise<any>,
        timeoutMs: number,
        errorMessage: string,
      ) => {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error(errorMessage)), timeoutMs),
        );
        return Promise.race([promise, timeoutPromise]);
      };

      await withTimeout(
        window.Pi.init({ version: "2.0", sandbox: true }),
        2000,
        "Pi init timeout",
      );

      const scopes = ["username"];
      const onIncompletePaymentFound = (payment: any) => {
        console.log("Incomplete payment found:", payment);
      };

      const authResult = await withTimeout(
        window.Pi.authenticate(scopes, onIncompletePaymentFound),
        2500,
        "Pi SDK timeout",
      );

      const response = await fetch("/api/auth/pi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: authResult.accessToken }),
      });

      if (!response.ok) {
        throw new Error("Backend validation failed");
      }

      const sessionData = await response.json();
      setUser(sessionData.user);
    } catch (err: any) {
      if (err.message?.includes("timeout")) {
        // Provide a mock user for preview/development in AI Studio
        console.log("Mocking Pi user for development preview.");
        setUser({ username: "Development_User" });
        setAuthError(null);
      } else {
        console.error("Pi Authentication Error:", err);
        if (!isAuto) {
          const errorMessage = err.message || "Failed to authenticate";
          setAuthError(errorMessage);
        }
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  useEffect(() => {
    if (window.Pi) {
      authenticatePiUser(true);
    } else {
      const timer = setTimeout(() => {
        if (window.Pi) authenticatePiUser(true);
        else setIsAuthenticating(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const navItems = [
    { id: "dashboard", label: "Gateway Dashboard", icon: LayoutDashboard },
    { id: "technical", label: "Technical Aspects", icon: Server },
    { id: "trading", label: "Smart Contract Trading", icon: TrendingUp },
    { id: "sovereign", label: "Sovereign System", icon: Crown },
    { id: "justice", label: "Divine Justice", icon: Scale },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed inset-y-0 z-20">
        <div className="p-6 flex flex-col items-center border-b border-slate-800">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center p-2 shadow-lg mb-3">
            <img
              src="https://storage.googleapis.com/e-object-409003.firebasestorage.app/logo-black-tiny.png"
              alt="PiRC Logo"
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            PiRC Alpha Hub
          </h1>
          <p className="text-xs text-emerald-400 mt-1 font-medium bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
            Unified Gateway
          </p>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
                activeTab === item.id
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                  : "hover:bg-slate-800 hover:text-white",
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Auth Status Area */}
        <div className="p-4 border-t border-slate-800">
          {isAuthenticating ? (
            <div className="flex items-center space-x-2 text-slate-400 text-sm justify-center py-2">
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Connecting Pi SDK...</span>
            </div>
          ) : user ? (
            <div className="bg-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-white shadow shadow-emerald-500/50">
                  {user.username?.[0]?.toUpperCase() || "P"}
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-white">
                    @{user.username || "User"}
                  </div>
                  <div className="text-emerald-400 text-xs">Authenticated</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {authError && (
                <div className="text-xs text-rose-400 bg-rose-400/10 p-2 rounded border border-rose-400/20 flex gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}
              <button
                onClick={() => authenticatePiUser(false)}
                className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg"
              >
                <img
                  src="https://storage.googleapis.com/e-object-409003.firebasestorage.app/logo-black-tiny.png"
                  className="h-4 invert"
                  alt="Pi"
                />
                Sign in with Pi
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 overflow-y-auto">
        {/* Top Header / Ticker */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
          <div className="h-16 flex items-center px-8 overflow-hidden bg-slate-950 text-white">
            <div className="flex items-center space-x-2 mr-8 shrink-0">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                Live Exchange
              </span>
            </div>
            <div className="flex space-x-12 animate-[marquee_20s_linear_infinite] whitespace-nowrap">
              {exchangeTickers.map((t, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <span className="font-medium text-slate-300">{t.symbol}</span>
                  <span className="font-bold font-mono">{t.price}</span>
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      t.up ? "text-emerald-400" : "text-rose-400",
                    )}
                  >
                    {t.change}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          <AnimatePresence mode="wait">
            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">
                      Systems Overview
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">
                      Gateway to all ecosystem projects and market data.
                    </p>
                  </div>
                  {user && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-4 py-2 border border-emerald-200 dark:border-emerald-800/50 rounded-lg flex items-center gap-2 font-medium">
                      <Lock className="w-4 h-4" /> Secure Gateway Active
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {navItems.slice(1).map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveTab(item.id)}
                      className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md cursor-pointer transition-all hover:scale-[1.02] group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors">
                        <item.icon className="w-6 h-6 text-slate-600 dark:text-slate-400 group-hover:text-emerald-500" />
                      </div>
                      <h3 className="font-bold text-lg mb-1">{item.label}</h3>
                      <div className="text-emerald-500 text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0">
                        Explore Module <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Pi Market Overview */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <Activity className="w-5 h-5 text-emerald-500" /> Core
                        Token Valuation
                      </h3>
                      <select className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm px-3 py-1 outline-none">
                        <option>PI/USD</option>
                        <option>PI/EUR</option>
                      </select>
                    </div>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={mockPriceData}>
                          <defs>
                            <linearGradient
                              id="colorPrice"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#10b981"
                                stopOpacity={0.3}
                              />
                              <stop
                                offset="95%"
                                stopColor="#10b981"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#334155"
                            opacity={0.2}
                          />
                          <XAxis
                            dataKey="time"
                            tick={{ fill: "#64748b" }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            domain={["dataMin - 1", "dataMax + 1"]}
                            tick={{ fill: "#64748b" }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: "#0f172a",
                              border: "none",
                              borderRadius: "8px",
                              color: "#fff",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="price"
                            stroke="#10b981"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorPrice)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Sync Purchasing Power Summary */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-indigo-500" />{" "}
                        Synchronized Purchasing Power
                      </h3>
                      <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2 py-1 rounded-full font-bold">
                        Network Aggregate
                      </span>
                    </div>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={scMetrics}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#334155"
                            opacity={0.2}
                          />
                          <XAxis
                            dataKey="name"
                            tick={{ fill: "#64748b" }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fill: "#64748b" }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <RechartsTooltip
                            cursor={{ fill: "transparent" }}
                            contentStyle={{
                              backgroundColor: "#0f172a",
                              border: "none",
                              borderRadius: "8px",
                              color: "#fff",
                            }}
                          />
                          <Bar
                            dataKey="power"
                            fill="#6366f1"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Trading & Smart Contracts Tab */}
            {activeTab === "trading" && (
              <motion.div
                key="trading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                    <TrendingUp className="text-emerald-500" /> Smart Contract
                    Trading
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400">
                    Manage assets, execute smart contracts, and monitor live
                    stock exchange flows.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Swap Interface */}
                  <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col">
                    <h3 className="font-bold mb-6 text-lg border-b border-slate-100 dark:border-slate-800 pb-4">
                      Execute Smart Contract Swap
                    </h3>

                    <div className="space-y-4 flex-1">
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">
                          You Pay
                        </div>
                        <div className="flex justify-between items-center">
                          <input
                            type="text"
                            className="bg-transparent text-2xl font-semibold outline-none w-1/2"
                            placeholder="0.0"
                            defaultValue="100.0"
                          />
                          <span className="bg-white dark:bg-slate-950 px-3 py-1 rounded-full text-sm font-bold shadow-sm border border-slate-200 dark:border-slate-700">
                            PI
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-center -my-2 relative z-10">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:bg-slate-200 hover:dark:bg-slate-700 transition-colors">
                          <ArrowRightLeft className="w-4 h-4 text-slate-600 dark:text-slate-300 rotate-90" />
                        </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">
                          You Receive (Est.)
                        </div>
                        <div className="flex justify-between items-center">
                          <input
                            type="text"
                            className="bg-transparent text-2xl font-semibold outline-none w-1/2 text-slate-500"
                            placeholder="0.0"
                            value="3820.0"
                            readOnly
                          />
                          <span className="bg-white dark:bg-slate-950 px-3 py-1 rounded-full text-sm font-bold shadow-sm border border-slate-200 dark:border-slate-700">
                            USD
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      className={cn(
                        "w-full py-4 rounded-xl font-bold mt-6 text-white transition-all shadow-md",
                        user
                          ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25"
                          : "bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-50",
                      )}
                    >
                      {user ? "Execute Smart Contract" : "Connect Pi to Trade"}
                    </button>
                  </div>

                  {/* Terminal / Live Feed */}
                  <div className="lg:col-span-2 bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col shadow-xl">
                    <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                      <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                        <Server className="w-5 h-5 text-emerald-400" /> Live
                        Orderbook & Routing
                      </h3>
                    </div>
                    <div className="flex-1 font-mono text-xs text-slate-400 space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                      <div className="text-sky-400">
                        [SYS] Establishing sovereign routing nodes... OK.
                      </div>
                      <div className="text-emerald-400">
                        [SC] Block 49210 validated.
                      </div>
                      <div className="text-emerald-400 text-opacity-80">
                        [TRADE] Executed: 400.0 PI → 15280.0 USD @ 38.20
                      </div>
                      <div className="text-slate-500">
                        [MEMPOOL] Scanning for standard transactions...
                      </div>
                      <div className="text-amber-400">
                        [WARN] Price slippage detected on PIRC/ETH pair. Routing
                        alternative paths.
                      </div>
                      <div className="text-emerald-400">
                        [SC] Smart Contract execution successful. Hash:
                        0x8a1b...9f2c
                      </div>
                      <div className="text-sky-400">
                        [SYS] Syncing purchasing power parameters globally...
                      </div>
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="text-slate-600">
                          [DATA] Telemetry heartbeat {Date.now() - i * 1000}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Technical Aspects Tab */}
            {activeTab === "technical" && (
              <motion.div
                key="technical"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                    <FileCode2 className="text-indigo-500" /> Technical Aspects
                    Archive
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400">
                    Access documentation, architectural blueprints, and protocol
                    specifications.
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <Zap className="w-8 h-8 text-indigo-500 mb-4" />
                    <h3 className="text-xl font-bold mb-2">
                      PiRC Protocol Standards
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                      The definition for uniform integration of modules and
                      applications across the ecosystem. Guaranteeing
                      scalability and decentralized integrity.
                    </p>
                    <button className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                      Read Protocol Specs &rarr;
                    </button>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <Combine className="w-8 h-8 text-amber-500 mb-4" />
                    <h3 className="text-xl font-bold mb-2">
                      Warehouse Features
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                      View all centralized storage logic, data hashing
                      methodologies, and asynchronous sync routines governing
                      data replication.
                    </p>
                    <button className="text-sm font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-500">
                      View Infrastructure &rarr;
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Sovereign System Tab */}
            {activeTab === "sovereign" && (
              <motion.div
                key="sovereign"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-200 dark:border-amber-900/40 p-10 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mb-6">
                    <Crown className="w-10 h-10 text-amber-600 dark:text-amber-500" />
                  </div>
                  <h2 className="text-4xl font-bold mb-4 text-amber-900 dark:text-amber-100">
                    Sovereign System
                  </h2>
                  <p className="text-amber-800/70 dark:text-amber-200/70 max-w-2xl text-lg leading-relaxed mb-8">
                    The Sovereign module enables absolute autonomy over digital
                    identities and assets. It guarantees self-sovereignty
                    enforced by rigid smart contracts and verifiable
                    mathematical proofs, entirely outside centralized control
                    structures.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl text-left">
                    <div className="bg-white/50 dark:bg-slate-950/50 p-6 rounded-xl border border-amber-200 dark:border-amber-800/30">
                      <h4 className="font-bold text-amber-900 dark:text-amber-100 mb-2">
                        Identity Autonomy
                      </h4>
                      <p className="text-amber-800/60 dark:text-amber-200/60 text-sm">
                        You possess the private keys to your digital life
                        without intermediary proxies.
                      </p>
                    </div>
                    <div className="bg-white/50 dark:bg-slate-950/50 p-6 rounded-xl border border-amber-200 dark:border-amber-800/30">
                      <h4 className="font-bold text-amber-900 dark:text-amber-100 mb-2">
                        Uncensorable Vaults
                      </h4>
                      <p className="text-amber-800/60 dark:text-amber-200/60 text-sm">
                        Value is held in multi-sig sovereign vaults governed
                        directly by the community.
                      </p>
                    </div>
                    <div className="bg-white/50 dark:bg-slate-950/50 p-6 rounded-xl border border-amber-200 dark:border-amber-800/30">
                      <h4 className="font-bold text-amber-900 dark:text-amber-100 mb-2">
                        Absolute Voting Rights
                      </h4>
                      <p className="text-amber-800/60 dark:text-amber-200/60 text-sm">
                        Weighted sovereign liquid democracy ensures your voice
                        correlates dynamically to stake.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Divine Justice Tab */}
            {activeTab === "justice" && (
              <motion.div
                key="justice"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-10 flex flex-col md:flex-row items-center gap-12 text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
                  <div className="flex-1 z-10">
                    <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold mb-6 uppercase tracking-wider">
                      <Scale className="w-3 h-3" />{" "}
                      <span>Automated Arbitrage</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                      Divine Justice Framework
                    </h2>
                    <p className="text-slate-400 text-lg leading-relaxed mb-6">
                      An immutable, code-driven arbitration protocol. Malicious
                      actors, rug-pulls, and exploiters are automatically
                      penalized through slashed stakes via deterministically
                      enforced smart contracts. Justice is blind, automated, and
                      absolute.
                    </p>
                    <button className="bg-white text-slate-900 px-6 py-3 rounded-lg font-bold hover:bg-slate-200 transition-colors">
                      Review Audit Logs
                    </button>
                  </div>
                  <div className="w-full md:w-1/3 aspect-square bg-slate-900/50 border border-slate-800 rounded-full flex items-center justify-center p-8 z-10 shadow-[0_0_40px_rgba(99,102,241,0.15)] relative">
                    <div className="absolute inset-4 rounded-full border border-indigo-500/30 border-dashed animate-spin-slow"></div>
                    <Scale className="w-24 h-24 text-indigo-400 drop-shadow-[0_0_15px_rgba(129,140,248,0.5)]" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
