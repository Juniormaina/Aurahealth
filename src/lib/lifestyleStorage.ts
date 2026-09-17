import type { Activity, DailySummary, Meal, WellnessCheck, RecoveryScore, LifestyleSnapshot } from '../types/lifestyle';
import {
  calculateRecoveryScore,
  isSameLocalDay,
  localDateKey,
} from './lifestyleCalculations';

const PREFIX = 'aura-lifestyle-v1';

function key(userKey: string, kind: string) {
  return `${PREFIX}:${userKey}:${kind}`;
}

function readJson<T>(storageKey: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(storageKey: string, value: unknown) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(value));
  } catch (err) {
    console.warn('Lifestyle storage write failed:', err instanceof Error ? err.message : 'unknown');
  }
}

export function loadActivities(userKey: string): Activity[] {
  return readJson(key(userKey, 'activities'), []);
}

export function saveActivities(userKey: string, activities: Activity[]) {
  writeJson(key(userKey, 'activities'), activities.slice(0, 200));
}

export function addActivity(userKey: string, activity: Activity): Activity[] {
  const next = [activity, ...loadActivities(userKey)].slice(0, 200);
  saveActivities(userKey, next);
  return next;
}

export function loadMeals(userKey: string): Meal[] {
  return readJson(key(userKey, 'meals'), []);
}

export function saveMeals(userKey: string, meals: Meal[]) {
  writeJson(key(userKey, 'meals'), meals.slice(0, 100));
}

export function addMeal(userKey: string, meal: Meal): Meal[] {
  const next = [meal, ...loadMeals(userKey)].slice(0, 100);
  saveMeals(userKey, next);
  return next;
}

export function loadWellnessChecks(userKey: string): WellnessCheck[] {
  return readJson(key(userKey, 'uko'), []);
}

export function saveWellnessChecks(userKey: string, checks: WellnessCheck[]) {
  writeJson(key(userKey, 'uko'), checks.slice(0, 90));
}

export function addWellnessCheck(userKey: string, check: WellnessCheck): WellnessCheck[] {
  const next = [check, ...loadWellnessChecks(userKey)].slice(0, 90);
  saveWellnessChecks(userKey, next);
  return next;
}

export function loadHydrationGlasses(userKey: string, day = localDateKey()): number {
  const map = readJson<Record<string, number>>(key(userKey, 'hydration'), {});
  return map[day] ?? 0;
}

export function setHydrationGlasses(userKey: string, glasses: number, day = localDateKey()) {
  const map = readJson<Record<string, number>>(key(userKey, 'hydration'), {});
  map[day] = Math.max(0, Math.min(20, glasses));
  writeJson(key(userKey, 'hydration'), map);
}

export function buildDailySummary(userKey: string, day = localDateKey()): DailySummary {
  const activities = loadActivities(userKey).filter((a) => isSameLocalDay(a.timestamp, day));
  const meals = loadMeals(userKey).filter((m) => isSameLocalDay(m.timestamp, day));
  const checks = loadWellnessChecks(userKey).filter((c) => isSameLocalDay(c.timestamp, day));
  const latestCheck = checks[0] ?? null;
  const activeMinutes = activities.reduce((s, a) => s + a.durationMinutes, 0);
  const movementPoints = activities.reduce((s, a) => s + a.movementPoints, 0);
  const estimatedCaloriesBurned = activities.reduce((s, a) => s + a.estimatedCalories, 0);
  const nutrition = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.totals.calories,
      protein: Math.round((acc.protein + m.totals.protein) * 10) / 10,
      carbohydrates: Math.round((acc.carbohydrates + m.totals.carbohydrates) * 10) / 10,
      fat: Math.round((acc.fat + m.totals.fat) * 10) / 10,
    }),
    { calories: 0, protein: 0, carbohydrates: 0, fat: 0 }
  );

  let recovery: RecoveryScore | null = null;
  if (latestCheck) {
    recovery = calculateRecoveryScore(latestCheck, activeMinutes);
  }

  return {
    date: day,
    activeMinutes,
    movementPoints,
    estimatedCaloriesBurned,
    nutrition,
    mealCount: meals.length,
    recovery,
    hydrationGlasses: loadHydrationGlasses(userKey, day),
  };
}

export function getLifestyleSnapshot(userKey: string): LifestyleSnapshot {
  const today = buildDailySummary(userKey);
  const activities = loadActivities(userKey);
  const meals = loadMeals(userKey);
  const checks = loadWellnessChecks(userKey);
  return {
    today,
    recentActivities: activities.slice(0, 20),
    recentMeals: meals.slice(0, 10),
    latestCheck: checks[0] ?? null,
  };
}

/** Compact text block for Astra system prompt / request body */
export function formatLifestyleContextForAstra(userKey: string): string {
  const snap = getLifestyleSnapshot(userKey);
  const t = snap.today;
  const lines: string[] = [
    `Today (${t.date}) lifestyle — estimates only, not medical:`,
    `- Shamba Fit: ${t.activeMinutes} min active, ${t.movementPoints} Movement Points, ~${t.estimatedCaloriesBurned} kcal burned (estimate)`,
  ];
  if (snap.recentActivities.length) {
    const todayActs = snap.recentActivities.filter((a) => isSameLocalDay(a.timestamp, t.date)).slice(0, 5);
    if (todayActs.length) {
      lines.push(`- Activities: ${todayActs.map((a) => `${a.label} ${a.durationMinutes}m`).join('; ')}`);
    }
  }
  if (t.mealCount || snap.recentMeals.length) {
    const todayMeals = snap.recentMeals.filter((m) => isSameLocalDay(m.timestamp, t.date)).slice(0, 3);
    if (todayMeals.length) {
      lines.push(
        `- Meals: ${todayMeals.map((m) => m.items.map((i) => i.foodName).join('+')).join('; ')}`
      );
    }
  }
  lines.push(
    `- Kenyan Food Lens: ${t.mealCount} meal(s), ~${t.nutrition.calories} kcal / P ${t.nutrition.protein}g / C ${t.nutrition.carbohydrates}g / F ${t.nutrition.fat}g (estimated)`
  );
  if (t.recovery) {
    lines.push(`- Uko Sawa recovery: ${t.recovery.score}/100 — ${t.recovery.guidance}`);
  } else {
    lines.push('- Uko Sawa: no check-in yet today');
  }
  if (t.hydrationGlasses != null) {
    lines.push(`- Hydration log: ${t.hydrationGlasses}/8 glasses (local)`);
  }
  return lines.join('\n');
}
