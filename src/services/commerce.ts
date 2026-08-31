import { CORPORATE_PACKAGES, SUBSCRIPTION_TIERS } from '../content/valueProps';
import { auth } from './firebase';
import type { PlanInterval, UserMetric, UserPlan } from '../server/commerceStore';

export async function authHeaders(extra?: HeadersInit): Promise<HeadersInit> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const user = auth.currentUser;
  if (user) {
    headers.Authorization = `Bearer ${await user.getIdToken()}`;
  }
  if (extra) {
    const extraObj = extra instanceof Headers ? Object.fromEntries(extra.entries()) : extra;
    Object.assign(headers, extraObj);
  }
  return headers;
}

export async function authorizedFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(path, {
    ...init,
    headers: await authHeaders(init?.headers),
  });
}

async function json<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await authorizedFetch(path, init);
  if (!res.ok) throw new Error(`${path} failed`);
  return res.json() as Promise<T>;
}

export function catalog() {
  return { tiers: SUBSCRIPTION_TIERS, corporate: CORPORATE_PACKAGES };
}

export function fetchPlan() {
  if (!auth.currentUser) return Promise.reject(new Error('Sign in required'));
  return json<{ plan: UserPlan }>('/api/subscriptions/me');
}

export function startTrial(interval: PlanInterval = 'monthly') {
  return json<{ plan: UserPlan }>('/api/subscriptions/trial', {
    method: 'POST',
    body: JSON.stringify({ interval }),
  });
}

export function checkout(interval: PlanInterval) {
  return json<{ plan: UserPlan }>('/api/subscriptions/checkout', {
    method: 'POST',
    body: JSON.stringify({ interval }),
  });
}

export function logMetric(row: Omit<UserMetric, 'userId'>) {
  if (!auth.currentUser) return Promise.resolve({ ok: false as const });
  return json<{ ok: boolean }>('/api/metrics', {
    method: 'POST',
    body: JSON.stringify(row),
  });
}

export function fetchImpact() {
  if (!auth.currentUser) return Promise.reject(new Error('Sign in required'));
  return json<{
    claim: string;
    days: number;
    anxietyStart: number;
    anxietyNow: number;
    dropPct: number;
    headline: string;
    series: { date: string; anxiety: number; mood: number; sleep?: number }[];
  }>('/api/metrics/me/impact');
}

export function trackFunnel(event: string, meta?: Record<string, unknown>) {
  if (!auth.currentUser) return Promise.resolve(undefined);
  return json('/api/funnel/event', {
    method: 'POST',
    body: JSON.stringify({ event, meta }),
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
