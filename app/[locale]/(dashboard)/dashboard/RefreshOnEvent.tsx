'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function RefreshOnEvent({ eventName = 'dashboard:refresh' }: { eventName?: string }) {
  const router = useRouter();
  useEffect(() => {
    const handler = () => router.refresh();
    window.addEventListener(eventName, handler);
    return () => window.removeEventListener(eventName, handler);
  }, [eventName, router]);
  return null;
}


