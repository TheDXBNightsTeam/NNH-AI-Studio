'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useResponsiveLayout } from '@/components/dashboard/responsive-layout';

interface HealthScoreCardProps {
  loading: boolean;
  healthScore: number;
}

export function HealthScoreCard({ loading, healthScore }: HealthScoreCardProps) {
  const { isMobile } = useResponsiveLayout();
  
  return (
    <Card className={cn("border-l-4", 
      healthScore > 80 ? 'border-green-500' : 
      healthScore > 60 ? 'border-yellow-500' : 'border-red-500'
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={cn("font-medium", isMobile ? "text-xs" : "text-sm")}>
          GMB Health Score
        </CardTitle>
        <ShieldCheck className={cn("text-primary", isMobile ? "w-3 h-3" : "w-4 h-4")} />
      </CardHeader>
      <CardContent>
        <div className={cn("font-bold", isMobile ? "text-2xl" : "text-4xl")}>
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            `${healthScore}%`
          )}
        </div>
        <p className={cn("text-muted-foreground mt-1", isMobile ? "text-xs" : "text-xs")}>
          Score based on Quality, Visibility, and Compliance.
        </p>
      </CardContent>
    </Card>
  );
}
