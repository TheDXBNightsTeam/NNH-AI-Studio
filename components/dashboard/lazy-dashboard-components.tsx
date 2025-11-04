'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// Lazy loading components with proper loading fallbacks
export const LazyStatsCards = dynamic(
  () => import('./stats-cards').then(mod => ({ default: mod.StatsCards })),
  {
    loading: () => (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[120px] mb-2" />
              <Skeleton className="h-3 w-[80px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    ),
    ssr: false,
  }
);

export const LazyPerformanceChart = dynamic(
  () => import('./performance-comparison-chart').then(mod => ({ default: mod.PerformanceComparisonChart })),
  {
    loading: () => (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    ),
    ssr: false,
  }
);

export const LazyLocationHighlights = dynamic(
  () => import('./location-highlights-carousel').then(mod => ({ default: mod.LocationHighlightsCarousel })),
  {
    loading: () => (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[150px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-3 w-[100px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    ),
    ssr: false,
  }
);

export const LazyAIInsights = dynamic(
  () => import('./ai-insights-card').then(mod => ({ default: mod.AIInsightsCard })),
  {
    loading: () => (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[120px]" />
          <Skeleton className="h-4 w-[200px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-[80px]" />
              <Skeleton className="h-8 w-[80px]" />
            </div>
          </div>
        </CardContent>
      </Card>
    ),
    ssr: false,
  }
);

export const LazyGamificationWidget = dynamic(
  () => import('./gamification-widget').then(mod => ({ default: mod.GamificationWidget })),
  {
    loading: () => (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[140px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-[60%]" />
          </div>
        </CardContent>
      </Card>
    ),
    ssr: false,
  }
);