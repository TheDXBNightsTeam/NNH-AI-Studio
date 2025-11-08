#!/usr/bin/env bash
# Post-deploy hardening helper
# Usage: SUPABASE_SERVICE_ROLE_KEY=... SUPABASE_URL=... ./scripts/post_deploy_hardening.sh
set -euo pipefail

if [ -z "${SUPABASE_URL:-}" ] || [ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]; then
  echo "Must set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars" >&2
  exit 1
fi

SQL_FILE="sql/hardening_gmb.sql"
if [ ! -f "$SQL_FILE" ]; then
  echo "Missing $SQL_FILE" >&2
  exit 1
fi

echo "Applying hardening SQL..."
PAYLOAD=$(jq -Rs '{q: .}' < "$SQL_FILE")

curl -s -X POST "${SUPABASE_URL}/rest/v1/rpc/execute_sql" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "${PAYLOAD}" || echo "(Note: execute_sql function must exist if using this approach)"

echo "Done. Verify indexes via dashboard or SQL inspector."