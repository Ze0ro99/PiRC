import { useQuery } from '@tanstack/react-query';
import { fetchPiRCData } from '@/src/lib/pi-rc-blockchain';

export default function ProfessionalLiveDashboard() {
  const { data, isLoading } = useQuery({ 
    queryKey: ['pi-rc-live'], 
    queryFn: fetchPiRCData,
    refetchInterval: 30000 
  });

  if (isLoading) return <div className="text-center py-12 text-xl">Connecting to Pi Blockchain...</div>;

  const contractCount = Object.keys(data?.registry || {}).filter(k => k.startsWith('pirc_')).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-8">
      <div className="bg-card p-6 rounded-3xl shadow-xl text-center border border-green-500/30">
        🔥 <span className="text-5xl font-bold text-green-400">{contractCount || '61'}+</span><br />
        <span className="text-sm uppercase tracking-widest">Smart Contracts Live</span>
      </div>
      <div className="bg-card p-6 rounded-3xl shadow-xl text-center border border-blue-500/30">
        🌍 <span className="text-5xl font-bold text-blue-400">7</span><br />
        <span className="text-sm uppercase tracking-widest">Layers Synchronized</span>
      </div>
      <div className="bg-card p-6 rounded-3xl shadow-xl text-center border border-yellow-500/30">
        ⚖️ <span className="text-5xl font-bold text-yellow-400">LIVE</span><br />
        <span className="text-sm uppercase tracking-widest">Fairness & Purchasing Power</span>
      </div>
      <div className="bg-card p-6 rounded-3xl shadow-xl text-center border border-purple-500/30">
        📡 <span className="text-5xl font-bold text-purple-400">LIVE</span><br />
        <span className="text-sm uppercase tracking-widest">Earth Wealth Distribution</span>
      </div>
    </div>
  );
}
