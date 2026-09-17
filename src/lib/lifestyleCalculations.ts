import type {
  Activity,
  ActivityIntensity,
  Meal,
  MealItem,
  NutritionSummary,
  PortionSize,
  RecoveryScore,
  ShambaActivityType,
  UkoFeeling,
  WellnessCheck,
} from '../types/lifestyle';
import { getShambaActivity } from '../content/shambaActivities';
import { getFoodById } from '../content/kenyanFoods';

const DEFAULT_BODY_KG = 70;

const INTENSITY_MULT: Record<ActivityIntensity, number> = {
  light: 0.75,
  moderate: 1,
  vigorous: 1.35,
};

const PORTION_MULT: Record<PortionSize, number> = {
  half: 0.5,
  small: 0.75,
  medium: 1,
  full: 1,
  large: 1.5,
};

export function calculateCalories(
  activityType: ShambaActivityType,
  durationMinutes: number,
  intensity: ActivityIntensity,
  bodyKg = DEFAULT_BODY_KG
): number {
  const def = getShambaActivity(activityType);
  const hours = Math.max(0, durationMinutes) / 60;
  const met = def.met * INTENSITY_MULT[intensity];
  return Math.round(met * bodyKg * hours);
}

export function calculateMovementPoints(
  activityType: ShambaActivityType,
  durationMinutes: number,
  intensity: ActivityIntensity
): number {
  const def = getShambaActivity(activityType);
  const pts = def.pointsPerMinute * Math.max(0, durationMinutes) * INTENSITY_MULT[intensity];
  return Math.round(pts);
}

export function buildActivity(input: {
  activityType: ShambaActivityType;
  durationMinutes: number;
  intensity: ActivityIntensity;
  source?: Activity['source'];
  id?: string;
  timestamp?: string;
}): Activity {
  const def = getShambaActivity(input.activityType);
  const estimatedCalories = calculateCalories(input.activityType, input.durationMinutes, input.intensity);
  const movementPoints = calculateMovementPoints(input.activityType, input.durationMinutes, input.intensity);
  return {
    id: input.id ?? `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    activityType: input.activityType,
    label: def.label,
    durationMinutes: Math.max(1, Math.round(input.durationMinutes)),
    intensity: input.intensity,
    estimatedCalories,
    movementPoints,
    timestamp: input.timestamp ?? new Date().toISOString(),
    source: input.source ?? 'manual',
  };
}

export function calculateNutrition(items: { foodId: string; portion: PortionSize }[]): NutritionSummary {
  const empty: NutritionSummary = { calories: 0, protein: 0, carbohydrates: 0, fat: 0 };
  return items.reduce((acc, item) => {
    const food = getFoodById(item.foodId);
    if (!food) return acc;
    const m = PORTION_MULT[item.portion];
    return {
      calories: Math.round(acc.calories + food.calories * m),
      protein: Math.round((acc.protein + food.protein * m) * 10) / 10,
      carbohydrates: Math.round((acc.carbohydrates + food.carbohydrates * m) * 10) / 10,
      fat: Math.round((acc.fat + food.fat * m) * 10) / 10,
    };
  }, empty);
}

export function buildMealItem(foodId: string, portion: PortionSize): MealItem | null {
  const food = getFoodById(foodId);
  if (!food) return null;
  const m = PORTION_MULT[portion];
  return {
    foodId: food.id,
    foodName: food.name,
    portion,
    calories: Math.round(food.calories * m),
    protein: Math.round(food.protein * m * 10) / 10,
    carbohydrates: Math.round(food.carbohydrates * m * 10) / 10,
    fat: Math.round(food.fat * m * 10) / 10,
  };
}

export function buildMeal(items: MealItem[], note?: string, photoDataUrl?: string): Meal {
  const totals = items.reduce<NutritionSummary>(
    (acc, i) => ({
      calories: acc.calories + i.calories,
      protein: Math.round((acc.protein + i.protein) * 10) / 10,
      carbohydrates: Math.round((acc.carbohydrates + i.carbohydrates) * 10) / 10,
      fat: Math.round((acc.fat + i.fat) * 10) / 10,
    }),
    { calories: 0, protein: 0, carbohydrates: 0, fat: 0 }
  );
  return {
    id: `meal_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    items,
    totals,
    timestamp: new Date().toISOString(),
    note,
    photoDataUrl,
  };
}

