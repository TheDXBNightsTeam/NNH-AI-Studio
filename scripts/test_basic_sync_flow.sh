#!/usr/bin/env bash
# Basic sync flow test: assumes environment variables and auth cookie available.
# Usage: ./scripts/test_basic_sync_flow.sh <ACCOUNT_ID> <AUTH_BEARER_TOKEN>
set -euo pipefail

ACCOUNT_ID=${1:-}
AUTH_TOKEN=${2:-}
BASE_URL=${BASE_URL:-http://localhost:5050}

if [ -z "$ACCOUNT_ID" ]; then
  echo "Missing ACCOUNT_ID argument" >&2
  exit 1
fi
if [ -z "$AUTH_TOKEN" ]; then
  echo "Missing AUTH_BEARER_TOKEN argument" >&2
  exit 1
fi

function post_sync() {
  local sync_type=$1
  echo "\n==> Triggering sync type: $sync_type" >&2
  curl -s -X POST "$BASE_URL/api/gmb/sync" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H 'Content-Type: application/json' \
    -d '{"accountId":"'$ACCOUNT_ID'","syncType":"'$sync_type'"}' | jq '{ok, syncType, counts, skipped_sections, took_ms}'
}

post_sync reviews
post_sync full

echo "\n==> Fetching status" >&2
curl -s "$BASE_URL/api/gmb/sync/status?accountId=$ACCOUNT_ID" | jq '.'

echo "\nTest flow completed." >&2
