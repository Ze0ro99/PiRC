import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import EconomicSimulatorDashboard from './EconomicSimulator';

export function DashboardLayout() {
  const { user, isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">🔐 Authentication Required</h1>
          <p className="text-gray-400">Connect your Pi Network wallet to access the simulator</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold text-white">🚀 PiRC v3.1.0</div>
          <div className="text-gray-400">
            Signed in as: <span className="text-white font-bold">{user?.address?.slice(0, 10)}...</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <EconomicSimulatorDashboard />
    </div>
  );
}

export default DashboardLayout;