const FEELING_BASE: Record<UkoFeeling, number> = {
  great: 88,
  good: 78,
  okay: 65,
  low: 48,
  stressed: 42,
  tired: 50,
};

export function calculateRecoveryScore(
  check: Pick<WellnessCheck, 'feeling' | 'sleepHours' | 'energyLevel' | 'stressLevel' | 'soreness' | 'activityLevel'>,
  recentActivityMinutes: number
): RecoveryScore {
  let score = FEELING_BASE[check.feeling];

  if (check.sleepHours != null) {
    if (check.sleepHours >= 7 && check.sleepHours <= 9) score += 8;
    else if (check.sleepHours >= 6) score += 3;
    else score -= 10;
  }
  if (check.energyLevel != null) score += (check.energyLevel - 3) * 4;
  if (check.stressLevel != null) score -= (check.stressLevel - 3) * 5;
  if (check.soreness != null) score -= (check.soreness - 2) * 4;
  if (check.activityLevel != null) score += (check.activityLevel - 3) * 2;

  // High recent movement without recovery → nudge down; light day → slight up
  if (recentActivityMinutes >= 90) score -= 6;
  else if (recentActivityMinutes >= 45) score -= 2;
  else if (recentActivityMinutes < 15) score += 2;

  score = Math.min(100, Math.max(0, Math.round(score)));

  return {
    score,
    guidance: generateWellnessRecommendation(score, check, recentActivityMinutes),
    inputs: {
      sleep: check.sleepHours,
      energy: check.energyLevel,
      stress: check.stressLevel,
      soreness: check.soreness,
      recentActivityMinutes,
      feeling: check.feeling,
    },
  };
}

export function generateWellnessRecommendation(
  score: number,
  check: Pick<WellnessCheck, 'feeling' | 'sleepHours' | 'energyLevel' | 'stressLevel'>,
  recentActivityMinutes: number
): string {
  if (score >= 75) {
    return 'Your recovery looks good. A normal workout or Train session may be appropriate today.';
  }
  if (recentActivityMinutes >= 60) {
    return "You've had a highly active day. Consider recovery, hydration, and stretching.";
  }
  if (
    (check.sleepHours != null && check.sleepHours < 6) ||
    (check.energyLevel != null && check.energyLevel <= 2) ||
    check.feeling === 'tired' ||
    check.feeling === 'low'
  ) {
    return 'Your sleep and energy are low today. Consider a lighter 15-minute mobility session.';
  }
  if (check.feeling === 'stressed' || (check.stressLevel != null && check.stressLevel >= 4)) {
    return 'Stress looks elevated. A short breath or yoga flow may help more than another intense workout.';
  }
  return 'Recovery is moderate. Keep moving gently, stay hydrated, and check in with Astra if you want a plan.';
}

export function localDateKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function isSameLocalDay(iso: string, day = localDateKey()): boolean {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  return localDateKey(d) === day;
}

export const PORTION_LABELS: Record<PortionSize, string> = {
  half: 'Half serving',
  small: 'Small',
  medium: 'Medium',
  full: 'Full serving',
  large: 'Large',
};

export const FEELING_OPTIONS: { id: UkoFeeling; label: string; emoji: string }[] = [
  { id: 'great', label: 'Great', emoji: '😊' },
  { id: 'good', label: 'Good', emoji: '🙂' },
  { id: 'okay', label: 'Okay', emoji: '😐' },
  { id: 'low', label: 'Low', emoji: '😔' },
  { id: 'stressed', label: 'Stressed', emoji: '😣' },
  { id: 'tired', label: 'Tired', emoji: '😴' },
];
