'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';

export type DatePreset = '7d' | '30d' | '90d' | 'custom';

export interface DateRange {
  preset: DatePreset;
  start: Date | null;
  end: Date | null;
}

interface DateRangeControlsProps {
  value: DateRange;
  onChange: (next: DateRange) => void;
  onApply?: () => void;
}

export function DateRangeControls({ value, onChange, onApply }: DateRangeControlsProps) {
  const [customStart, setCustomStart] = useState<string>(value.start ? value.start.toISOString().slice(0,10) : '');
  const [customEnd, setCustomEnd] = useState<string>(value.end ? value.end.toISOString().slice(0,10) : '');

  const presets: { key: DatePreset; label: string }[] = useMemo(() => ([
    { key: '7d', label: 'Last 7 Days' },
    { key: '30d', label: 'Last 30 Days' },
    { key: '90d', label: 'Last 90 Days' },
    { key: 'custom', label: 'Custom' },
  ]), []);

  const applyPreset = (preset: DatePreset) => {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let start = new Date(end);
    if (preset === '7d') start.setDate(end.getDate() - 7);
    if (preset === '30d') start.setDate(end.getDate() - 30);
    if (preset === '90d') start.setDate(end.getDate() - 90);

    if (preset === 'custom') {
      onChange({ preset, start: value.start, end: value.end });
      return;
    }
    onChange({ preset, start, end });
    onApply?.();
  };

  const applyCustom = () => {
    if (!customStart || !customEnd) return;
    const start = new Date(customStart);
    const end = new Date(customEnd);
    onChange({ preset: 'custom', start, end });
    onApply?.();
  };

  const reset = () => {
    applyPreset('30d');
  };

  return (
    <Card className="p-4 border border-muted/50">
      <div className="flex flex-wrap items-center gap-2">
        {/* Presets */}
        <div className="flex items-center gap-2">
          {presets.map((p) => (
            <Button
              key={p.key}
              variant={value.preset === p.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => applyPreset(p.key)}
              className={cn(value.preset === p.key && 'bg-primary text-white')}
            >
              <CalendarIcon className="w-4 h-4 mr-1" />
              {p.label}
            </Button>
          ))}
        </div>

        {/* Custom range inputs */}
        {value.preset === 'custom' && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2 py-1 border rounded bg-background text-sm"
            />
            <span className="text-muted-foreground">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2 py-1 border rounded bg-background text-sm"
            />
            <Button size="sm" onClick={applyCustom}>Apply</Button>
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={reset}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>
      </div>
    </Card>
  );
}
