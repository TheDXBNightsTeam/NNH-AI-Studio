-- Create extension for UUID generation if not exists
create extension if not exists pgcrypto;

-- Metrics table to accumulate phase durations and item counts per account/phase
create table if not exists public.gmb_metrics (
  id uuid primary key default gen_random_uuid(),
  gmb_account_id uuid not null,
  user_id uuid not null,
  phase text not null check (phase in ('locations','reviews','media','questions','performance','keywords')),
  runs_count integer not null default 0,
  total_duration_ms bigint not null default 0,
  total_items_count bigint not null default 0,
  avg_duration_ms numeric generated always as ((case when runs_count > 0 then total_duration_ms::numeric / runs_count else 0 end)) stored,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint gmb_metrics_unique unique (gmb_account_id, phase)
);

create index if not exists gmb_metrics_account_phase_idx on public.gmb_metrics (gmb_account_id, phase);
