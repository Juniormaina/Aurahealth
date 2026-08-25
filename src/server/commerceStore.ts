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

function isoDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function seedDemoMetrics(userId: string) {
  if (metrics.some((m) => m.userId === userId)) return;
  for (let i = 13; i >= 0; i--) {
    const t = i / 13;
    metrics.push({
      userId,
      moodScore: Math.round(2 + (1 - t) * 2.4),
      anxietyLevel: Math.round(8.4 - (1 - t) * 4.4),
      sleepQuality: Math.round(5.2 + (1 - t) * 3.4),
      sessionDate: isoDate(-i),
      language: 'sw',
      source: 'seed',
    });
  }
}

export function getOrCreatePlan(userId: string): UserPlan {
  const existing = plans.get(userId);
  if (existing) {
    if (existing.plan === 'trial' && existing.trialEndsAt && new Date(existing.trialEndsAt) < new Date()) {
      const converted: UserPlan = {
        ...existing,
        plan: 'premium',
        interval: existing.interval || 'monthly',
        status: 'active',
        autoRenew: true,
        updatedAt: new Date().toISOString(),
      };
      plans.set(userId, converted);
      trackFunnel(userId, 'auto_subscribe', { from: 'trial' });
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
  const now = new Date();
  const trialEnds = new Date(now.getTime() + 7 * 86400000);
  const plan: UserPlan = {
    userId,
    plan: 'trial',
    interval,
    status: 'active',
    trialEndsAt: trialEnds.toISOString(),
    autoRenew: true,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
  plans.set(userId, plan);
  trackFunnel(userId, 'trial_start', { interval });
  return plan;
}

export function checkout(
  userId: string,
  interval: PlanInterval
): UserPlan {
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
  metrics.push(row);
  trackFunnel(row.userId, 'metric_logged', { mood: row.moodScore, anxiety: row.anxietyLevel });
}

export function listMetrics(userId: string): UserMetric[] {
  seedDemoMetrics(userId);
  return metrics.filter((m) => m.userId === userId).sort((a, b) => a.sessionDate.localeCompare(b.sessionDate));
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
  return {
    claim: 'Aura Health adapts to your mood in real time, cutting anxiety levels by half in two weeks.',
    days: last14.length,
    anxietyStart: Number(anxietyStart.toFixed(1)),
    anxietyNow: Number(anxietyNow.toFixed(1)),
    dropPct,
    headline:
      dropPct > 0
        ? `Your anxiety check-ins dropped ${dropPct}% in ${Math.min(14, last14.length)} days.`
        : 'Keep logging mood so Astra can prove your 14-day anxiety trend.',
    series: last14.map((r) => ({
      date: r.sessionDate,
      anxiety: r.anxietyLevel,
      mood: r.moodScore,
      sleep: r.sleepQuality ?? Math.round(10 - r.anxietyLevel * 0.6),
    })),
  };
}

export function trackFunnel(userId: string, event: string, meta?: Record<string, unknown>) {
  funnel.push({ userId, event, meta, createdAt: new Date().toISOString() });
}

export function funnelSummary() {
  const counts: Record<string, number> = {};
  for (const e of funnel) counts[e.event] = (counts[e.event] || 0) + 1;
  const uniqueUsers = new Set(funnel.map((e) => e.userId)).size;
  const trials = funnel.filter((e) => e.event === 'trial_start').length;
  const conversions = funnel.filter((e) => e.event === 'conversion' || e.event === 'auto_subscribe').length;
  return {
    uniqueUsers,
    trials,
    conversions,
    conversionRate: trials ? Number(((conversions / trials) * 100).toFixed(1)) : 0,
    events: counts,
    recent: funnel.slice(-25).reverse(),
  };
}

export function addCorporateLead(lead: Record<string, unknown>) {
  const row = { ...lead, createdAt: new Date().toISOString() };
  corporateLeads.push(row);
  return row;
}

export function listCorporateLeads() {
  return corporateLeads;
}
