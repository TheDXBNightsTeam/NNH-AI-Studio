import { createClient } from '@/lib/supabase/server';
import {
  StatsCard,
  PerformanceTrendsCard,
  ImpressionsBreakdownCard,
  ReviewSentimentCard,
  TopLocationsCard,
  TopKeywordsCard,
  AIInsightsSection
} from './AnalyticsComponents';

// TypeScript Interfaces
interface AnalyticsData {
  stats: {
    totalImpressions: number;
    websiteClicks: number;
    phoneCalls: number;
    directionRequests: number;
    totalReviews: number;
  };
  topLocations: Array<{
    name: string;
    impressions: number;
    rating: number;
  }>;
  impressionsBreakdown: {
    search: number;
    maps: number;
    discovery: number;
    direct: number;
  };
  performanceTrends: Array<{
    date: string;
    impressions: number;
    clicks: number;
    calls: number;
  }>;
  topKeywords: Array<{
    keyword: string;
    searches: number;
    trend: number;
  }>;
  reviewSentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  aiInsights: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    category: string;
    progress?: number;
  }>;
}

// Helper function to get default analytics
function getDefaultAnalytics(): AnalyticsData {
  return {
    stats: {
      totalImpressions: 0,
      websiteClicks: 0,
      phoneCalls: 0,
      directionRequests: 0,
      totalReviews: 0
    },
    topLocations: [],
    impressionsBreakdown: {
      search: 0,
      maps: 0,
      discovery: 0,
      direct: 0
    },
    performanceTrends: [],
    topKeywords: [],
    reviewSentiment: {
      positive: 0,
      neutral: 0,
      negative: 0
    },
    aiInsights: []
  };
}

// Data Fetching Function
async function getAnalyticsData(): Promise<AnalyticsData> {
  const supabase = await createClient();
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return getDefaultAnalytics();
    }

    // Get performance metrics (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: metrics } = await supabase
      .from('gmb_performance_metrics')
      .select('*')
      .eq('user_id', user.id)
      .gte('metric_date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('metric_date', { ascending: false });

    // Get locations performance
    const { data: locations } = await supabase
      .from('gmb_locations')
      .select('id, location_name, rating, review_count')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('review_count', { ascending: false })
      .limit(5);

    // Get search keywords
    const { data: keywords } = await supabase
      .from('gmb_search_keywords')
      .select('*')
      .eq('user_id', user.id)
      .order('impressions_count', { ascending: false })
      .limit(10);

    // Get reviews for sentiment
    const { data: reviews } = await supabase
      .from('gmb_reviews')
      .select('rating, ai_sentiment')
      .eq('user_id', user.id);

    // Aggregate metrics by type
    const metricsByType: Record<string, number> = {};
    const metricsByDate: Record<string, { impressions: number; clicks: number; calls: number }> = {};

    if (metrics) {
      metrics.forEach((m: any) => {
        const metricType = m.metric_type || '';
        const value = Number(m.metric_value) || 0;
        const date = m.metric_date;

        // Aggregate by type
        metricsByType[metricType] = (metricsByType[metricType] || 0) + value;

        // Aggregate by date
        if (!metricsByDate[date]) {
          metricsByDate[date] = { impressions: 0, clicks: 0, calls: 0 };
        }

        // Map metric types to our categories
        if (metricType.includes('IMPRESSIONS')) {
          metricsByDate[date].impressions += value;
        } else if (metricType.includes('WEBSITE_CLICKS') || metricType.includes('CLICKS')) {
          metricsByDate[date].clicks += value;
        } else if (metricType.includes('CALL_CLICKS') || metricType.includes('CALLS')) {
          metricsByDate[date].calls += value;
        }
      });
    }

    // Calculate stats
    const totalImpressions = Object.values(metricsByType)
      .filter((_, i, arr) => Object.keys(metricsByType)[i]?.includes('IMPRESSIONS'))
      .reduce((sum, val) => sum + val, 0) || 
      Object.values(metricsByDate).reduce((sum, d) => sum + d.impressions, 0);

    const websiteClicks = Object.values(metricsByType)
      .filter((_, i, arr) => Object.keys(metricsByType)[i]?.includes('WEBSITE_CLICKS'))
      .reduce((sum, val) => sum + val, 0) || 0;

    const phoneCalls = Object.values(metricsByType)
      .filter((_, i, arr) => Object.keys(metricsByType)[i]?.includes('CALL'))
      .reduce((sum, val) => sum + val, 0) || 0;

    const directionRequests = Object.values(metricsByType)
      .filter((_, i, arr) => Object.keys(metricsByType)[i]?.includes('DIRECTION'))
      .reduce((sum, val) => sum + val, 0) || 0;

    // Calculate sentiment
    const sentiment = {
      positive: reviews?.filter((r: any) => (r.rating || 0) >= 4).length || 0,
      neutral: reviews?.filter((r: any) => (r.rating || 0) === 3).length || 0,
      negative: reviews?.filter((r: any) => (r.rating || 0) <= 2).length || 0
    };

    // Calculate impressions breakdown (estimate from metric types)
    const searchImpressions = Object.entries(metricsByType)
      .filter(([type]) => type.includes('SEARCH'))
      .reduce((sum, [, val]) => sum + val, 0);
    
    const mapsImpressions = Object.entries(metricsByType)
      .filter(([type]) => type.includes('MAPS'))
      .reduce((sum, [, val]) => sum + val, 0);

    const impressionsBreakdown = {
      search: searchImpressions || totalImpressions * 0.4,
      maps: mapsImpressions || totalImpressions * 0.35,
      discovery: totalImpressions * 0.15,
      direct: totalImpressions * 0.1
    };

    // Build performance trends
    const performanceTrends = Object.entries(metricsByDate)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, values]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        impressions: values.impressions,
        clicks: values.clicks,
        calls: values.calls
      }));

    // Build top keywords
    const topKeywords = (keywords || []).map((k: any) => ({
      keyword: k.search_keyword || '',
      searches: Number(k.impressions_count) || 0,
      trend: 0 // TODO: Replace with calculated trend data
    }));

    // Calculate average rating for insights
    const avgRating = reviews && reviews.length > 0
      ? reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviews.length
      : 0;

    // Generate AI insights
    const aiInsights = [
      {
        title: avgRating < 4 ? 'Rating Improvement Opportunity' : 'Excellent Rating Maintained',
        description: avgRating < 4
          ? `Your average rating of ${avgRating.toFixed(1)} stars needs improvement. Focus on addressing negative feedback.`
          : `Your average rating of ${avgRating.toFixed(1)} stars is excellent! Keep up the great service.`,
        priority: (avgRating < 4 ? 'high' : 'low') as 'high' | 'low',
        category: 'Optimization',
        progress: avgRating < 4 ? Math.round((avgRating / 5) * 100) : 100
      },
      {
        title: 'Recent Activity Analysis',
        description: `You've received ${reviews?.length || 0} reviews total. ${sentiment.positive > 0 ? `${sentiment.positive} are positive.` : 'Start collecting reviews to improve visibility.'}`,
        priority: (reviews && reviews.length > 0 ? 'medium' : 'high') as 'medium' | 'high',
        category: 'Engagement'
      },
      {
        title: 'Profile Completeness',
        description: 'Complete your business profile with photos, hours, and categories to increase visibility.',
        priority: 'medium' as const,
        category: 'Progress'
      },
      {
        title: totalImpressions > 0 ? 'Performance Tracking Active' : 'Start Tracking Performance',
        description: totalImpressions > 0
          ? `You're tracking ${totalImpressions.toLocaleString()} impressions. Monitor trends to optimize your presence.`
          : 'Enable performance tracking to see detailed analytics and insights.',
        priority: (totalImpressions > 0 ? 'low' : 'high') as 'low' | 'high',
        category: 'Performance'
      }
    ];

    window.dispatchEvent(new Event('dashboard:refresh'));
    console.log('[AnalyticsPage] Analytics data fetched, dashboard refresh triggered');

    return {
      stats: {
        totalImpressions,
        websiteClicks,
        phoneCalls,
        directionRequests,
        totalReviews: reviews?.length || 0
      },
      topLocations: (locations || []).map((l: any) => ({
        name: l.location_name,
        impressions: 0, // TODO: Replace with real impressions data
        rating: Number(l.rating) || 0
      })),
      impressionsBreakdown,
      performanceTrends: performanceTrends.length > 0 ? performanceTrends : Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          impressions: 0,
          clicks: 0,
          calls: 0
        };
      }),
      topKeywords,
      reviewSentiment: sentiment,
      aiInsights
    };
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return getDefaultAnalytics();
  }
}

