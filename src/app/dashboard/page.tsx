import React from 'react';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="border-b border-white/10 pb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent uppercase">PiRC Supreme Dashboard</h1>
            <p className="text-gray-400 mt-2 font-mono text-sm">OMNI-ENGINE: MATH & LIVE SYNC PROTOCOL VIRAL NODE</p>
          </div>
          <div className="flex items-center space-x-2 text-emerald-400 font-mono text-sm">
            <span className="animate-pulse h-3 w-3 bg-emerald-500 rounded-full inline-block"></span>
            <span>SYSTEM ONLINE</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Vectors Resolved</h3>
            <div className="text-4xl font-light">8,421</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Network Delta</h3>
            <div className="text-4xl font-light text-cyan-400">0.041<span className="text-xl ml-1">ms</span></div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Webhook Lock</h3>
            <div className="text-xl font-mono text-indigo-400 break-all select-all flex justify-between items-center">
              PiRC_Omni_Secret_2026
              <span className="text-[10px] text-green-500 font-bold border border-green-500/20 px-2 rounded-full py-1">SECURE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
