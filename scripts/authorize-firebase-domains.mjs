#!/usr/bin/env node
/**
 * Adds production hostnames to Firebase Auth authorized domains via the
 * Identity Toolkit Admin API. Requires gcloud credentials (e.g. GCP_SA_KEY in CI).
 *
 * Usage:
 *   FIREBASE_PROJECT_ID=aura-health-f478f node scripts/authorize-firebase-domains.mjs
 *   PRODUCTION_URL=https://www.aurahealth.co.ke node scripts/authorize-firebase-domains.mjs
 */
import { execSync } from 'node:child_process';

const projectId = process.env.FIREBASE_PROJECT_ID || 'aura-health-f478f';

const domainsToEnsure = new Set([
  'aurahealth.co.ke',
  'www.aurahealth.co.ke',
]);

for (const entry of (process.env.AUTHORIZE_DOMAINS || '').split(',')) {
  const trimmed = entry.trim();
  if (trimmed) domainsToEnsure.add(trimmed);
}

if (process.env.PRODUCTION_URL) {
  try {
    domainsToEnsure.add(new URL(process.env.PRODUCTION_URL).hostname);
  } catch {
    console.warn(`Ignoring invalid PRODUCTION_URL: ${process.env.PRODUCTION_URL}`);
  }
}

const token = execSync('gcloud auth print-access-token', { encoding: 'utf8' }).trim();
const configUrl = `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config`;

const getRes = await fetch(configUrl, {
  headers: { Authorization: `Bearer ${token}` },
});
if (!getRes.ok) {
  throw new Error(`GET config failed (${getRes.status}): ${await getRes.text()}`);
}

const config = await getRes.json();
const current = config.authorizedDomains || [];
const merged = [...new Set([...current, ...domainsToEnsure])];
const missing = [...domainsToEnsure].filter((d) => !current.includes(d));

if (missing.length === 0) {
  console.log(`Firebase Auth domains OK for ${projectId}: ${[...domainsToEnsure].join(', ')}`);
  process.exit(0);
}

const patchRes = await fetch(`${configUrl}?updateMask=authorizedDomains`, {
  method: 'PATCH',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ authorizedDomains: merged }),
});

if (!patchRes.ok) {
  throw new Error(`PATCH config failed (${patchRes.status}): ${await patchRes.text()}`);
}

const updated = await patchRes.json();
console.log(`Added Firebase Auth domains: ${missing.join(', ')}`);
console.log(`Authorized domains: ${(updated.authorizedDomains || merged).join(', ')}`);
