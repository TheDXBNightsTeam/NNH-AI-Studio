"use client";

import React from 'react';
import { MessageSquare, FileText, BarChart3 } from 'lucide-react';
import { FloatingCard } from './floating-card';
import { Button } from '@/components/ui/button';
import { useRouter } from '@/lib/navigation';

interface QuickActionsCardProps {
  locationId: string | undefined;
}

/**
 * QuickActionsCard Component
 * Provides quick access to common actions
 */
export function QuickActionsCard({ locationId }: QuickActionsCardProps) {
  const router = useRouter();

  if (!locationId) {
    return null;
  }

  const actions = [
    {
      label: 'Reply to Reviews',
      icon: MessageSquare,
      onClick: () => router.push(`/locations/${locationId}?tab=reviews`),
    },
    {
      label: 'Create Post',
      icon: FileText,
      onClick: () => router.push(`/locations/${locationId}?tab=posts`),
    },
    {
      label: 'View Analytics',
      icon: BarChart3,
      onClick: () => router.push(`/locations/${locationId}?tab=analytics`),
    },
  ];

  return (
    <FloatingCard position="bottom-right" delay={0.4} mobilePosition="bottom" className="w-full md:w-[200px]">
      <div className="space-y-2">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button
              key={index}
              variant="outline"
              className="
                w-full
                h-[52px]
                justify-start
                bg-white/5
                border-white/10
                hover:bg-gradient-to-r
                hover:from-primary
                hover:to-accent
                hover:border-transparent
                hover:text-white
                hover:translate-x-[-5px]
                hover:scale-[1.02]
                transition-all duration-300
                shadow-none
                hover:shadow-[0_8px_25px_rgba(255,107,53,0.3)]
              "
              onClick={action.onClick}
            >
              <Icon className="w-4 h-4 mr-3" />
              <span className="text-sm font-medium">{action.label}</span>
            </Button>
          );
        })}
      </div>
    </FloatingCard>
  );
}

