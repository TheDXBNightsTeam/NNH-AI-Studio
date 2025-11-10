'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings, TrendingUp, MapPin, CheckSquare, AlertTriangle, Trophy, Sparkles } from 'lucide-react';
import {
  type DashboardWidgetPreferences,
  getDashboardPreferences,
  saveDashboardPreferences,
} from '@/lib/dashboard-preferences';
import { toast } from 'sonner';

interface DashboardCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (preferences: DashboardWidgetPreferences) => void;
}

const widgetConfigs = [
  {
    key: 'showPerformanceComparison' as keyof DashboardWidgetPreferences,
    label: 'Performance Comparison',
    description: 'View performance metrics vs previous period',
    icon: TrendingUp,
  },
  {
    key: 'showLocationHighlights' as keyof DashboardWidgetPreferences,
    label: 'Location Highlights',
    description: 'See top performing and attention-needed locations',
    icon: MapPin,
  },
  {
    key: 'showWeeklyTasks' as keyof DashboardWidgetPreferences,
    label: 'Weekly Tasks',
    description: 'Track your weekly action items',
    icon: CheckSquare,
  },
  {
    key: 'showBottlenecks' as keyof DashboardWidgetPreferences,
    label: 'Bottlenecks',
    description: 'Identify issues requiring attention',
    icon: AlertTriangle,
  },
  {
    key: 'showAchievements' as keyof DashboardWidgetPreferences,
    label: 'Achievements & Progress',
    description: 'View your goals and achievements',
    icon: Trophy,
  },
  {
    key: 'showAIInsights' as keyof DashboardWidgetPreferences,
    label: 'AI Insights',
    description: 'Get AI-powered recommendations',
    icon: Sparkles,
  },
];

export function DashboardCustomizationModal({
  isOpen,
  onClose,
  onSave,
}: DashboardCustomizationModalProps) {
  const [preferences, setPreferences] = useState<DashboardWidgetPreferences>(
    getDashboardPreferences()
  );

  const handleToggle = (key: keyof DashboardWidgetPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    saveDashboardPreferences(preferences);
    onSave(preferences);
    toast.success('Dashboard customization saved!');
    onClose();
  };

  const handleShowAll = () => {
    const allEnabled: DashboardWidgetPreferences = {
      showPerformanceComparison: true,
      showLocationHighlights: true,
      showWeeklyTasks: true,
      showBottlenecks: true,
      showAchievements: true,
      showAIInsights: true,
    };
    setPreferences(allEnabled);
  };

  const handleHideAll = () => {
    const allDisabled: DashboardWidgetPreferences = {
      showPerformanceComparison: false,
      showLocationHighlights: false,
      showWeeklyTasks: false,
      showBottlenecks: false,
      showAchievements: false,
      showAIInsights: false,
    };
    setPreferences(allDisabled);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Customize Dashboard
          </DialogTitle>
          <DialogDescription>
            Choose which widgets to display on your dashboard. You can change this anytime.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShowAll}
              className="flex-1"
            >
              Show All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleHideAll}
              className="flex-1"
            >
              Hide All
            </Button>
          </div>

          <div className="space-y-3">
            {widgetConfigs.map((widget) => {
              const Icon = widget.icon;
              return (
                <div
                  key={widget.key}
                  className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  <Icon className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 space-y-1">
                    <Label
                      htmlFor={widget.key}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {widget.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {widget.description}
                    </p>
                  </div>
                  <Switch
                    id={widget.key}
                    checked={preferences[widget.key]}
                    onCheckedChange={() => handleToggle(widget.key)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
