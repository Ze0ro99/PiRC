"use client";
import React, { useEffect, useState } from 'react';

export default function OmniDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    fetch('/data/analytics/mathematical_matrix.json')
      .then(res => res.json())
      .then(data => setAnalytics(data))
      .catch(console.error);
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto font-sans min-h-screen bg-gray-50">
      <h1 className="text-4xl font-extrabold mb-2 text-gray-900">⚡ Omni-Matrix Live Dashboard</h1>
      <p className="text-gray-600 mb-8">Real-time data visualization, mathematical computations, and container intelligence.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
          <h3 className="text-sm uppercase tracking-wide text-gray-500 font-bold mb-1">System Status</h3>
          <p className="text-2xl font-bold text-gray-900">{analytics?.status || "Loading..."}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
          <h3 className="text-sm uppercase tracking-wide text-gray-500 font-bold mb-1">Active Matrix Nodes</h3>
          <p className="text-2xl font-bold text-gray-900">{analytics?.calculations?.matrix_nodes_active || "0"}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-purple-500">
          <h3 className="text-sm uppercase tracking-wide text-gray-500 font-bold mb-1">Layer Packets</h3>
          <p className="text-2xl font-bold text-gray-900">{analytics?.calculations?.packets_processed || "0"}</p>
        </div>
      </div>

      <div className="mt-8 bg-black p-6 rounded-2xl text-green-400 font-mono shadow-xl overflow-x-auto">
        <h3 className="text-white font-sans text-lg mb-4 font-bold border-b border-gray-800 pb-2">Terminal Matrix Telemetry</h3>
        <pre>{analytics ? JSON.stringify(analytics, null, 2) : "Establishing secure link to Omni-Core..."}</pre>
      </div>
    </div>
  );
}
