"use client";

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function LocationCardSkeleton() {
  return (
    <Card className="animate-pulse border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
          <div className="h-6 w-16 bg-muted rounded" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-2/3" />
        </div>
        <div className="flex items-center gap-4">
          <div className="h-4 bg-muted rounded w-20" />
          <div className="h-4 bg-muted rounded w-24" />
        </div>
        <div className="h-2 bg-muted rounded w-full" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-8 bg-muted rounded w-24" />
          <div className="h-8 bg-muted rounded w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

