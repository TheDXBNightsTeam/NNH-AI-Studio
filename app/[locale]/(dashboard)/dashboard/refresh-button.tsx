'use client';

import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState } from 'react';

export function RefreshButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      window.dispatchEvent(new Event('dashboard:refresh'));
      router.refresh();
      toast.success('Dashboard refreshed successfully!');
      console.log('[RefreshButton] Dashboard refresh triggered');
    } catch (error) {
      console.error('[RefreshButton] Error while refreshing dashboard:', error);
      toast.error('Failed to refresh dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      className={`text-white transition-all duration-300 flex items-center gap-2 ${
        loading 
          ? 'bg-zinc-700 cursor-wait' 
          : 'bg-orange-600 hover:bg-orange-700 hover:scale-[1.02]'
      }`}
      onClick={handleRefresh}
      disabled={loading}
    >
      {loading ? (
        <>
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          Refreshing...
        </>
      ) : (
        <>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Now
        </>
      )}
    </Button>
  );
}
