-- NNH AI Studio - GMB Hardening & Indexes
-- Safe migration: uses IF EXISTS / IF NOT EXISTS and avoids breaking constraints

-- Extensions
create extension if not exists pgcrypto;

-- Backfill normalized_location_id
update public.gmb_locations gl
set normalized_location_id = regexp_replace(coalesce(gl.location_id, ''), '[^a-zA-Z0-9]', '_', 'g')
where (gl.normalized_location_id is null or gl.normalized_location_id = '')
  and gl.location_id is not null;

-- Helpful indexes
create index if not exists gmb_locations_account_idx on public.gmb_locations (gmb_account_id);
create index if not exists gmb_locations_normalized_idx on public.gmb_locations (normalized_location_id);
create index if not exists gmb_reviews_location_idx on public.gmb_reviews (location_id);
create index if not exists gmb_media_location_idx on public.gmb_media (location_id);
create index if not exists gmb_questions_location_idx on public.gmb_questions (location_id);
create index if not exists gmb_perf_location_date_idx on public.gmb_performance_metrics (location_id, metric_date);
create index if not exists gmb_keywords_location_month_idx on public.gmb_search_keywords (location_id, month_year);

-- De-duplication safeguards via unique indexes (prefer safe unique indexes instead of constraints here)
create unique index if not exists uidx_gmb_reviews_external on public.gmb_reviews (external_review_id);
create unique index if not exists uidx_gmb_media_external on public.gmb_media (external_media_id);
create unique index if not exists uidx_gmb_questions_external on public.gmb_questions (external_question_id);
create unique index if not exists uidx_gmb_perf_loc_date_type on public.gmb_performance_metrics (location_id, metric_date, metric_type);
create unique index if not exists uidx_gmb_keywords_loc_term_month on public.gmb_search_keywords (location_id, search_keyword, month_year);

-- Optional: tighten NULLs (commented to avoid breaking existing rows)
-- alter table public.gmb_reviews alter column external_review_id set not null;
-- alter table public.gmb_media alter column external_media_id set not null;
-- alter table public.gmb_questions alter column external_question_id set not null;

-- Optional: enable RLS and basic per-user read policies (apply with care)
-- alter table public.gmb_locations enable row level security;
-- create policy if not exists sel_user_locations on public.gmb_locations for select using (auth.uid() = user_id);
-- Repeat similarly for other tables as needed.

-- Analyze to help planner
analyze public.gmb_locations;
analyze public.gmb_reviews;
analyze public.gmb_media;
analyze public.gmb_questions;
analyze public.gmb_performance_metrics;
analyze public.gmb_search_keywords;
-- GMB production hardening: indexes, normalization, uniqueness
-- Safe to run multiple times

-- 1) Normalize location_id into normalized_location_id
update public.gmb_locations gl
set normalized_location_id = regexp_replace(coalesce(gl.location_id, ''), '[^a-zA-Z0-9]', '_', 'g')
where (gl.normalized_location_id is null or gl.normalized_location_id = '')
  and gl.location_id is not null;

-- 2) Helpful indexes
create index if not exists gmb_locations_account_idx on public.gmb_locations (gmb_account_id);
create index if not exists gmb_locations_normalized_idx on public.gmb_locations (normalized_location_id);

create index if not exists gmb_reviews_location_idx on public.gmb_reviews (location_id);
create index if not exists gmb_media_location_idx on public.gmb_media (location_id);
create index if not exists gmb_questions_location_idx on public.gmb_questions (location_id);

create index if not exists gmb_perf_loc_date_idx on public.gmb_performance_metrics (location_id, metric_date);
create index if not exists gmb_keywords_loc_month_idx on public.gmb_search_keywords (location_id, month_year);

-- 3) Uniqueness to avoid duplicates from repeated sync upserts
-- Use unique indexes (safer to create if not exists)
create unique index if not exists gmb_reviews_external_uidx on public.gmb_reviews (external_review_id);
create unique index if not exists gmb_media_external_uidx on public.gmb_media (external_media_id);
create unique index if not exists gmb_questions_external_uidx on public.gmb_questions (external_question_id);

-- 4) Metrics helpful index
create index if not exists gmb_metrics_account_phase_idx on public.gmb_metrics (gmb_account_id, phase);
