'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { toast } from 'sonner';

const MAX_RETRIES = 3;

async function withRetry(fn: () => Promise<any>, actionName: string) {
  let lastError;
  const start = Date.now();
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const result = await fn();
      const duration = Date.now() - start;
      console.log(`[${actionName}] Completed in ${duration}ms after ${i + 1} attempt(s).`);
      return result;
    } catch (err) {
      lastError = err;
      console.warn(`[${actionName}] Attempt ${i + 1} failed:`, err);
      await new Promise(res => setTimeout(res, 500 * (i + 1))); // exponential backoff
    }
  }
  console.error(`[${actionName}] All attempts failed.`);
  throw lastError;
}

async function logAction(action: string, status: string, details?: any) {
  const supabase = createClient();
  try {
    await supabase.from('location_action_logs').insert({
      action,
      status,
      details: details ? JSON.stringify(details) : null,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[LocationLogs] Failed to record action log:', err);
  }
}

/**
 * Sync all locations from Google My Business
 */
export async function syncAllLocations() {
  const start = Date.now();
  try {
    const result = await withRetry(async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/locations/bulk-sync`, {
        method: 'POST',
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`Sync failed with status ${res.status}`);
      return await res.json();
    }, 'SyncAllLocations');

    const duration = Date.now() - start;
    revalidatePath('/dashboard/locations');
    toast.success(`✅ Synced successfully (${duration}ms)`);
    await logAction('syncAllLocations', 'success', result);
    return { success: true, data: result, durationMs: duration, timestamp: new Date().toISOString() };
  } catch (error) {
    toast.error('❌ Sync failed');
    await logAction('syncAllLocations', 'error', { error });
    return { success: false, error: String(error), timestamp: new Date().toISOString() };
  }
}

/**
 * Create a new location record
 */
export async function createLocation(payload: Record<string, any>) {
  const start = Date.now();
  try {
    const result = await withRetry(async () => {
      const res = await fetch(`/api/locations/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Create failed: ${res.statusText}`);
      return await res.json();
    }, 'CreateLocation');

    const duration = Date.now() - start;
    revalidatePath('/dashboard/locations');
    toast.success(`🟢 Location created (${duration}ms)`);
    await logAction('createLocation', 'success', result);
    return { success: true, data: result, durationMs: duration, timestamp: new Date().toISOString() };
  } catch (error) {
    toast.error('❌ Failed to create location');
    await logAction('createLocation', 'error', { error, payload });
    return { success: false, error: String(error), timestamp: new Date().toISOString() };
  }
}

/**
 * Update an existing location record
 */
export async function updateLocation(id: string, updates: Record<string, any>) {
  const start = Date.now();
  try {
    const result = await withRetry(async () => {
      const res = await fetch(`/api/locations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error(`Update failed: ${res.statusText}`);
      return await res.json();
    }, 'UpdateLocation');

    const duration = Date.now() - start;
    revalidatePath('/dashboard/locations');
    toast.success(`✏️ Location updated (${duration}ms)`);
    await logAction('updateLocation', 'success', result);
    return { success: true, data: result, durationMs: duration, timestamp: new Date().toISOString() };
  } catch (error) {
    toast.error('❌ Failed to update location');
    await logAction('updateLocation', 'error', { error, id, updates });
    return { success: false, error: String(error), timestamp: new Date().toISOString() };
  }
}

/**
 * Delete a specific location
 */
export async function deleteLocation(id: string) {
  const start = Date.now();
  try {
    const result = await withRetry(async () => {
      const res = await fetch(`/api/locations/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Delete failed: ${res.statusText}`);
      return await res.json();
    }, 'DeleteLocation');

    const duration = Date.now() - start;
    revalidatePath('/dashboard/locations');
    toast.success(`🗑️ Location deleted (${duration}ms)`);
    await logAction('deleteLocation', 'success', result);
    return { success: true, data: result, durationMs: duration, timestamp: new Date().toISOString() };
  } catch (error) {
    toast.error('❌ Failed to delete location');
    await logAction('deleteLocation', 'error', { error, id });
    return { success: false, error: String(error), timestamp: new Date().toISOString() };
  }
}

/**
 * Export all locations as CSV
 */
export async function exportLocations() {
  const start = Date.now();
  try {
    await withRetry(async () => {
      const res = await fetch(`/api/locations/export`, { method: 'GET' });
      if (!res.ok) throw new Error(`Export failed: ${res.statusText}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `locations-export-${new Date().toISOString().slice(0,10)}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    }, 'ExportLocations');

    const duration = Date.now() - start;
    toast.success(`📦 Export complete (${duration}ms)`);
    await logAction('exportLocations', 'success');
    return { success: true, durationMs: duration, timestamp: new Date().toISOString() };
  } catch (error) {
    toast.error('❌ Export failed');
    await logAction('exportLocations', 'error', { error });
    return { success: false, error: String(error), timestamp: new Date().toISOString() };
  }
}

/**
 * Get location statistics for dashboard analytics
 */
export async function getLocationStats() {
  const start = Date.now();
  try {
    const result = await withRetry(async () => {
      const res = await fetch(`/api/locations/stats`, { method: 'GET', cache: 'no-store' });
      if (!res.ok) throw new Error(`Stats failed: ${res.statusText}`);
      return await res.json();
    }, 'GetLocationStats');

    const duration = Date.now() - start;
    toast.success(`📊 Stats loaded (${duration}ms)`);
    await logAction('getLocationStats', 'success', result);
    return { success: true, data: result, durationMs: duration, timestamp: new Date().toISOString() };
  } catch (error) {
    toast.error('❌ Failed to load stats');
    await logAction('getLocationStats', 'error', { error });
    return { success: false, error: String(error), timestamp: new Date().toISOString() };
  }
}
