'use client';

import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive insights and performance metrics
        </p>
      </div>

      <AnalyticsDashboard />
    </div>
  );
}

