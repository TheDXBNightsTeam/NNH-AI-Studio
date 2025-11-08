import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ApiError, errorResponse } from '@/utils/api-error';

export const dynamic = 'force-dynamic';

// تحسب تقدير الوقت المتبقي بناءً على متوسط المدد السابقة لكل مرحلة
function estimateRemaining(phases: any[]) {
  const pending = phases.filter(p => p.status === 'started');
  if (pending.length === 0) return 0;
  const avg = pending.map(p => p.avg_duration_ms || 0).reduce((a,b)=>a+b,0);
  return Math.round(avg); // تقريب مبسط
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('accountId');
    if (!accountId) {
      return errorResponse(new ApiError('accountId query param مطلوب', 400));
    }

    // تحقق من المستخدم
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse(new ApiError('يلزم تسجيل الدخول', 401));
    }

    // آخر 30 سجل لكل مرحلة
    const { data: logs, error } = await supabase
      .from('gmb_sync_logs')
      .select('id, phase, status, started_at, ended_at, counts, error')
      .eq('gmb_account_id', accountId)
      .order('started_at',{ ascending: false })
      .limit(180); // تقريباً 30 * 6 مراحل

    if (error) {
      return errorResponse(new ApiError('فشل قراءة السجلات', 500, error));
    }

    const phasesOrder = ['locations','reviews','media','questions','performance','keywords'];
    const phaseSummaries = phasesOrder.map(phase => {
      const phaseLogs = logs.filter(l => l.phase === phase);
      const last = phaseLogs[0];
      // احسب متوسط مدة مكتملة
      const durations = phaseLogs
        .filter(l => l.status === 'completed' && l.started_at && l.ended_at)
        .map(l => new Date(l.ended_at).getTime() - new Date(l.started_at).getTime())
        .filter(d => d > 0);
      const avg_duration_ms = durations.length ? Math.round(durations.reduce((a,b)=>a+b,0)/durations.length) : null;
      return {
        phase,
        status: last?.status || 'idle',
        last_started_at: last?.started_at || null,
        last_ended_at: last?.ended_at || null,
        last_counts: last?.counts || {},
        last_error: last?.error || null,
        avg_duration_ms,
      };
    });

    const estimate_ms = estimateRemaining(phaseSummaries);

    return NextResponse.json({
      ok: true,
      accountId,
      phases: phaseSummaries,
      estimate_remaining_ms: estimate_ms,
      server_time: new Date().toISOString()
    });
  } catch (e: any) {
    return errorResponse(e instanceof ApiError ? e : new ApiError(e.message || 'Failed to fetch sync status', 500));
  }
}
