'use client';
import { cn } from '@/lib/utils';
import { useResponsiveLayout } from '@/components/dashboard/responsive-layout';

export function DashboardHeader() {
  const { isMobile } = useResponsiveLayout();
  return (
    <div className="flex flex-col gap-2 md:gap-0 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className={cn("font-bold tracking-tight", isMobile ? "text-2xl" : "text-3xl")}>
          AI Command Center
        </h1>
        <p className="text-muted-foreground text-sm md:text-base mt-1 md:mt-2">
          Proactive risk and growth orchestration dashboard
        </p>
      </div>
    </div>
  );
}
