import type { Activity, DailySummary, Meal, WellnessCheck } from '../types/lifestyle';
import { isSameLocalDay, localDateKey } from './lifestyleCalculations';
import {
  buildDailySummary,
  loadActivities,
  loadMeals,
  loadWellnessChecks,
} from './lifestyleStorage';

export type TrendDirection = 'up' | 'down' | 'stable';
export type CoachingMode = 'move' | 'eat' | 'recover' | 'balanced';
export type SafetyBand = 'green' | 'yellow' | 'red';

export interface AstraTrends {
  sleepTrend?: TrendDirection;
  energyTrend?: TrendDirection;
  activityTrend?: TrendDirection;
  stressTrend?: TrendDirection;
  /** True when there are not enough days to call a direction. */
  insufficient: boolean;
}

export interface AstraContext {
  user: {
    name?: string;
    language: 'en';
    goals: string[];
  };
  today: {
    sleepHours?: number;
    energy?: number;
    stress?: number;
    soreness?: number;
    recoveryScore?: number;
    activeMinutes: number;
    movementPoints: number;
    meals: number;
    calories: number;
    protein: number;
    hydration?: number;
  };
  recent: {
    activities: Activity[];
    meals: Meal[];
    checkIns: WellnessCheck[];
  };
  trends: AstraTrends;
  recommendations: {
    mode: CoachingMode;
    why: string;
    next: string[];
  };
}

export interface DailySeries {
  /** Oldest → newest. Null means no observation that day. */
  sleep: Array<number | null>;
  energy: Array<number | null>;
  stress: Array<number | null>;
  activityMinutes: number[];
}

function numeric(values: Array<number | null | undefined>): number[] {
  return values.filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
}

/**
 * Compare the newer calendar half to the older half.
 * Gaps stay in place — nulls are not squeezed together — and each half needs
 * two real observations before a direction is named.
 */
export function seriesTrend(
  values: Array<number | null | undefined>,
  minDelta: number
): TrendDirection | undefined {
  if (values.length < 4) return undefined;
  const mid = Math.floor(values.length / 2);
  const older = numeric(values.slice(0, mid));
  const newer = numeric(values.slice(mid));
  if (older.length < 2 || newer.length < 2) return undefined;
  const avg = (xs: number[]) => xs.reduce((s, n) => s + n, 0) / xs.length;
  const delta = avg(newer) - avg(older);
  if (Math.abs(delta) < minDelta) return 'stable';
  return delta > 0 ? 'up' : 'down';
}

export function selectCoachingMode(today: AstraContext['today'], weekActiveMinutes = 0): {
  mode: CoachingMode;
  why: string;
  next: string[];
} {
  const recoveryLow = today.recoveryScore != null && today.recoveryScore < 55;
  const shortSleep = today.sleepHours != null && today.sleepHours < 6;
  const lowEnergy = today.energy != null && today.energy <= 2;
  const highStress = today.stress != null && today.stress >= 4;
  const highSoreness = today.soreness != null && today.soreness >= 4;

  const shortSleepWithoutEnergy =
    shortSleep && today.energy == null && (today.recoveryScore == null || today.recoveryScore < 65);
  // RECOVER is decided before MOVE/EAT so a poor recovery day is not overridden by activity targets.
  if (recoveryLow || (shortSleep && lowEnergy) || highStress || highSoreness || shortSleepWithoutEnergy) {
    return {
      mode: 'recover',
      why: 'Sleep, energy, stress, soreness, or recovery looks better suited to a lighter day.',
      next: [
        '10–20 minutes of easy walking or household movement',
        'Hydrate early',
        'Aim for an earlier bedtime if sleep was short',
      ],
    };
  }

  const emptyDay =
    today.meals === 0 &&
    today.activeMinutes === 0 &&
    today.recoveryScore == null &&
    today.sleepHours == null &&
    today.energy == null;

  if (emptyDay) {
    return {
      mode: 'balanced',
      why: 'Nothing is logged yet today, so there is no reason to push one pillar.',
      next: ['Log a short walk, a meal, or a Uko Sawa check-in'],
    };
  }

  const lightFuel =
    (today.meals === 0 && today.activeMinutes >= 20) ||
    (today.meals > 0 && today.protein < 15 && today.calories < 400);
  if (lightFuel) {
    return {
      mode: 'eat',
      why: 'Meals or protein look light relative to a normal day. Estimates only — not a diet plan.',
      next: [
        'Log a plate in Kenyan Food Lens',
        'Pair a staple with vegetables and a protein you already eat',
        'Drink a glass of water with the meal',
      ],
    };
  }

  const recovered = today.recoveryScore == null || today.recoveryScore >= 65;
  const energyOk = today.energy == null || today.energy >= 3;
  const alreadyMoving = today.activeMinutes >= 30 || weekActiveMinutes >= 180;
  if (recovered && energyOk && today.activeMinutes < 20 && !alreadyMoving) {
    return {
      mode: 'move',
      why: 'Energy and recovery look okay, and logged movement is still low today.',
      next: [
        '15 minutes of walking — to work, the market, or around home',
        'Stairs or carrying groceries count in Shamba Fit',
        'Log it so Astra can see the day',
      ],
    };
  }

  if (alreadyMoving && today.activeMinutes >= 30) {
    return {
      mode: 'balanced',
      why: 'Movement is already on the board. No need to push another hard session.',
      next: ['Keep hydration going', 'A short mobility stretch is enough if you want more'],
    };
  }

  return {
    mode: 'balanced',
    why: 'Nothing in today’s logs calls for a strong push in one direction.',
    next: ['One small win: a walk, a logged meal, or a Uko Sawa check-in'],
  };
}

