#!/usr/bin/env bash
# Unauthenticated API checks. Protected routes must 401; public routes must 200.
# Usage:
#   BASE_URL=http://127.0.0.1:3000 ./scripts/security-check.sh
#   BUNDLE=1 ./scripts/security-check.sh   # production dist/server.cjs (run npm run build first)
# Optional: TOKEN=eyJ... also asserts GET /api/corporate/leads is 403 for a non-admin.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PORT="${PORT:-3012}"
BASE_URL="${BASE_URL:-}"
STARTED=0
PID=""
LOG="${ROOT}/.aura-security-check-server.log"

cleanup() {
  if [[ "$STARTED" == "1" && -n "${PID}" ]]; then
    kill "$PID" 2>/dev/null || true
    wait "$PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

wait_for_health() {
  local url="$1"
  local i
  for i in $(seq 1 80); do
    if curl -sf "$url/api/health" >/dev/null; then
      return 0
    fi
    sleep 0.25
  done
  echo "Timed out waiting for $url/api/health" >&2
  if [[ -f "$LOG" ]]; then
    echo "---- server log ----" >&2
    tail -n 40 "$LOG" >&2 || true
  fi
  return 1
}

if [[ -n "$BASE_URL" ]]; then
  wait_for_health "$BASE_URL"
elif [[ "${BUNDLE:-}" == "1" ]]; then
  if [[ ! -f dist/server.cjs ]]; then
    echo "dist/server.cjs missing. Run npm run build first." >&2
    exit 1
  fi
  echo "Starting production bundle on port $PORT..."
  NODE_ENV=production PORT="$PORT" node dist/server.cjs >"$LOG" 2>&1 &
  PID=$!
  STARTED=1
  BASE_URL="http://127.0.0.1:${PORT}"
  wait_for_health "$BASE_URL"
elif curl -sf "http://127.0.0.1:3000/api/health" >/dev/null 2>&1; then
  BASE_URL="http://127.0.0.1:3000"
else
  echo "Starting temporary server on port $PORT..."
  PORT="$PORT" ./node_modules/.bin/tsx server.ts >"$LOG" 2>&1 &
  PID=$!
  STARTED=1
  BASE_URL="http://127.0.0.1:${PORT}"
  wait_for_health "$BASE_URL"
fi

fail=0
expect() {
  local method="$1"
  local path="$2"
  local want="$3"
  local extra=()
  if [[ -n "${4:-}" ]]; then
    extra=(-H "Authorization: Bearer $4")
  fi
  local args=(-sS -o /dev/null -w '%{http_code}' -X "$method")
  if [[ "$method" != "GET" && "$method" != "HEAD" ]]; then
    args+=(-H 'Content-Type: application/json' --data '{}')
  fi
  local code
  code="$(curl "${args[@]}" "${extra[@]}" "${BASE_URL}${path}")"
  if [[ "$code" != "$want" ]]; then
    echo "FAIL  $method $path  expected $want got $code"
    fail=1
  else
    echo "ok    $method $path  $code"
  fi
}

echo "Checking $BASE_URL"

expect GET /api/health 200
expect GET /api/plans 200
expect GET /api/metrics/proof 200
expect GET /api/corporate 200

expect POST /api/ai-coach 401
expect POST /api/verify-checkin 401
expect POST /api/rewards/checkin 401
expect POST /api/rewards/grant 401
expect POST /api/rewards/spin 401
expect POST /api/rewards/spend 401
expect GET /api/subscriptions/me 401
expect POST /api/subscriptions/trial 401
expect POST /api/subscriptions/checkout 401
expect GET /api/metrics/me 401
expect POST /api/funnel/event 401
expect GET /api/admin/session 401
expect GET /api/funnel/summary 401
expect GET /api/corporate/leads 401

# Security headers (Helmet)
hdr="$(curl -sSI "$BASE_URL/api/health")"
for needed in "x-content-type-options: nosniff" "x-frame-options: DENY" "referrer-policy:"; do
  if ! echo "$hdr" | grep -qi "$needed"; then
    echo "FAIL  missing security header matching: $needed"
    fail=1
  else
    echo "ok    security header: $needed"
  fi
done

if [[ -n "${TOKEN:-}" ]]; then
  expect GET /api/corporate/leads 403 "$TOKEN"
  expect GET /api/admin/session 403 "$TOKEN"
fi

if [[ "$fail" != "0" ]]; then
  echo "Security API checks failed."
  exit 1
fi
echo "Security API checks passed."
