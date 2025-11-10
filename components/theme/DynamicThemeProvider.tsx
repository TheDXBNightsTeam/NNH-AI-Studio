'use client';

import { useEffect } from 'react';
import { useBrandProfile } from '@/contexts/BrandProfileContext';

// Helper function to convert hex to RGB for better color manipulation
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function DynamicThemeProvider({ children }: { children: React.ReactNode }) {
  const { profile, refetchProfile } = useBrandProfile();

  useEffect(() => {
    // Listen for brand profile updates
    const handleBrandUpdate = () => {
      refetchProfile();
    };

    window.addEventListener('brand-profile-updated', handleBrandUpdate);
    return () => window.removeEventListener('brand-profile-updated', handleBrandUpdate);
  }, [refetchProfile]);

  useEffect(() => {
    // Apply CSS variables for dynamic theming
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      
      // Store brand colors for direct hex usage
      const primaryColor = profile?.primary_color || '#FFA500';
      const secondaryColor = profile?.secondary_color || '#1A1A1A';
      
      root.style.setProperty('--brand-primary', primaryColor);
      root.style.setProperty('--brand-secondary', secondaryColor);
      
      // Also update the primary colors used by Tailwind/components
      // This ensures buttons, links, and other primary-colored elements use brand colors
      const primaryRgb = hexToRgb(primaryColor);
      const secondaryRgb = hexToRgb(secondaryColor);
      
      if (primaryRgb) {
        // Set RGB values for compatibility with various color utilities
        root.style.setProperty('--brand-primary-rgb', `${primaryRgb.r} ${primaryRgb.g} ${primaryRgb.b}`);
      }
      
      if (secondaryRgb) {
        root.style.setProperty('--brand-secondary-rgb', `${secondaryRgb.r} ${secondaryRgb.g} ${secondaryRgb.b}`);
      }
    }
  }, [profile]);

  return <>{children}</>;
}
