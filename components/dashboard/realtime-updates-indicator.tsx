'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

interface SyncDetail {
  label: string;
  timestamp: string | null;
}

interface RealtimeUpdatesIndicatorProps {
  lastUpdated: Date | null;
  onRefresh: () => void;
  isRefreshing: boolean;
  autoRefreshInterval?: number; // minutes
  syncDetails?: SyncDetail[];
}

export function RealtimeUpdatesIndicator({
  lastUpdated,
  onRefresh,
  isRefreshing,
  autoRefreshInterval = 5,
  syncDetails = [],
}: RealtimeUpdatesIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState<string>('');
  const [nextRefresh, setNextRefresh] = useState<number>(autoRefreshInterval * 60);

  // Calculate elapsed time since last refresh
  useEffect(() => {
    const calculateTimeAgo = () => {
      if (!lastUpdated) {
        setTimeAgo('Never');
        return;
      }

      const now = new Date();
      const diff = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000); // seconds

      if (diff < 60) {
        setTimeAgo('Just now');
      } else if (diff < 3600) {
        const minutes = Math.floor(diff / 60);
        setTimeAgo(`${minutes} minute${minutes > 1 ? 's' : ''} ago`);
      } else if (diff < 86400) {
        const hours = Math.floor(diff / 3600);
        setTimeAgo(`${hours} hour${hours > 1 ? 's' : ''} ago`);
      } else {
        const days = Math.floor(diff / 86400);
        setTimeAgo(`${days} day${days > 1 ? 's' : ''} ago`);
      }
    };

    calculateTimeAgo();
    const interval = setInterval(calculateTimeAgo, 10000); // update every 10 seconds

    return () => clearInterval(interval);
  }, [lastUpdated]);

  // ✅ FIX: Stabilize onRefresh callback to prevent race conditions
  const onRefreshRef = useRef(onRefresh);
  
  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  // Auto-refresh countdown
  useEffect(() => {
    if (isRefreshing) {
      setNextRefresh(autoRefreshInterval * 60);
      return;
    }

    const timer = setInterval(() => {
      setNextRefresh(prev => {
        if (prev <= 1) {
          // ✅ Use ref to avoid stale closure issues
          onRefreshRef.current();
          return autoRefreshInterval * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRefreshing, autoRefreshInterval]); // ✅ Removed onRefresh from deps

  const formatNextRefresh = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes > 0) {
      return `${minutes}:${secs.toString().padStart(2, '0')} min`;
    }
    return `${secs}s`;
  };

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return 'Unknown';
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Card className="p-4 border border-muted bg-gradient-to-r from-background to-muted/20">
      <div className="flex items-center justify-between gap-4">
        {/* Last update information */}
        <div className="flex items-center gap-3 flex-1">
          <div className="relative">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <AnimatePresence>
              {!isRefreshing && lastUpdated && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 w-2 h-2 bg-success rounded-full"
                />
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                Last Updated:
              </span>
              <span className="text-sm text-muted-foreground font-mono">
                {timeAgo}
              </span>
            </div>
            
            {!isRefreshing && (
              <div className="flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3 h-3 text-success" />
                <span className="text-xs text-muted-foreground">
                  {`Next refresh in ${formatNextRefresh(nextRefresh)}`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Refresh button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className={cn(
            "gap-2 transition-all",
            isRefreshing && "bg-primary/10 border-primary/30"
          )}
        >
          <RefreshCw 
            className={cn(
              "w-4 h-4",
              isRefreshing && "animate-spin text-primary"
            )} 
          />
          <span className="hidden sm:inline">
            {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
          </span>
        </Button>
      </div>

      {/* Auto-refresh progress bar */}
      <motion.div 
        className="mt-3 h-1 bg-muted rounded-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-primary/50 to-primary"
          animate={{
            width: isRefreshing 
              ? '100%' 
              : `${((autoRefreshInterval * 60 - nextRefresh) / (autoRefreshInterval * 60)) * 100}%`
          }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
      </motion.div>

      {syncDetails.length > 0 && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {syncDetails.map((detail) => (
            <div key={detail.label} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{detail.label}</span>
              <span className="font-mono">{formatTimestamp(detail.timestamp)}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
