'use client';

import { useState, useEffect } from 'react';

export function useResponsiveLayout() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsDesktop(width >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return { isMobile, isTablet, isDesktop };
}

// Mobile-first dashboard layout configurations
export const DASHBOARD_LAYOUTS = {
  mobile: {
    statsCards: 'grid-cols-1 gap-3',
    mainGrid: 'grid-cols-1 gap-4',
    chartGrid: 'grid-cols-1 gap-4',
    cardPadding: 'p-4',
    fontSize: {
      title: 'text-2xl',
      cardTitle: 'text-sm',
      statValue: 'text-xl',
    }
  },
  tablet: {
    statsCards: 'grid-cols-2 gap-4',
    mainGrid: 'grid-cols-1 lg:grid-cols-2 gap-4',
    chartGrid: 'grid-cols-1 gap-4',
    cardPadding: 'p-4',
    fontSize: {
      title: 'text-3xl',
      cardTitle: 'text-sm',
      statValue: 'text-2xl',
    }
  },
  desktop: {
    statsCards: 'grid-cols-2 lg:grid-cols-4 gap-4',
    mainGrid: 'grid-cols-1 lg:grid-cols-2 gap-4',
    chartGrid: 'grid-cols-1 lg:grid-cols-2 gap-4',
    cardPadding: 'p-6',
    fontSize: {
      title: 'text-3xl',
      cardTitle: 'text-sm',
      statValue: 'text-2xl',
    }
  }
};

// Mobile optimized component wrapper
export function ResponsiveDashboardLayout({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  const { isMobile, isTablet } = useResponsiveLayout();
  
  const layout = isMobile 
    ? DASHBOARD_LAYOUTS.mobile
    : isTablet 
    ? DASHBOARD_LAYOUTS.tablet 
    : DASHBOARD_LAYOUTS.desktop;

  return (
    <div className={`${className} ${layout.cardPadding}`}>
      {children}
    </div>
  );
}

// Responsive grid helper
export function ResponsiveGrid({ 
  children, 
  type = 'main',
  className = '' 
}: {
  children: React.ReactNode;
  type?: 'stats' | 'main' | 'chart';
  className?: string;
}) {
  const { isMobile, isTablet } = useResponsiveLayout();
  
  const layout = isMobile 
    ? DASHBOARD_LAYOUTS.mobile
    : isTablet 
    ? DASHBOARD_LAYOUTS.tablet 
    : DASHBOARD_LAYOUTS.desktop;

  const gridClass = type === 'stats' 
    ? layout.statsCards
    : type === 'chart'
    ? layout.chartGrid
    : layout.mainGrid;

  return (
    <div className={`grid ${gridClass} ${className}`}>
      {children}
    </div>
  );
}