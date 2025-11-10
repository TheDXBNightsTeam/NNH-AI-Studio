'use client';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export function StatsCard({
  title,
  value,
  icon,
  trend,
  color
}: {
  title: string;
  value: string;
  icon: string;
  trend: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'border-blue-500/20',
    purple: 'border-purple-500/20',
    green: 'border-green-500/20',
    orange: 'border-orange-500/20',
    yellow: 'border-yellow-500/20'
  };
  
  return (
    <div className={`bg-zinc-900/50 border ${colorClasses[color] || 'border-zinc-800'} rounded-xl p-6 hover:transform hover:-translate-y-1 transition-all`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className={`text-sm ${trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
          {trend}
        </span>
      </div>
      <div className="text-zinc-400 text-sm mb-1">{title}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );
}

export function PerformanceTrendsCard({ data }: { data: any[] }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">
        📈 Performance Trends
      </h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis 
            dataKey="date" 
            stroke="#71717a"
            tick={{ fill: '#71717a', fontSize: 12 }}
          />
          <YAxis stroke="#71717a" tick={{ fill: '#71717a', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="impressions" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="Impressions"
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="clicks" 
            stroke="#10b981" 
            strokeWidth={2}
            name="Clicks"
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="calls" 
            stroke="#f97316" 
            strokeWidth={2}
            name="Calls"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ImpressionsBreakdownCard({ data }: { data: any }) {
  const chartData = [
    { name: 'Search', value: Math.round(data.search || 0), color: '#3b82f6' },
    { name: 'Maps', value: Math.round(data.maps || 0), color: '#10b981' },
    { name: 'Discovery', value: Math.round(data.discovery || 0), color: '#f59e0b' },
    { name: 'Direct', value: Math.round(data.direct || 0), color: '#8b5cf6' }
  ];
  
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">
        📊 Impressions Breakdown
      </h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="name" stroke="#71717a" tick={{ fill: '#71717a', fontSize: 12 }} />
          <YAxis stroke="#71717a" tick={{ fill: '#71717a', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ReviewSentimentCard({ sentiment }: { sentiment: any }) {
  const data = [
    { name: 'Positive', value: sentiment.positive || 0, color: '#10b981' },
    { name: 'Neutral', value: sentiment.neutral || 0, color: '#f59e0b' },
    { name: 'Negative', value: sentiment.negative || 0, color: '#ef4444' }
  ].filter(item => item.value > 0);
  
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">
        💬 Review Sentiment Analysis
      </h3>
      
      {total > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.name}: ${entry.value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[300px] flex items-center justify-center text-zinc-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p>No review data available</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function TopLocationsCard({ locations }: { locations: Array<{ name: string; impressions: number; rating: number }> }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">
        📍 Top Performing Locations
      </h3>
      
      {locations.length > 0 ? (
        <div className="space-y-4">
          {locations.map((location, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-white">{location.name}</div>
                  <div className="text-sm text-zinc-400">
                    ⭐ {location.rating.toFixed(1)} rating
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-white">
                  {location.impressions.toLocaleString()}
                </div>
                <div className="text-xs text-zinc-400">impressions</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-zinc-500">
          <div className="text-4xl mb-2">📍</div>
          <p>No location data available</p>
        </div>
      )}
    </div>
  );
}

export function TopKeywordsCard({ keywords }: { keywords: Array<{ keyword: string; searches: number; trend: number }> }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">
        🔍 Top Search Keywords
      </h3>
      
      {keywords.length > 0 ? (
        <div className="space-y-3">
          {keywords.map((keyword, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-orange-600/20 rounded flex items-center justify-center text-orange-400 text-xs font-bold">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-white">{keyword.keyword}</div>
                  <div className="text-xs text-zinc-400">
                    {keyword.searches.toLocaleString()} searches
                  </div>
                </div>
              </div>
              <div className={`text-sm font-medium ${keyword.trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {keyword.trend > 0 ? '↑' : '↓'}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-zinc-500">
          <div className="text-4xl mb-2">🔍</div>
          <p>No keyword data available</p>
        </div>
      )}
    </div>
  );
}

export function AIInsightsSection({ insights }: { insights: any[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="text-2xl">💡</div>
        <div>
          <h3 className="text-xl font-bold text-white">Business Insights</h3>
          <p className="text-sm text-zinc-400">
            AI-powered analysis of your Google Business Profile performance
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, index) => (
          <InsightCard key={index} insight={insight} />
        ))}
      </div>
    </div>
  );
}

function InsightCard({ insight }: { insight: any }) {
  const priorityColors: Record<string, string> = {
    high: 'border-red-500/30 bg-red-950/20',
    medium: 'border-orange-500/30 bg-orange-950/20',
    low: 'border-green-500/30 bg-green-950/20'
  };
  
  const priorityBadges: Record<string, string> = {
    high: 'bg-red-500/20 text-red-400',
    medium: 'bg-orange-500/20 text-orange-400',
    low: 'bg-green-500/20 text-green-400'
  };
  
  return (
    <div className={`border rounded-xl p-6 ${priorityColors[insight.priority] || 'border-zinc-800'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">
            {insight.priority === 'high' ? '🔴' : insight.priority === 'medium' ? '🟡' : '🟢'}
          </span>
          <h4 className="font-bold text-white">{insight.title}</h4>
        </div>
        <span className={`text-xs px-2 py-1 rounded ${priorityBadges[insight.priority] || 'bg-zinc-500/20 text-zinc-400'} uppercase font-medium`}>
          {insight.priority}
        </span>
      </div>
      
      <p className="text-sm text-zinc-300 mb-3">
        {insight.description}
      </p>
      
      {insight.progress !== undefined && (
        <div>
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span>Progress</span>
            <span>{insight.progress}%</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-orange-600 rounded-full transition-all"
              style={{ width: `${insight.progress}%` }}
            />
          </div>
        </div>
      )}
      
      <div className="mt-3 text-xs text-zinc-500">
        📁 {insight.category}
      </div>
    </div>
  );
}

