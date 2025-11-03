'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigationShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { LastSyncInfo } from '@/components/dashboard/last-sync-info';
import { WeeklyTasksWidget } from '@/components/dashboard/weekly-tasks-widget';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DashboardStats {
  totalLocations: number;
  locationsTrend: number;
  // الآن يمثل متوسط التقييم لآخر 30 يومًا (بدلاً من متوسط التقييم التراكمي)
  averageRating: number;
  // حقل جديد: متوسط التقييم التراكمي (لجميع الأوقات)
  allTimeAverageRating: number;
  ratingTrend: number;
  totalReviews: number;
  reviewsTrend: number;
  responseRate: number;
  responseTarget: number;
}

export default function DashboardPage() {
  useNavigationShortcuts();
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalLocations: 0,
    locationsTrend: 0,
    averageRating: 0,
    allTimeAverageRating: 0, // تهيئة الحقل الجديد
    ratingTrend: 0,
    totalReviews: 0,
    reviewsTrend: 0,
    responseRate: 0,
    responseTarget: 100,
  });

  const [gmbConnected, setGmbConnected] = useState(false);
  const [gmbAccountId, setGmbAccountId] = useState<string | null>(null);
  const [syncSchedule, setSyncSchedule] = useState<string>('manual');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Check authentication
      const {
        data: { user: authUser },
        error: authError
      } = await supabase.auth.getUser();

      if (authError || !authUser) {
        console.error("Authentication error:", authError);
        router.push("/auth/login");
        return;
      }

      // Check GMB connection status
      const { data: gmbAccounts } = await supabase
        .from("gmb_accounts")
        .select("id, is_active, settings, last_sync")
        .eq("user_id", authUser.id);

      const activeAccount = gmbAccounts?.find(acc => acc.is_active);
      const hasActiveAccount = !!activeAccount;
      setGmbConnected(hasActiveAccount);

      if (activeAccount) {
        setGmbAccountId(activeAccount.id);

        // Load sync settings
        if (activeAccount.settings) {
          const schedule = activeAccount.settings.syncSchedule || 'manual';
          setSyncSchedule(schedule);
        }

        // Load last sync time
        if (activeAccount.last_sync) {
          setLastSyncTime(new Date(activeAccount.last_sync));
        }
      }

      // ⭐️ START: جلب الإحصائيات المُعالجة من الباك إند
      if (hasActiveAccount) {
        // افتراض وجود نقطة نهاية جديدة تقوم بحساب الإحصائيات والاتجاهات في الباك إند
        const statsRes = await fetch('/api/dashboard/stats');
        const newStats = await statsRes.json();

        if (statsRes.ok && newStats) {
          // استخدام recentAverageRating من الباك إند كمتوسط رئيسي للكارد
          setStats({
            totalLocations: newStats.totalLocations || 0,
            locationsTrend: newStats.locationsTrend || 0,
            averageRating: newStats.recentAverageRating || 0, 
            allTimeAverageRating: newStats.allTimeAverageRating || 0,
            ratingTrend: newStats.ratingTrend || 0,
            totalReviews: newStats.totalReviews || 0,
            reviewsTrend: newStats.reviewsTrend || 0,
            responseRate: newStats.responseRate || 0,
            responseTarget: 100,
          });
        } else {
            console.error('Failed to fetch processed stats:', newStats);
            setStats(prev => ({ ...prev, totalReviews: 0, averageRating: 0, allTimeAverageRating: 0 }));
        }

      } else {
        // إذا لم يكن هناك حساب نشط، عرض إحصائيات صفرية
        setStats({
          totalLocations: 0,
          locationsTrend: 0,
          averageRating: 0,
          allTimeAverageRating: 0,
          ratingTrend: 0,
          totalReviews: 0,
          reviewsTrend: 0,
          responseRate: 0,
          responseTarget: 100,
        });
      }
      // ⭐️ END: جلب الإحصائيات المُعالجة

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Listen for sync complete events
    const handleSyncComplete = () => {
      fetchDashboardData();
    };

    window.addEventListener('gmb-sync-complete', handleSyncComplete);
    return () => {
      window.removeEventListener('gmb-sync-complete', handleSyncComplete);
    };
  }, []);

  const handleSync = async () => {
    if (!gmbAccountId) {
      toast.error('No GMB account connected');
      return;
    }

    try {
      setSyncing(true);
      const response = await fetch('/api/gmb/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_id: gmbAccountId, sync_type: 'full' }),
      });

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = 'Sync failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || `Sync failed: ${response.status}`;
        } catch {
          errorMessage = `Sync failed: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Update last sync time
      // API returns { ok: true, ... } or { success: true, ... }
      if (data.ok || data.success) {
        setLastSyncTime(new Date());
        toast.success('Sync completed successfully!');

        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('gmb-sync-complete', { detail: data }));

        // Refresh dashboard data
        await fetchDashboardData();
      } else {
        throw new Error(data.error || 'Sync failed');
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Failed to sync data');
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!gmbAccountId) {
      toast.error('No GMB account connected');
      return;
    }

    if (!confirm('Are you sure you want to disconnect Google My Business? Sync will stop but your data will be preserved.')) {
      return;
    }

    try {
      setDisconnecting(true);
      const response = await fetch('/api/gmb/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: gmbAccountId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Failed to disconnect');
      }

      toast.success('Google My Business disconnected successfully');
      setGmbConnected(false);
      setGmbAccountId(null);

      // Refresh dashboard data
      await fetchDashboardData();
    } catch (error: any) {
      console.error('Disconnect error:', error);
      toast.error(error.message || 'Failed to disconnect');
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome to your GMB Dashboard
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchDashboardData}
          disabled={loading}
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {gmbConnected && (
        <LastSyncInfo
          lastSyncTime={lastSyncTime}
          isSyncing={syncing}
          onSync={handleSync}
          syncSchedule={syncSchedule}
          onDisconnect={handleDisconnect}
          isDisconnecting={disconnecting}
        />
      )}

      <StatsCards loading={loading} data={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <WeeklyTasksWidget />

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest GMB updates</CardDescription>
          </CardHeader>
          <CardContent>
            {/* المحتوى المؤقت المحسّن للنشاط الحديث (Activity) */}
            <div className="text-sm text-muted-foreground">
                {gmbConnected ? (
                    <>
                        <p className="mb-2 font-semibold text-foreground">Pending Action Required:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li className="text-yellow-600">Review 3 new reviews awaiting response.</li>
                            <li className="text-yellow-600">2 customer questions need answers.</li>
                        </ul>
                        <p className="mt-4 font-semibold text-foreground">Latest Updates:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>New 5-star review received for "Downtown Branch".</li>
                            <li>GMB Post "New Winter Offer" published 4 hours ago.</li>
                            <li>Data sync completed successfully at {lastSyncTime?.toLocaleTimeString() || 'N/A'}.</li>
                        </ul>
                    </>
                ) : (
                    <p>Connect your Google My Business account to see real-time activity and required actions.</p>
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}