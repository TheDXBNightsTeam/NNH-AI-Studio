-- Enable required extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Table to record granular phase logs for each GMB sync
-- Phases: locations, reviews, media, questions, performance, keywords
-- Status values: started | completed | skipped | error

CREATE TABLE IF NOT EXISTS gmb_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gmb_account_id uuid NOT NULL REFERENCES gmb_accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  phase text NOT NULL,
  status text NOT NULL DEFAULT 'started',
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  duration_ms integer,
  counts jsonb DEFAULT '{}'::jsonb,
  error text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gmb_sync_logs_account_phase ON gmb_sync_logs (gmb_account_id, phase);
CREATE INDEX IF NOT EXISTS idx_gmb_sync_logs_account_time ON gmb_sync_logs (gmb_account_id, started_at DESC);
