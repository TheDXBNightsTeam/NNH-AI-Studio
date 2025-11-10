#!/usr/bin/env bash
# Apply hardening SQL and verify core indexes for Supabase Postgres
# Usage:
#   DATABASE_URL=postgres://user:pass@host:port/db ./scripts/apply_hardening_and_verify.sh
# If psql is not available or DATABASE_URL is missing, the script will print manual instructions.
set -euo pipefail

SQL_FILE="sql/hardening_gmb.sql"

if ! command -v psql >/dev/null 2>&1; then
  echo "psql not found. Please either:" >&2
  echo "  1) Install psql locally and run: DATABASE_URL=... ./scripts/apply_hardening_and_verify.sh" >&2
  echo "  2) Open Supabase SQL editor and paste contents of: $SQL_FILE" >&2
  exit 0
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is not set. Provide a Postgres connection string." >&2
  echo "Example: DATABASE_URL=postgres://postgres:pass@db.supabase.co:6543/postgres ./scripts/apply_hardening_and_verify.sh" >&2
  exit 1
fi

echo "Applying hardening SQL..."
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$SQL_FILE"

echo "Verifying indexes..."
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "\
select indexname, tablename
from pg_indexes
where schemaname='public'
  and indexname in (
    'gmb_locations_account_idx','gmb_locations_normalized_idx','gmb_reviews_location_idx',
    'gmb_media_location_idx','gmb_questions_location_idx','gmb_perf_location_date_idx',
    'gmb_keywords_location_month_idx','uidx_gmb_reviews_external','uidx_gmb_media_external',
    'uidx_gmb_questions_external','uidx_gmb_perf_loc_date_type','uidx_gmb_keywords_loc_term_month'
  )
order by indexname;"

echo "Done."
