'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { syncLocation, disconnectLocation } from './actions';

export function ActiveLocationActions() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSync = async () => {
    setLoading(true);
    try {
      const result = await syncLocation();
      if (result.success) {
        toast.success({ description: result.message || 'Location synced successfully!' });
        window.dispatchEvent(new Event('dashboard:refresh'));
        router.refresh();
      } else {
        toast.error({ description: result.error || 'Failed to sync location' });
      }
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error({ description: 'An unexpected error occurred while syncing' });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      const result = await disconnectLocation();
      if (result.success) {
        toast.success({ description: result.message || 'Location disconnected successfully' });
        window.dispatchEvent(new Event('dashboard:refresh'));
        router.refresh();
      } else {
        toast.error({ description: result.error || 'Failed to disconnect location' });
      }
    } catch (error) {
      console.error('Disconnect failed:', error);
      toast.error({ description: 'An unexpected error occurred while disconnecting' });
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