const RED =
  /\b(chest pain|can'?t breathe|cannot breathe|difficulty breathing|fainted|fainting|unconscious|severe bleeding|coughing blood|worst headache of my life)\b/i;
const YELLOW =
  /\b(dizzy|dizziness|fever|sharp pain|numb|swelling|very sore|palpitat)\b/i;

/** Wellness safety band. Crisis/self-harm stays in the existing crisis detector. */
export function wellnessSafety(text: string): SafetyBand {
  const t = text.trim();
  if (!t) return 'green';
  if (RED.test(t)) return 'red';
  if (YELLOW.test(t)) return 'yellow';
  return 'green';
}

function latestCheck(checks: WellnessCheck[], day: string): WellnessCheck | undefined {
  return [...checks]
    .filter((c) => isSameLocalDay(c.timestamp, day))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];
}

function dayKeys(count: number, end = new Date()): string[] {
  const keys: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    keys.push(localDateKey(d));
  }
  return keys;
}

export function buildDailySeries(
  activities: Activity[],
  checks: WellnessCheck[],
  days = 7,
  end = new Date()
): DailySeries {
  const keys = dayKeys(days, end);
  return {
    sleep: keys.map((day) => latestCheck(checks, day)?.sleepHours ?? null),
    energy: keys.map((day) => latestCheck(checks, day)?.energyLevel ?? null),
    stress: keys.map((day) => latestCheck(checks, day)?.stressLevel ?? null),
    activityMinutes: keys.map((day) =>
      activities
        .filter((a) => isSameLocalDay(a.timestamp, day))
        .reduce((s, a) => s + a.durationMinutes, 0)
    ),
  };
}

export function trendsFromSeries(series: DailySeries): AstraTrends {
  const sleepTrend = seriesTrend(series.sleep, 0.6);
  const energyTrend = seriesTrend(series.energy, 0.6);
  const stressTrend = seriesTrend(series.stress, 0.6);
  const activityTrend = seriesTrend(
    series.activityMinutes.map((n) => (n > 0 ? n : null)),
    8
  );
  return {
    sleepTrend,
    energyTrend,
    activityTrend,
    stressTrend,
    insufficient: !sleepTrend && !energyTrend && !stressTrend && !activityTrend,
  };
}

export function buildAstraContextFromLogs(input: {
  name?: string;
  goals?: string[];
  today: DailySummary;
  activities: Activity[];
  meals: Meal[];
  checks: WellnessCheck[];
}): AstraContext {
  const newestFirst = [...input.checks].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  const check = newestFirst.find((c) => isSameLocalDay(c.timestamp, input.today.date)) ?? null;
  const series = buildDailySeries(input.activities, input.checks, 7);
  const weekActive = series.activityMinutes.reduce((s, n) => s + n, 0);
  const todayView: AstraContext['today'] = {
    sleepHours: check?.sleepHours,
    energy: check?.energyLevel,
    stress: check?.stressLevel,
    soreness: check?.soreness,
    recoveryScore: input.today.recovery?.score,
    activeMinutes: input.today.activeMinutes,
    movementPoints: input.today.movementPoints,
    meals: input.today.mealCount,
    calories: input.today.nutrition.calories,
    protein: input.today.nutrition.protein,
    hydration: input.today.hydrationGlasses,
  };
  const recommendations = selectCoachingMode(todayView, weekActive);
  return {
    user: { name: input.name, language: 'en', goals: input.goals ?? [] },
    today: todayView,
    recent: {
      activities: input.activities.slice(0, 12),
      meals: input.meals.slice(0, 8),
      checkIns: input.checks.slice(0, 8),
    },
    trends: trendsFromSeries(series),
    recommendations,
  };
}

export function buildAstraContext(userKey: string, name?: string): AstraContext {
  const today = buildDailySummary(userKey);
  return buildAstraContextFromLogs({
    name,
    today,
    activities: loadActivities(userKey),
    meals: loadMeals(userKey),
    checks: loadWellnessChecks(userKey),
  });
}

function trendLine(label: string, trend?: TrendDirection): string | null {
  if (!trend) return null;
  return `${label} ${trend}`;
}

