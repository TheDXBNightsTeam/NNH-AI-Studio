'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { syncLocation, disconnectLocation } from './actions';

export function ActiveLocationActions({ locationId }: { locationId: string }) {
  const [loading, setLoading] = useState<'sync' | 'disconnect' | null>(null);
  const router = useRouter();

  const handleSync = async () => {
    setLoading('sync');
    try {
      const result = await syncLocation(locationId);
      if (result.success) {
        toast.success(result.message || 'Location synced successfully!');
        window.dispatchEvent(new Event('dashboard:refresh'));
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to sync location');
      }
    } catch (error) {
      console.error('[ActiveLocationActions] Sync failed:', error);
      toast.error('An unexpected error occurred while syncing');
    } finally {
      setLoading(null);
    }
  };

  const handleDisconnect = async () => {
    setLoading('disconnect');
    try {
      const result = await disconnectLocation(locationId);
      if (result.success) {
        toast.success(result.message || 'Location disconnected successfully!');
        window.dispatchEvent(new Event('dashboard:refresh'));
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to disconnect location');
      }
    } catch (error) {
      console.error('[ActiveLocationActions] Disconnect failed:', error);
      toast.error('An unexpected error occurred while disconnecting');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex gap-2 w-full">
      <Button
        size="sm"
        className={`flex-1 text-white transition-all duration-300 ${
          loading === 'sync'
            ? 'bg-zinc-700 cursor-wait'
            : 'bg-orange-600 hover:bg-orange-700 hover:scale-[1.02]'
        }`}
        onClick={handleSync}
        disabled={!!loading}
      >
        {loading === 'sync' ? 'Syncing...' : '🔄 Sync Now'}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className={`flex-1 transition-all duration-300 ${
          loading === 'disconnect'
            ? 'border-zinc-700 text-zinc-400 cursor-wait'
            : 'border-red-500/30 text-red-400 hover:border-red-500/60 hover:bg-red-500/10 hover:scale-[1.02]'
        }`}
        onClick={handleDisconnect}
        disabled={!!loading}
      >
        {loading === 'disconnect' ? 'Disconnecting...' : '🛑 Disconnect'}
      </Button>
    </div>
  );
}
