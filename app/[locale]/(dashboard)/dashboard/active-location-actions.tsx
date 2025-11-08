'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { syncLocation, disconnectLocation } from './actions';

export function ActiveLocationActions({ locationId }: { locationId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSync = async () => {
    setLoading(true);
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
      console.error('Sync failed:', error);
      toast.error('An unexpected error occurred while syncing');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      const result = await disconnectLocation(locationId);
      if (result.success) {
        toast.success(result.message || 'Location disconnected successfully');
        window.dispatchEvent(new Event('dashboard:refresh'));
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to disconnect location');
      }
    } catch (error) {
      console.error('Disconnect failed:', error);
      toast.error('An unexpected error occurred while disconnecting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
        onClick={handleSync}
        disabled={loading}
      >
        {loading ? 'Syncing...' : 'Sync Now'}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
        onClick={handleDisconnect}
        disabled={loading}
      >
        {loading ? 'Disconnecting...' : 'Disconnect'}
      </Button>
    </div>
  );
}
