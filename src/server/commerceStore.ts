import { sanitizeFunnelMeta } from './securityMiddleware';

export type PlanId = 'free' | 'trial' | 'premium' | 'lifetime' | 'corporate';
export type PlanInterval = 'monthly' | 'annual' | 'lifetime' | 'corporate';

export interface UserPlan {
  userId: string;
  plan: PlanId;
  interval?: PlanInterval;
  status: 'active' | 'canceled' | 'past_due';
  trialEndsAt: string | null;
  autoRenew: boolean;
  seats?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserMetric {
  userId: string;
  moodScore: number;
  anxietyLevel: number;
  sleepQuality?: number;
  sessionDate: string;
  language?: string;
  source?: string;
}

export interface FunnelEvent {
  userId: string;
  event: string;
  meta?: Record<string, unknown>;
  createdAt: string;
}

const plans = new Map<string, UserPlan>();
const metrics: UserMetric[] = [];
const funnel: FunnelEvent[] = [];
const corporateLeads: Record<string, unknown>[] = [];

export const PUBLIC_PROOF_USER_ID = 'public-proof';

function isoDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function seedDemoMetrics(userId: string = PUBLIC_PROOF_USER_ID) {
  if (userId !== PUBLIC_PROOF_USER_ID) return;
  if (metrics.some((m) => m.userId === PUBLIC_PROOF_USER_ID)) return;
  for (let i = 13; i >= 0; i--) {
    const t = i / 13;
    metrics.push({
      userId: PUBLIC_PROOF_USER_ID,
      moodScore: Math.round(2 + (1 - t) * 2.4),
      anxietyLevel: Math.round(8.4 - (1 - t) * 4.4),
      sleepQuality: Math.round(5.2 + (1 - t) * 3.4),
      sessionDate: isoDate(-i),
      language: 'sw',
      source: 'seed',
    });
  }
}

const PLAN_INTERVALS: PlanInterval[] = ['monthly', 'annual', 'lifetime', 'corporate'];
const MAX_METRICS = 5_000;
const MAX_FUNNEL = 2_000;
const MAX_LEADS = 500;

export function isPlanInterval(value: unknown): value is PlanInterval {
  return typeof value === 'string' && (PLAN_INTERVALS as string[]).includes(value);
}

/** Unpaid checkout is for local/demo only unless explicitly enabled. */
export function unpaidCheckoutAllowed(): boolean {
  if (process.env.ALLOW_UNPAID_CHECKOUT === '1') return true;
  return process.env.NODE_ENV !== 'production';
}

export function getOrCreatePlan(userId: string): UserPlan {
  const existing = plans.get(userId);
  if (existing) {
    if (existing.plan === 'trial' && existing.trialEndsAt && new Date(existing.trialEndsAt) < new Date()) {
      const converted: UserPlan = {
        ...existing,
        plan: 'free',
        status: 'canceled',
        autoRenew: false,
        trialEndsAt: existing.trialEndsAt,
        updatedAt: new Date().toISOString(),
      };
      plans.set(userId, converted);
      trackFunnel(userId, 'trial_expired', { from: 'trial' });
      return converted;
    }
    return existing;
  }
  const created: UserPlan = {
    userId,
    plan: 'free',
    status: 'active',
    trialEndsAt: null,
    autoRenew: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  plans.set(userId, created);
  return created;
}

export function startTrial(userId: string, interval: PlanInterval = 'monthly'): UserPlan {
  const safeInterval = isPlanInterval(interval) ? interval : 'monthly';
  const now = new Date();
  const trialEnds = new Date(now.getTime() + 7 * 86400000);
  const plan: UserPlan = {
    userId,
    plan: 'trial',
    interval: safeInterval,
    status: 'active',
    trialEndsAt: trialEnds.toISOString(),
    autoRenew: false,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
  plans.set(userId, plan);
  trackFunnel(userId, 'trial_start', { interval: safeInterval });
  return plan;
}

export class CheckoutDisabledError extends Error {
  code = 'payment_required' as const;
  constructor(message = 'Paid checkout is not enabled. Connect a payment provider or set ALLOW_UNPAID_CHECKOUT=1 for demos.') {
    super(message);
    this.name = 'CheckoutDisabledError';
  }
}

export function checkout(userId: string, interval: PlanInterval): UserPlan {
  if (!unpaidCheckoutAllowed()) {
    throw new CheckoutDisabledError();
  }
  if (!isPlanInterval(interval)) {
    throw new Error('invalid_interval');
  }
  const now = new Date().toISOString();
  const plan: UserPlan = {
    userId,
    plan: interval === 'lifetime' ? 'lifetime' : interval === 'corporate' ? 'corporate' : 'premium',
    interval,
    status: 'active',
    trialEndsAt: null,
    autoRenew: interval !== 'lifetime',
    createdAt: plans.get(userId)?.createdAt || now,
    updatedAt: now,
  };
  plans.set(userId, plan);
  trackFunnel(userId, 'conversion', { interval, plan: plan.plan });
  return plan;
}

export function recordMetric(row: UserMetric) {
  metrics.push({
    ...row,
    moodScore: Math.min(5, Math.max(1, Number(row.moodScore) || 1)),
    anxietyLevel: Math.min(10, Math.max(1, Number(row.anxietyLevel) || 1)),
    language: row.language ? String(row.language).slice(0, 16) : undefined,
    source: row.source ? String(row.source).slice(0, 40) : undefined,
    sessionDate: String(row.sessionDate || '').slice(0, 32),
  });
  if (metrics.length > MAX_METRICS) {
    metrics.splice(0, metrics.length - MAX_METRICS);
  }
  trackFunnel(row.userId, 'metric_logged', { mood: row.moodScore, anxiety: row.anxietyLevel });
}

export function listMetrics(userId: string): UserMetric[] {
  return metrics.filter((m) => m.userId === userId).sort((a, b) => a.sessionDate.localeCompare(b.sessionDate));
}

export function getPublicProof() {
  seedDemoMetrics(PUBLIC_PROOF_USER_ID);
  return impactSummary(PUBLIC_PROOF_USER_ID);
}

export function impactSummary(userId: string) {
  const rows = listMetrics(userId);
  const last14 = rows.slice(-14);
  const first3 = last14.slice(0, 3);
  const last3 = last14.slice(-3);
  const avg = (xs: UserMetric[], key: 'anxietyLevel' | 'moodScore') =>
    xs.length ? xs.reduce((s, r) => s + r[key], 0) / xs.length : 0;
  const anxietyStart = avg(first3, 'anxietyLevel');
  const anxietyNow = avg(last3, 'anxietyLevel');
  const dropPct = anxietyStart > 0 ? Math.round(((anxietyStart - anxietyNow) / anxietyStart) * 100) : 0;
  const isPublicProof = userId === PUBLIC_PROOF_USER_ID;
  const dayCount = Math.min(14, last14.length);
  return {
    claim: isPublicProof
      ? 'Self-reported check-ins in this demo sample trend toward lower anxiety over two weeks — not a clinical result.'
      : 'Self-reported check-ins — not a clinical result. Individual trends vary.',
    days: last14.length,
    anxietyStart: Number(anxietyStart.toFixed(1)),
    anxietyNow: Number(anxietyNow.toFixed(1)),
    dropPct,
    headline: isPublicProof
      ? dropPct > 0
        ? `Anxiety check-ins dropped ${dropPct}% in ${dayCount} days.`
        : 'Demo sample of 14-day sleep and anxiety logs.'
      : dropPct > 0
        ? `Your anxiety check-ins dropped ${dropPct}% in ${dayCount} days.`
        : 'Keep logging mood so Astra can show your 14-day anxiety trend.',
    series: last14.map((r) => ({
      date: r.sessionDate,
      anxiety: r.anxietyLevel,
      mood: r.moodScore,
      sleep: r.sleepQuality ?? Math.round(10 - r.anxietyLevel * 0.6),
    })),
  };
}

export function trackFunnel(userId: string, event: string, meta?: Record<string, unknown>) {
  funnel.push({
    userId: String(userId).slice(0, 128),
    event: String(event).slice(0, 64),
    meta: sanitizeFunnelMeta(meta),
    createdAt: new Date().toISOString(),
  });
  if (funnel.length > MAX_FUNNEL) {
    funnel.splice(0, funnel.length - MAX_FUNNEL);
  }
}

export function funnelSummary() {
  const counts: Record<string, number> = {};
  for (const e of funnel) counts[e.event] = (counts[e.event] || 0) + 1;
  const uniqueUsers = new Set(funnel.map((e) => e.userId)).size;
  const trials = funnel.filter((e) => e.event === 'trial_start').length;
  const conversions = funnel.filter((e) => e.event === 'conversion').length;
  return {
    uniqueUsers,
    trials,
    conversions,
    conversionRate: trials ? Number(((conversions / trials) * 100).toFixed(1)) : 0,
    events: counts,
    // Redact full userIds in admin feed — keep a short fingerprint only.
    recent: funnel.slice(-25).reverse().map((e) => ({
      event: e.event,
      createdAt: e.createdAt,
      userFingerprint: e.userId.slice(0, 8),
      meta: e.meta,
    })),
  };
}

export function addCorporateLead(lead: Record<string, unknown>) {
  const row = {
    company: String(lead.company || '').slice(0, 200),
    contactEmail: String(lead.contactEmail || '').slice(0, 200),
    seats: Math.min(10_000, Math.max(1, Number(lead.seats) || 25)),
    packageId: String(lead.packageId || 'team').slice(0, 40),
    notes: lead.notes != null ? String(lead.notes).slice(0, 500) : undefined,
    sourceIp: lead.sourceIp != null ? String(lead.sourceIp).slice(0, 64) : undefined,
    createdAt: new Date().toISOString(),
  };
  corporateLeads.push(row);
  if (corporateLeads.length > MAX_LEADS) {
    corporateLeads.splice(0, corporateLeads.length - MAX_LEADS);
  }
  return row;
}

export function listCorporateLeads() {
  return corporateLeads;
}
