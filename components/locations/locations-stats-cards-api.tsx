"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Star, Eye, TrendingUp, Loader2 } from 'lucide-react';
import { formatLargeNumber } from '@/components/locations/location-types';

interface StatsData {
  totalLocations: number;
  avgRating: number;
  totalReviews: number;
  avgHealthScore: number;
}

interface LocationsStatsCardsAPIProps {
  refreshKey?: number;
}

export function LocationsStatsCardsAPI({ refreshKey }: LocationsStatsCardsAPIProps = {}) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const response = await fetch('/api/locations/stats');
        
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        
        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load stats');
        // Set default values on error
        setStats({
          totalLocations: 0,
          avgRating: 0,
          totalReviews: 0,
          avgHealthScore: 0,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [refreshKey]);

  const statsConfig = [
    {
      label: 'Total Locations',
      value: stats?.totalLocations ?? 0,
      icon: MapPin,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Average Rating',
      value: stats?.avgRating ? stats.avgRating.toFixed(1) : '0.0',
      icon: Star,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      label: 'Total Reviews',
      value: formatLargeNumber(stats?.totalReviews ?? 0),
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Avg Health Score',
      value: `${Math.round(stats?.avgHealthScore ?? 0)}%`,
      icon: Eye,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-4" />
              <div className="h-8 bg-muted rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsConfig.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

