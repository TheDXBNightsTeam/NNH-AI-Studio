'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

interface RealtimeUpdatesIndicatorProps {
  lastUpdated: Date | null;
  onRefresh: () => void;
  isRefreshing: boolean;
  autoRefreshInterval?: number; // بالدقائق
  locale?: string;
}

export function RealtimeUpdatesIndicator({
  lastUpdated,
  onRefresh,
  isRefreshing,
  autoRefreshInterval = 5,
  locale = 'en'
}: RealtimeUpdatesIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState<string>('');
  const [nextRefresh, setNextRefresh] = useState<number>(autoRefreshInterval * 60);
  const isArabic = locale === 'ar';

  // حساب الوقت منذ آخر تحديث
  useEffect(() => {
    const calculateTimeAgo = () => {
      if (!lastUpdated) {
        setTimeAgo(isArabic ? 'غير متاح' : 'Never');
        return;
      }

      const now = new Date();
      const diff = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000); // بالثواني

      if (diff < 60) {
        setTimeAgo(isArabic ? 'الآن' : 'Just now');
      } else if (diff < 3600) {
        const minutes = Math.floor(diff / 60);
        setTimeAgo(isArabic 
          ? `منذ ${minutes} ${minutes === 1 ? 'دقيقة' : 'دقائق'}`
          : `${minutes} minute${minutes > 1 ? 's' : ''} ago`
        );
      } else if (diff < 86400) {
        const hours = Math.floor(diff / 3600);
        setTimeAgo(isArabic
          ? `منذ ${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`
          : `${hours} hour${hours > 1 ? 's' : ''} ago`
        );
      } else {
        const days = Math.floor(diff / 86400);
        setTimeAgo(isArabic
          ? `منذ ${days} ${days === 1 ? 'يوم' : 'أيام'}`
          : `${days} day${days > 1 ? 's' : ''} ago`
        );
      }
    };

    calculateTimeAgo();
    const interval = setInterval(calculateTimeAgo, 10000); // تحديث كل 10 ثواني

    return () => clearInterval(interval);
  }, [lastUpdated, isArabic]);

  // ✅ FIX: Stabilize onRefresh callback to prevent race conditions
  const onRefreshRef = useRef(onRefresh);
  
  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  // العداد التنازلي للتحديث التلقائي
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
      return isArabic 
        ? `${minutes}:${secs.toString().padStart(2, '0')} دقيقة`
        : `${minutes}:${secs.toString().padStart(2, '0')} min`;
    }
    return isArabic ? `${secs} ثانية` : `${secs}s`;
  };

  return (
    <Card className="p-4 border border-muted bg-gradient-to-r from-background to-muted/20">
      <div className="flex items-center justify-between gap-4">
        {/* معلومات آخر تحديث */}
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
                {isArabic ? 'آخر تحديث:' : 'Last Updated:'}
              </span>
              <span className="text-sm text-muted-foreground font-mono">
                {timeAgo}
              </span>
            </div>
            
            {!isRefreshing && (
              <div className="flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3 h-3 text-success" />
                <span className="text-xs text-muted-foreground">
                  {isArabic 
                    ? `التحديث التالي في ${formatNextRefresh(nextRefresh)}`
                    : `Next refresh in ${formatNextRefresh(nextRefresh)}`
                  }
                </span>
              </div>
            )}
          </div>
        </div>

        {/* زر التحديث */}
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
            {isRefreshing 
              ? (isArabic ? 'جاري التحديث...' : 'Refreshing...')
              : (isArabic ? 'تحديث الآن' : 'Refresh Now')
            }
          </span>
        </Button>
      </div>

      {/* شريط التقدم للتحديث التلقائي */}
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
    </Card>
  );
}