// Main Component
export default async function AnalyticsPage() {
  const data = await getAnalyticsData();
  
  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              📊 Analytics Dashboard
            </h1>
            <p className="text-zinc-400">
              Track your Google Business performance
            </p>
          </div>
          
          <button className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg font-medium transition flex items-center gap-2">
            📥 Export Report
          </button>
        </div>
        
        {/* Filters */}
        <div className="flex gap-3">
          <select className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-orange-500 focus:outline-none">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
            <option>This Year</option>
          </select>
          
          <select className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-orange-500 focus:outline-none">
            <option>All Locations</option>
          </select>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatsCard
            title="Total Impressions"
            value={data.stats.totalImpressions.toLocaleString()}
            icon="📈"
            trend="+20.1%"
            color="blue"
          />
          <StatsCard
            title="Website Clicks"
            value={data.stats.websiteClicks.toLocaleString()}
            icon="👁️"
            trend="+15.3%"
            color="purple"
          />
          <StatsCard
            title="Phone Calls"
            value={data.stats.phoneCalls.toLocaleString()}
            icon="📞"
            trend="+0%"
            color="green"
          />
          <StatsCard
            title="Direction Requests"
            value={data.stats.directionRequests.toLocaleString()}
            icon="🗺️"
            trend="+8.2%"
            color="orange"
          />
          <StatsCard
            title="Total Reviews"
            value={data.stats.totalReviews.toLocaleString()}
            icon="⭐"
            trend="+12.5%"
            color="yellow"
          />
        </div>
        
        {/* Row 1: Top Locations + Impressions Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopLocationsCard locations={data.topLocations} />
          <ImpressionsBreakdownCard data={data.impressionsBreakdown} />
        </div>
        
        {/* Row 2: Performance Trends (Full Width) */}
        <PerformanceTrendsCard data={data.performanceTrends} />
        
        {/* Row 3: Keywords + Sentiment */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopKeywordsCard keywords={data.topKeywords} />
          <ReviewSentimentCard sentiment={data.reviewSentiment} />
        </div>
        
        {/* AI Insights */}
        <AIInsightsSection insights={data.aiInsights} />
        
      </div>
    </div>
  );
}