/** Compact block sent with the coach request. Estimates, not medical facts. */
export function formatAstraContextBlock(ctx: AstraContext): string {
  const t = ctx.today;
  const lines = [
    'Trends are observations only. Never say a metric caused a symptom. Say “often follows” if you mention a pattern.',
    `Coaching mode: ${ctx.recommendations.mode.toUpperCase()} — ${ctx.recommendations.why}`,
    `Today: movement ${t.activeMinutes} min / ${t.movementPoints} pts; meals ${t.meals}; est. ${t.calories} kcal, protein ${t.protein}g; hydration ${t.hydration ?? 0}/8 glasses.`,
  ];
  if (t.recoveryScore != null) lines.push(`Recovery score ${t.recoveryScore}/100 (estimate).`);
  if (t.sleepHours != null) lines.push(`Latest sleep ${t.sleepHours}h.`);
  if (t.energy != null) lines.push(`Energy ${t.energy}/5, stress ${t.stress ?? '—'}/5, soreness ${t.soreness ?? '—'}/5.`);
  const trends = [
    trendLine('sleep', ctx.trends.sleepTrend),
    trendLine('energy', ctx.trends.energyTrend),
    trendLine('stress', ctx.trends.stressTrend),
    trendLine('activity', ctx.trends.activityTrend),
  ].filter(Boolean);
  lines.push(trends.length ? `7-day trends (observation only): ${trends.join('; ')}.` : '7-day trends: not enough check-ins yet.');
  if (ctx.recent.activities.length) {
    lines.push(
      `Recent movement: ${ctx.recent.activities
        .slice(0, 4)
        .map((a) => `${a.label} ${a.durationMinutes}m`)
        .join('; ')}.`
    );
  }
  if (ctx.recent.meals.length) {
    lines.push(
      `Recent meals: ${ctx.recent.meals
        .slice(0, 3)
        .map((m) => m.items.map((i) => i.foodName).join('+'))
        .join('; ')}.`
    );
  }
  lines.push(`Suggested next (not a prescription): ${ctx.recommendations.next.join('; ')}.`);
  lines.push('Everyday movement (walking, carrying water, farming, chores) counts. Do not default to gym advice.');
  return lines.join('\n');
}

export function buildDailyBrief(ctx: AstraContext): { focus: string; body: string; tries: string[] } {
  const name = ctx.user.name?.split(' ')[0];
  const hello = name ? `Good to see you, ${name}.` : 'Good to see you.';
  const t = ctx.today;
  const bits: string[] = [hello];
  if (t.sleepHours != null && t.sleepHours < 6) bits.push('Sleep looks shorter than a full night.');
  else if (t.sleepHours == null && t.recoveryScore == null) bits.push('No Uko Sawa check-in yet, so this is based only on what you logged.');
  if (t.recoveryScore != null) bits.push(`Recovery is about ${t.recoveryScore}/100.`);
  if (ctx.trends.energyTrend === 'down' && ctx.trends.sleepTrend === 'down') {
    bits.push('Lower-energy days have often followed shorter sleep recently — that is a pattern, not a diagnosis.');
  }
  bits.push(ctx.recommendations.why);
  return {
    focus: ctx.recommendations.mode.toUpperCase(),
    body: bits.join(' '),
    tries: ctx.recommendations.next,
  };
}

const RED_REPLY =
  "That sounds like it needs a clinician, not a wellness coach. I'm not a doctor and I can't tell you what this is. If symptoms are severe or sudden, contact emergency services (Kenya 999 / 112) or a licensed clinician now.";

const YELLOW_REPLY =
  'That is worth paying attention to. I am not a doctor, so I will not diagnose it. Ease off hard effort today and contact a clinician if it gets worse, spreads, or you feel unsafe.';

/** Deterministic reply when Gemini is down. Uses logged context only. */
export function localAstraReply(ctx: AstraContext, userMessage: string): string {
  const safety = wellnessSafety(userMessage);
  if (safety === 'red') return RED_REPLY;
  if (safety === 'yellow') {
    return `${YELLOW_REPLY} Today's focus is ${ctx.recommendations.mode.toUpperCase()}: ${ctx.recommendations.next[0]}.`;
  }
  const t = ctx.today;
  const ask = userMessage.toLowerCase();
  if (/\b(eat|food|meal|ugali|protein)\b/.test(ask) || ctx.recommendations.mode === 'eat') {
    return `Food Lens shows ${t.meals} meal(s) and about ${t.calories} kcal so far (estimate). ${ctx.recommendations.next[0]}. I can help you think through a plate — I'm not prescribing a diet.`;
  }
  if (/\b(workout|train|exercise|run)\b/.test(ask) || ctx.recommendations.mode === 'move' || ctx.recommendations.mode === 'recover') {
    return `You've logged ${t.activeMinutes} active minutes today${
      t.recoveryScore != null ? ` and recovery is about ${t.recoveryScore}/100` : ''
    }. Today's focus is ${ctx.recommendations.mode}: ${ctx.recommendations.next[0]}. Everyday walking and chores count.`;
  }
  return `Astra is using your on-device logs. Focus ${ctx.recommendations.mode.toUpperCase()}. ${ctx.recommendations.why} Next: ${ctx.recommendations.next[0]}.`;
}
