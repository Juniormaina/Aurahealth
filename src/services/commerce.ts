import { CORPORATE_PACKAGES, SUBSCRIPTION_TIERS } from '../content/valueProps';
import type { PlanInterval, UserMetric, UserPlan } from '../server/commerceStore';

async function json<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) throw new Error(`${path} failed`);
  return res.json() as Promise<T>;
}

export function catalog() {
  return { tiers: SUBSCRIPTION_TIERS, corporate: CORPORATE_PACKAGES };
}

export function fetchPlan(userId: string) {
  return json<{ plan: UserPlan }>(`/api/subscriptions/${encodeURIComponent(userId)}`);
}

export function startTrial(userId: string, interval: PlanInterval = 'monthly') {
  return json<{ plan: UserPlan }>('/api/subscriptions/trial', {
    method: 'POST',
    body: JSON.stringify({ userId, interval }),
  });
}

export function checkout(userId: string, interval: PlanInterval) {
  return json<{ plan: UserPlan }>('/api/subscriptions/checkout', {
    method: 'POST',
    body: JSON.stringify({ userId, interval }),
  });
}

export function logMetric(row: UserMetric) {
  return json<{ ok: boolean }>('/api/metrics', {
    method: 'POST',
    body: JSON.stringify(row),
  });
}

export function fetchImpact(userId: string) {
  return json<{
    claim: string;
    days: number;
    anxietyStart: number;
    anxietyNow: number;
    dropPct: number;
    headline: string;
    series: { date: string; anxiety: number; mood: number; sleep?: number }[];
  }>(`/api/metrics/${encodeURIComponent(userId)}/impact`);
}

export function trackFunnel(userId: string, event: string, meta?: Record<string, unknown>) {
  return json('/api/funnel/event', {
    method: 'POST',
    body: JSON.stringify({ userId, event, meta }),
  }).catch(() => undefined);
}

export function requestCorporatePackage(payload: {
  company: string;
  contactEmail: string;
  seats: number;
  packageId: string;
  notes?: string;
}) {
  return json('/api/corporate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
