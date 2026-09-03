#!/usr/bin/env bash
# Print Cloud Run secret bindings for secrets that already exist in Secret Manager.
# Usage: bash scripts/cloud-run-secret-bindings.sh [GCP_PROJECT_ID]
# Output: one KEY=SECRET:latest line per existing secret (stdout).

set -euo pipefail

PROJECT="${1:-${GCP_PROJECT_ID:-${GOOGLE_CLOUD_PROJECT:-}}}"
if [[ -z "$PROJECT" ]]; then
  echo "GCP project id required (arg or GCP_PROJECT_ID)" >&2
  exit 1
fi

# Bind as env vars on Cloud Run when the Secret Manager secret exists.
# Creating a missing secret is a one-time ops step — see README "CI and Cloud Run".
CANDIDATES=(
  GEMINI_API_KEY
  TAVILY_API_KEY
  FIREBASE_SERVICE_ACCOUNT_JSON
  ADMIN_EMAILS
  FIREBASE_WEB_API_KEY
)

for name in "${CANDIDATES[@]}"; do
  if gcloud secrets describe "$name" --project "$PROJECT" >/dev/null 2>&1; then
    echo "${name}=${name}:latest"
  else
    echo "Skipping missing Secret Manager secret: $name" >&2
  fi
done
