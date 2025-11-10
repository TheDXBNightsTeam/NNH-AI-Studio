import { format, subDays } from 'date-fns';

export interface DateRange {
  preset?: '7d' | '30d' | '90d' | 'custom';
  start: Date | null;
  end: Date | null;
}

/**
 * Generate a human-readable comparison period label based on the date range
 * @param dateRange - The current date range selection
 * @returns A string describing the comparison period
 */
export function getComparisonPeriodLabel(dateRange: DateRange): string {
  const { preset, start, end } = dateRange;

  if (preset && preset !== 'custom') {
    const days = parseInt(preset.replace('d', ''));
    return `vs previous ${days} days`;
  }

  if (start && end) {
    const diffInDays = Math.floor(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Calculate the previous period dates
    const prevStart = subDays(start, diffInDays + 1);
    const prevEnd = subDays(start, 1);
    
    return `vs ${format(prevStart, 'MMM d')} - ${format(prevEnd, 'MMM d')}`;
  }

  return 'vs last period';
}

/**
 * Get detailed comparison period information for tooltips
 * @param dateRange - The current date range selection
 * @returns An object with current and previous period details
 */
export function getDetailedComparisonPeriod(dateRange: DateRange): {
  current: string;
  previous: string;
} {
  const { preset, start, end } = dateRange;

  if (preset && preset !== 'custom') {
    const days = parseInt(preset.replace('d', ''));
    const currentEnd = new Date();
    const currentStart = subDays(currentEnd, days);
    const prevEnd = subDays(currentStart, 1);
    const prevStart = subDays(prevEnd, days);

    return {
      current: `${format(currentStart, 'MMM d, yyyy')} - ${format(currentEnd, 'MMM d, yyyy')}`,
      previous: `${format(prevStart, 'MMM d, yyyy')} - ${format(prevEnd, 'MMM d, yyyy')}`,
    };
  }

  if (start && end) {
    const diffInDays = Math.floor(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const prevStart = subDays(start, diffInDays + 1);
    const prevEnd = subDays(start, 1);
    
    return {
      current: `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`,
      previous: `${format(prevStart, 'MMM d, yyyy')} - ${format(prevEnd, 'MMM d, yyyy')}`,
    };
  }

  return {
    current: 'Current period',
    previous: 'Previous period',
  };
}
