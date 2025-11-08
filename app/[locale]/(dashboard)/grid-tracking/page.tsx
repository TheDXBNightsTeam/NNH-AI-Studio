import { GridHeatmap, GridPointDetails, RankingTrends } from './GridComponents';

// TypeScript Interfaces
interface GridPoint {
  x: number;
  y: number;
  lat: number;
  lng: number;
  rank: number | null;
  distance: number; // km from center
}

interface GridData {
  location_id: string;
  location_name: string;
  keyword: string;
  grid_size: 5 | 10 | 20;
  center_lat: number;
  center_lng: number;
  grid: GridPoint[][];
  stats: {
    averageRank: number;
    top3Count: number;
    top3Percentage: number;
    coveragePercentage: number;
    bestRank: number;
    worstRank: number;
  };
  checked_at: string;
}

// Stats Card Component
function GridStatsCard({
  title,
  value,
  icon,
  color,
  subtitle
}: {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  subtitle?: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'border-blue-500/20',
    green: 'border-green-500/20',
    red: 'border-red-500/20',
    purple: 'border-purple-500/20',
    orange: 'border-orange-500/20',
    zinc: 'border-zinc-500/20'
  };
  
  return (
    <div className={`bg-zinc-900/50 border ${colorClasses[color] || 'border-zinc-800'} rounded-xl p-4 hover:transform hover:-translate-y-1 transition-all`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <span className="text-zinc-400 text-xs">{title}</span>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      {subtitle && (
        <div className="text-xs text-zinc-500">{subtitle}</div>
      )}
    </div>
  );
}

// Main Component
export default async function GridTrackingPage() {
  // In Phase 3, fetch from database
  // For now, placeholder
  const gridData = null; // TODO: Replace with Supabase or API fetch
  window.dispatchEvent(new Event('dashboard:refresh'));
  console.log('[GridTrackingPage] Dashboard refresh triggered');
  
  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              🗺️ Local Grid Tracking
            </h1>
            <p className="text-zinc-400">
              Track your local search rankings across geographic points
            </p>
          </div>
          
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg font-medium transition">
              📊 View Report
            </button>
            <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium transition">
              🔄 Refresh Data
            </button>
          </div>
        </div>
        
        {/* Controls */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Location</label>
              <select className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-orange-500 focus:outline-none">
                <option>{gridData?.location_name ?? 'Loading...'}</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Search Keyword</label>
              <select className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-orange-500 focus:outline-none">
                <option>restaurant near me</option>
                <option>best restaurant dubai</option>
                <option>night club dubai</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Grid Size</label>
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white text-sm transition">
                  5×5
                </button>
                <button className="flex-1 px-3 py-2 bg-orange-600 rounded-lg text-white text-sm">
                  10×10
                </button>
                <button className="flex-1 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white text-sm transition">
                  20×20
                </button>
              </div>
            </div>
            
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Time Period</label>
              <select className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-orange-500 focus:outline-none">
                <option>Current</option>
                <option>Last Week</option>
                <option>Last Month</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <GridStatsCard
            title="Avg Rank"
            value={gridData?.stats.averageRank?.toString() ?? '-'}
            icon="📊"
            color="blue"
          />
          <GridStatsCard
            title="Best Rank"
            value={gridData ? `#${gridData.stats.bestRank}` : '-'}
            icon="🏆"
            color="green"
          />
          <GridStatsCard
            title="Worst Rank"
            value={gridData ? `#${gridData.stats.worstRank}` : '-'}
            icon="⚠️"
            color="red"
          />
          <GridStatsCard
            title="Top 3"
            value={gridData ? `${gridData.stats.top3Percentage}%` : '-'}
            icon="🎯"
            color="purple"
            subtitle={gridData ? `${gridData.stats.top3Count} points` : undefined}
          />
          <GridStatsCard
            title="Coverage"
            value={gridData ? `${gridData.stats.coveragePercentage}%` : '-'}
            icon="📍"
            color="orange"
          />
          <GridStatsCard
            title="Grid Points"
            value={gridData ? gridData.grid_size * gridData.grid_size : '-'}
            icon="🗺️"
            color="zinc"
          />
        </div>
        
        {/* Main Grid Heatmap */}
        {gridData ? <GridHeatmap gridData={gridData} /> : <div className="text-zinc-400 text-center py-20">Loading grid data...</div>}
        
        {/* Bottom Row: Details + Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {gridData ? <GridPointDetails gridData={gridData} /> : null}
          <RankingTrends />
        </div>
        
      </div>
    </div>
  );
}
