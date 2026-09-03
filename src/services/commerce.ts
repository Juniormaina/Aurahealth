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

export type CoachReplySuccess = {
  ok: true;
  reply: string;
  sources?: { title: string; uri: string }[];
  crisis?: boolean;
};

export type CoachReplyFailure = {
  ok: false;
  status: number;
  code?: string;
  message: string;
};

export type CoachReplyResult = CoachReplySuccess | CoachReplyFailure;

export function isCoachReplyFailure(result: CoachReplyResult): result is CoachReplyFailure {
  return result.ok === false;
}

/** POST /api/ai-coach with token refresh on 401 and a request timeout. */
export async function fetchCoachReply(payload: Record<string, unknown>): Promise<CoachReplyResult> {
  const user = auth.currentUser;
  if (!user) {
    return { ok: false, status: 401, message: 'Sign in to chat with Astra.' };
  }

  const post = async (forceRefresh: boolean) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await user.getIdToken(forceRefresh)}`,
    };
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 90_000);
    try {
      return await fetch('/api/ai-coach', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  };

  let response: Response;
  try {
    response = await post(false);
    if (response.status === 401) {
      response = await post(true);
    }
  } catch (err) {
    console.error('Coach network error:', err);
    const aborted = err instanceof Error && err.name === 'AbortError';
    return {
      ok: false,
      status: 0,
      message: aborted
        ? 'Astra took too long to respond. Try again.'
        : 'Connection hiccup — your streak and check-ins are still saved. Try sending again.',
    };
  }

  if (response.ok) {
    const data = (await response.json().catch(() => ({}))) as {
      reply?: string;
      sources?: { title: string; uri: string }[];
      crisis?: boolean;
    };
    const reply = typeof data.reply === 'string' ? data.reply.trim() : '';
    if (!reply) {
      return { ok: false, status: 502, message: 'Astra returned an empty reply. Try again.' };
    }
    return { ok: true, reply, sources: data.sources, crisis: data.crisis };
  }

  const data = (await response.json().catch(() => ({}))) as { code?: string; error?: string };
  if (response.status === 403 && data.code === 'email_unverified') {
    return {
      ok: false,
      status: 403,
      code: 'email_unverified',
      message: 'Confirm the link we sent to your email to unlock Astra chat. You can resend it from Settings.',
    };
  }
  if (response.status === 401) {
    return { ok: false, status: 401, message: 'Your session expired. Sign out and sign in again, then retry.' };
  }
  if (response.status === 429) {
    return { ok: false, status: 429, message: 'Too many messages right now. Wait a minute and try again.' };
  }
  if (response.status === 503 && data.code === 'ai_unconfigured') {
    return {
      ok: false,
      status: 503,
      code: 'ai_unconfigured',
      message: 'Astra AI is not configured on this server yet. Check-ins still save.',
    };
  }
  if (response.status === 503) {
    return {
      ok: false,
      status: 503,
      code: data.code || 'ai_unavailable',
      message: data.error || 'Astra could not reach the AI service just then. Please try again.',
    };
  }
  return {
    ok: false,
    status: response.status,
    message: data.error || 'Astra could not reply just then. Please try again.',
  };
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
