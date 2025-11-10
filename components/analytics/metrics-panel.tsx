"use client";

import React from 'react';

type MetricRow = {
  phase: string;
  runs_count: number;
  total_duration_ms: number;
  total_items_count: number;
  avg_duration_ms: number | null;
};

export function MetricsPanel({ accountId }: { accountId: string }) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<MetricRow[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const url = `/api/gmb/metrics?accountId=${encodeURIComponent(accountId)}`;
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.error || `Request failed (${res.status})`);
        }
        const j = await res.json();
        if (!cancelled) setRows(j.metrics || []);
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Failed to load metrics');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (accountId) load();
    return () => { cancelled = true; };
  }, [accountId]);

  if (!accountId) return null;
  if (loading) return <div className="text-sm text-muted-foreground">Loading metrics…</div>;
  if (error) return <div className="text-sm text-red-600">{error}</div>;

  const fmtMs = (ms: number | null) => ms == null ? '-' : `${ms} ms`;

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="text-left p-2 border-b">Phase</th>
            <th className="text-left p-2 border-b">Runs</th>
            <th className="text-left p-2 border-b">Items</th>
            <th className="text-left p-2 border-b">Avg Duration</th>
            <th className="text-left p-2 border-b">Total Duration</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.phase}>
              <td className="p-2 border-b capitalize">{r.phase}</td>
              <td className="p-2 border-b">{r.runs_count}</td>
              <td className="p-2 border-b">{r.total_items_count}</td>
              <td className="p-2 border-b">{fmtMs(r.avg_duration_ms)}</td>
              <td className="p-2 border-b">{fmtMs(r.total_duration_ms)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MetricsPanel;
