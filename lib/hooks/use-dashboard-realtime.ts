'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { toast } from 'sonner';

export function useDashboardRealtime(
  userId: string | null,
  onUpdate: () => void
) {
  const router = useRouter();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const onUpdateRef = useRef(onUpdate);

  // Keep callback ref updated without triggering re-subscription
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    // Cleanup previous subscription
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const setupRealtime = async () => {
      // Subscribe to reviews changes
      const channel = supabase
        .channel(`dashboard:${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*', // INSERT, UPDATE, DELETE
            schema: 'public',
            table: 'gmb_reviews',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            console.log('📡 Review changed:', payload);
            onUpdateRef.current(); // Use ref to get latest callback
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'gmb_questions',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            console.log('📡 Question changed:', payload);
            onUpdateRef.current(); // Use ref to get latest callback
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'gmb_locations',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            console.log('📡 Location updated:', payload);
            onUpdateRef.current(); // Use ref to get latest callback
          }
        )
        .on('system', { event: 'error' }, (error) => {
          console.error('Realtime subscription error:', error);
          
          // Check if it's an auth error
          const errorMessage = error?.message || '';
          if (errorMessage.includes('JWT') || 
              errorMessage.includes('session') ||
              errorMessage.includes('expired') ||
              errorMessage.includes('Invalid Refresh Token')) {
            toast.error('Session expired. Redirecting to login...');
            
            // Sign out and redirect
            supabase.auth.signOut().finally(() => {
              router.push('/auth/login');
            });
          }
        })
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Real-time subscriptions active');
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ Channel error:', err);
            toast.error('Real-time updates disconnected');
          } else if (status === 'TIMED_OUT') {
            console.warn('⏱️ Channel subscription timed out, retrying...');
          }
        });
      
      channelRef.current = channel;
    };

    setupRealtime();

    // Cleanup on unmount or userId change
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        console.log('🔌 Real-time subscriptions disconnected');
      }
    };
  }, [userId, router]); // Only re-subscribe when userId changes
}

