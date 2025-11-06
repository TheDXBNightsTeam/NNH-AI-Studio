"use client";

import React from 'react';
import { Star, MapPin, Heart, MessageSquare } from 'lucide-react';
import { FloatingCard } from './floating-card';

interface StatsOverviewCardProps {
  totalLocations: number;
  avgRating: number;
  totalReviews: number;
  healthScore: number;
}

/**
 * StatsOverviewCard Component
 * Displays 4 key metrics in a 2x2 grid
 */
export function StatsOverviewCard({
  totalLocations,
  avgRating,
  totalReviews,
  healthScore,
}: StatsOverviewCardProps) {
  const stats = [
    {
      label: 'Avg Rating',
      value: avgRating.toFixed(1),
      icon: Star,
      color: 'text-yellow-500',
    },
    {
      label: 'Total Locations',
      value: totalLocations.toString(),
      icon: MapPin,
      color: 'text-blue-500',
    },
    {
      label: 'Health Score',
      value: `${healthScore}%`,
      icon: Heart,
      color: healthScore >= 80 ? 'text-green-500' : healthScore >= 60 ? 'text-yellow-500' : 'text-red-500',
    },
    {
      label: 'Total Reviews',
      value: totalReviews.toString(),
      icon: MessageSquare,
      color: 'text-purple-500',
    },
  ];

  return (
    <FloatingCard position="top-left" delay={0.1} mobilePosition="top" className="w-full md:w-[400px]">
      <div className="grid grid-cols-2 gap-2 md:gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="
                bg-gradient-to-br from-white/5 to-white/[0.01]
                border border-white/6
                rounded-[14px]
                p-4
                transition-all duration-300
                hover:translate-y-[-3px]
                hover:border-white/12
                cursor-pointer
              "
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground font-medium">
                  {stat.label}
                </span>
              </div>
              <div
                className="
                  text-2xl md:text-[32px]
                  font-bold
                  leading-none
                  tracking-[-1px]
                  bg-gradient-to-br from-white via-white to-gray-400
                  bg-clip-text
                  text-transparent
                "
              >
                {stat.value}
              </div>
            </div>
          );
        })}
      </div>
    </FloatingCard>
  );
}

