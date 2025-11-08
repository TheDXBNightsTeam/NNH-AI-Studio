import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ApiError, errorResponse } from '@/utils/api-error';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse(new ApiError('Unauthorized', 401));
    }

    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('accountId');
    if (!accountId) {
      return errorResponse(new ApiError('accountId query param required', 400));
    }

    const { data, error } = await supabase
      .from('gmb_metrics')
      .select('phase, runs_count, total_duration_ms, total_items_count, avg_duration_ms')
      .eq('gmb_account_id', accountId)
      .order('phase');

    if (error) {
      return errorResponse(new ApiError('Failed to fetch metrics', 500, error));
    }

    return NextResponse.json({ ok: true, accountId, metrics: data || [] });
  } catch (e: any) {
    return errorResponse(e instanceof ApiError ? e : new ApiError(e.message || 'Unexpected metrics error', 500));
  }
}
