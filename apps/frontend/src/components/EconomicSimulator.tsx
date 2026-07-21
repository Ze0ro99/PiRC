import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as SorobanClient from 'soroban-client';

interface SimulationScenario {
  id: string;
  name: string;
  qwf_growth: number;
  ippr_adjustment: number;
  oracle_volatility: number;
  duration_epochs: number;
}

interface MetricSnapshot {
  timestamp: number;
  qwf: number;
  ippr: number;
  network_velocity: number;
  collateral_ratio: number;
  minting_rate: number;
}

export function EconomicSimulatorDashboard() {
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([
    {
      id: 's1',
      name: 'Bull Market (+15%)',
      qwf_growth: 0.15,
      ippr_adjustment: 0.20,
      oracle_volatility: 0.08,
      duration_epochs: 365,
    },
    {
      id: 's2',
      name: 'Bear Market (-10%)',
      qwf_growth: -0.10,
      ippr_adjustment: -0.15,
      oracle_volatility: 0.25,
      duration_epochs: 365,
    },
    {
      id: 's3',
      name: 'Black Swan (-50%)',
      qwf_growth: -0.50,
      ippr_adjustment: -0.40,
      oracle_volatility: 0.75,
      duration_epochs: 365,
    },
  ]);

  const [selectedScenario, setSelectedScenario] = useState<string>('s1');
  const [liveMetrics, setLiveMetrics] = useState<MetricSnapshot[]>([]);
  const [sorobanClient, setSorobanClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [contractData, setContractData] = useState<any>(null);

  // Initialize Soroban client and WebSocket connection
  useEffect(() => {
    const initializeSorobanClient = async () => {
      try {
        // Connect to Stellar Soroban testnet
        const server = new SorobanClient.Server(
          'https://soroban-testnet.stellar.org'
        );
        setSorobanClient(server);

        // Subscribe to contract state changes
        const contractId = process.env.REACT_APP_CONTRACT_ID || '';
        const contractData = await server.getContractData(contractId);
        setContractData(contractData);

        // Subscribe to WebSocket for real-time updates
        const ws = new WebSocket(process.env.REACT_APP_SIMULATOR_WS || 'wss://simulator.example.com/metrics');
        
        ws.onmessage = (event) => {
          const metric = JSON.parse(event.data);
          setLiveMetrics(prev => [...prev.slice(-99), metric]);
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        setLoading(false);
      } catch (error) {
        console.error('Failed to initialize Soroban client:', error);
        setLoading(false);
      }
    };

    initializeSorobanClient();
  }, []);

  // Compute projections for selected scenario
  const projections = useMemo(() => {
    const scenario = scenarios.find(s => s.id === selectedScenario);
    if (!scenario) return [];

    const data: MetricSnapshot[] = [];
    let currentQWF = 10000000; // Base value
    let currentIPPR = 2248000; // $2,248,000 USD equivalent

    for (let epoch = 0; epoch < scenario.duration_epochs; epoch++) {
      // Apply QWF growth rate
      currentQWF = currentQWF * (1 + scenario.qwf_growth / scenario.duration_epochs);

      // Apply IPPR adjustment
      currentIPPR = currentIPPR * (1 + scenario.ippr_adjustment / scenario.duration_epochs);

      // Calculate network velocity with volatility
      const volatility = Math.sin(epoch / 50) * scenario.oracle_volatility;
      const networkVelocity = 0.5 + (Math.random() * volatility);

      // Reflexive constraint: Φ = (L_n * IPPR) / QWF
      const phi = (networkVelocity * currentIPPR) / currentQWF;

      // Collateral ratio: Pi locked / Total issuance
      const collateralRatio = phi > 1 ? 1.0 : Math.max(0.5, phi);

      // Minting rate based on reflexive constraint
      const mintingRate = phi >= 1 ? 0.02 : Math.max(0, 0.02 * phi);

      data.push({
        timestamp: epoch,
        qwf: Math.round(currentQWF),
        ippr: Math.round(currentIPPR),
        network_velocity: parseFloat(networkVelocity.toFixed(4)),
        collateral_ratio: parseFloat(collateralRatio.toFixed(4)),
        minting_rate: parseFloat(mintingRate.toFixed(4)),
      });
    }

    return data;
  }, [selectedScenario, scenarios]);

  // Export functionality
  const exportToCSV = () => {
    const scenario = scenarios.find(s => s.id === selectedScenario);
    const csv = [
      ['Epoch', 'QWF', 'IPPR (USD)', 'Network Velocity', 'Collateral Ratio', 'Minting Rate'],
      ...projections.map(p => [
        p.timestamp,
        p.qwf,
        p.ippr,
        p.network_velocity,
        p.collateral_ratio,
        p.minting_rate,
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pirc-simulation-${scenario?.name}-${Date.now()}.csv`;
    a.click();
  };

  if (loading) {
    return <div className="p-8 text-center">Connecting to Stellar Soroban...</div>;
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">🔮 PiRC Economic Simulator</h1>
        <p className="text-gray-300">Real-time scenario modeling with Stellar Soroban integration</p>
      </div>

      {/* Scenario Selection */}
      <div className="bg-slate-700 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Scenario Selection</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scenarios.map(scenario => (
            <button
              key={scenario.id}
              onClick={() => setSelectedScenario(scenario.id)}
              className={`p-4 rounded-lg transition ${
                selectedScenario === scenario.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-600 hover:bg-slate-500 text-gray-300'
              }`}
            >
              <div className="font-bold">{scenario.name}</div>
              <div className="text-sm mt-2">Growth: {(scenario.qwf_growth * 100).toFixed(1)}%</div>
            </button>
          ))}
        </div>
      </div>

      {/* Live Metrics */}
      {liveMetrics.length > 0 && (
        <div className="bg-slate-700 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">📊 Live Metrics (Stellar Testnet)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'QWF', value: liveMetrics[liveMetrics.length - 1]?.qwf || 0, format: (v) => `${(v / 1e6).toFixed(2)}M` },
              { label: 'IPPR', value: liveMetrics[liveMetrics.length - 1]?.ippr || 0, format: (v) => `$${(v / 1e6).toFixed(2)}M` },
              { label: 'Network Velocity', value: liveMetrics[liveMetrics.length - 1]?.network_velocity || 0, format: (v) => v.toFixed(4) },
              { label: 'Collateral Ratio', value: liveMetrics[liveMetrics.length - 1]?.collateral_ratio || 0, format: (v) => `${(v * 100).toFixed(2)}%` },
            ].map(metric => (
              <div key={metric.label} className="bg-slate-600 p-4 rounded">
                <div className="text-gray-400 text-sm">{metric.label}</div>
                <div className="text-2xl font-bold mt-2">{metric.format(metric.value)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* QWF & IPPR Projection */}
        <div className="bg-slate-700 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Quantum Wealth Factor & IPPR</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={projections}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="qwf" stroke="#60a5fa" name="QWF" />
              <Line yAxisId="right" type="monotone" dataKey="ippr" stroke="#34d399" name="IPPR (USD)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Network Velocity & Collateral */}
        <div className="bg-slate-700 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Network Stability Metrics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={projections}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="network_velocity" stroke="#f59e0b" name="Network Velocity" />
              <Line type="monotone" dataKey="collateral_ratio" stroke="#8b5cf6" name="Collateral Ratio" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Minting Rate Analysis */}
      <div className="bg-slate-700 rounded-lg p-6 mb-8">
        <h3 className="text-xl font-bold mb-4">Minting Rate (Reflexive Control)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={projections}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="minting_rate" fill="#ef4444" name="Minting Rate" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Export & Actions */}
      <div className="bg-slate-700 rounded-lg p-6 flex gap-4">
        <button
          onClick={exportToCSV}
          className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded font-bold transition"
        >
          📥 Export to CSV
        </button>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-bold transition"
        >
          🔄 Refresh Data
        </button>
        {contractData && (
          <div className="ml-auto text-gray-400 text-sm pt-2">
            ✅ Connected to Stellar Soroban
          </div>
        )}
      </div>
    </div>
  );
}

export default EconomicSimulatorDashboard;
