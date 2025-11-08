'use client';

import { useState, useTransition } from 'react';
import { disconnectLocation } from './actions';
import { toast } from 'sonner';

export default function DisconnectButton({ accountId }: { accountId: string }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleDisconnect = () => {
    startTransition(async () => {
      try {
        await disconnectLocation(accountId);
        setStatus('success');
        toast.success('Account disconnected successfully!');
        window.dispatchEvent(new Event('dashboard:refresh'));
        console.log('[DisconnectButton] Account disconnected, dashboard refresh dispatched');
      } catch (error) {
        console.error('[DisconnectButton] Error during disconnect:', error);
        setStatus('error');
        toast.error('Failed to disconnect account. Please try again.');
      }
    });
  };

  return (
    <button
      onClick={handleDisconnect}
      disabled={isPending}
      className={`px-5 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
        isPending
          ? 'bg-zinc-700 cursor-wait text-zinc-300'
          : 'bg-red-600 hover:bg-red-700 text-white'
      }`}
    >
      {isPending ? (
        <>
          <span>⏳</span>
          <span>Disconnecting...</span>
        </>
      ) : status === 'success' ? (
        <>
          <span>✅</span>
          <span>Disconnected</span>
        </>
      ) : status === 'error' ? (
        <>
          <span>⚠️</span>
          <span>Error</span>
        </>
      ) : (
        <>
          <span>🔌</span>
          <span>Disconnect</span>
        </>
      )}
    </button>
  );
}
