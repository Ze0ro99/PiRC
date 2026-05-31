import React, { useState } from "react";
import { useAuth } from "./AuthProvider";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { ArrowUpRight, Activity, Network, ShieldCheck, Box } from "lucide-react";

const mockYieldData = [
  { name: "Jan", yield: 4.2 },
  { name: "Feb", yield: 4.5 },
  { name: "Mar", yield: 5.1 },
  { name: "Apr", yield: 4.8 },
  { name: "May", yield: 5.4 },
  { name: "Jun", yield: 6.2 },
  { name: "Jul", yield: 5.9 },
];

const mockLayerData = [
  { name: "L1", volume: 4000 },
  { name: "L2", volume: 3000 },
  { name: "L3", volume: 2000 },
  { name: "L4", volume: 2780 },
  { name: "L5", volume: 1890 },
  { name: "L6", volume: 2390 },
  { name: "L7", volume: 3490 },
];

export function Dashboard() {
  const { user } = useAuth();
  const [stats] = useState({
    tvl: "15,245,000",
    activeNodes: "4,240",
    contracts: "156",
    health: "99.9%"
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Welcome back, @{user?.username}
          </h2>
          <p className="text-slate-400 mt-1">Here's what's happening in the PiRC Ecosystem today.</p>
        </div>
        <div className="flex gap-2">
          <select className="bg-[#111111] border border-white/5 rounded-lg px-4 py-2 text-sm font-medium text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500">
            <option>main</option>
            <option>dev</option>
            <option>staging</option>
          </select>
          <button className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Sync Repository
          </button>
        </div>
      </div>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Stat Cards */}
        <div className="md:col-span-3 bg-gradient-to-br from-violet-600/20 to-transparent rounded-2xl border border-violet-500/20 p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="h-16 w-16 text-violet-400" />
          </div>
          <div className="text-[10px] uppercase tracking-wider text-violet-300 font-bold mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Total Value Locked
          </div>
          <div className="text-4xl font-light tracking-tight text-white mb-2">{stats.tvl} <span className="text-base text-violet-400/60 font-mono">π</span></div>
          <div className="text-xs text-violet-400/70 flex items-center">
            <ArrowUpRight className="h-4 w-4 mr-1" />
            +12.5% this week
          </div>
        </div>

        <div className="md:col-span-3 bg-[#111111] border border-white/5 rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Network className="h-16 w-16 text-emerald-400" />
          </div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-3 flex items-center gap-2">
            <Network className="h-4 w-4" />
            Active Nodes
          </div>
          <div className="text-4xl font-light tracking-tight text-white mb-2">{stats.activeNodes}</div>
          <div className="text-xs flex items-center text-slate-500">
            <ArrowUpRight className="h-4 w-4 mr-1 text-emerald-400" />
            <span className="text-emerald-500/70">+4.2% this week</span>
          </div>
        </div>

        <div className="md:col-span-3 bg-[#111111] border border-white/5 rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Box className="h-16 w-16 text-amber-400" />
          </div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-3 flex items-center gap-2">
            <Box className="h-4 w-4" />
            Active Contracts
          </div>
          <div className="text-4xl font-light tracking-tight text-white mb-2">{stats.contracts}</div>
          <div className="text-xs text-slate-500 mt-1">
             Soroban / Stellar
          </div>
        </div>

        <div className="md:col-span-3 bg-[#111111] border border-white/5 rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldCheck className="h-16 w-16 text-blue-400" />
          </div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-3 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Network Health
          </div>
          <div className="text-4xl font-light tracking-tight text-white mb-2">{stats.health}</div>
          <div className="text-xs text-emerald-500/70 mt-1">
             Optimum Stability
          </div>
        </div>

        {/* Charts Section */}
        <div className="col-span-1 md:col-span-8 bg-[#111111] border border-white/5 rounded-2xl p-6 h-[400px]">
          <div className="mb-4">
            <h3 className="font-semibold text-lg">Ecosystem Yield & Economic Simulation</h3>
            <p className="text-slate-400 text-sm">Historical aggregate yield across all PiRC vaults.</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockYieldData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#475569" tick={{fill: '#94a3b8'}} />
                <YAxis stroke="#475569" tick={{fill: '#94a3b8'}} />
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc' }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Area type="monotone" dataKey="yield" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorYield)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-1 md:col-span-4 bg-[#111111] border border-white/5 rounded-2xl p-6 h-[400px]">
          <div className="mb-4">
            <h3 className="font-semibold text-lg">7-Layer Volume</h3>
            <p className="text-slate-400 text-sm">Traffic per architecture layer</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockLayerData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#475569" tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis stroke="#475569" tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#1e293b'}}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc' }}
                />
                <Bar dataKey="volume" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
