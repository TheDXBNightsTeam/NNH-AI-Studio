import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function sseHeaders() {
  return new Headers({
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });
}

async function fetchSummary(supabase: any, accountId: string) {
  const { data: logs } = await supabase
    .from('gmb_sync_logs')
    .select('id, phase, status, started_at, ended_at, counts, error')
    .eq('gmb_account_id', accountId)
    .order('started_at',{ ascending: false })
    .limit(180);

  const phasesOrder = ['locations','reviews','media','questions','performance','keywords'];
  const summaries = phasesOrder.map(phase => {
    const pl = (logs || []).filter((l:any)=> l.phase === phase);
    const last = pl[0];
    return {
      phase,
      status: last?.status || 'idle',
      last_started_at: last?.started_at || null,
      last_ended_at: last?.ended_at || null,
      last_counts: last?.counts || {},
      last_error: last?.error || null,
    };
  });
  return summaries;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const accountId = url.searchParams.get('accountId');
  if (!accountId) {
    return new NextResponse('accountId is required', { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const write = (data: any) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      const ping = () => controller.enqueue(encoder.encode(`: ping\n\n`));

      // أرسل الحالة الأولية
      const initial = await fetchSummary(supabase, accountId);
      write({ type: 'summary', phases: initial, at: new Date().toISOString() });

      let isClosed = false;
      const abort = (reason?: any) => {
        if (isClosed) return;
        isClosed = true;
        try { controller.close(); } catch {}
      };

      // حلقة polling خفيفة لمدة 30 ثانية، كل 3 ثواني
      const endAt = Date.now() + 30_000;
      while (!isClosed && Date.now() < endAt) {
        try {
          await new Promise(r => setTimeout(r, 3000));
          const current = await fetchSummary(supabase, accountId);
          write({ type: 'summary', phases: current, at: new Date().toISOString() });
          ping();
        } catch (e) {
          // اكمل بهدوء
        }
      }

      // إنهاء البث
      write({ type: 'done', at: new Date().toISOString() });
      abort();
    },
    cancel() {}
  });

  return new NextResponse(stream, { headers: sseHeaders() });
}
