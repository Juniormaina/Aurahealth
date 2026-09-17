import type { ActivityIntensity, ShambaActivityType } from '../types/lifestyle';

export interface ShambaActivityDef {
  type: ShambaActivityType;
  label: string;
  category: 'walk' | 'chores' | 'carry' | 'farm' | 'cardio' | 'other';
  /** MET-like multiplier baseline for calorie estimate (× kg × hours). Default body mass 70kg. */
  met: number;
  /** Movement points per minute at moderate intensity */
  pointsPerMinute: number;
  defaultIntensity: ActivityIntensity;
}

/** Everyday Kenyan / East African movement — expandable catalog */
export const SHAMBA_ACTIVITIES: ShambaActivityDef[] = [
  { type: 'walking_market', label: 'Walking to the market', category: 'walk', met: 3.5, pointsPerMinute: 1.1, defaultIntensity: 'moderate' },
  { type: 'walking_work', label: 'Walking to work', category: 'walk', met: 3.3, pointsPerMinute: 1.0, defaultIntensity: 'moderate' },
  { type: 'walking_town', label: 'Walking around town', category: 'walk', met: 3.5, pointsPerMinute: 1.1, defaultIntensity: 'moderate' },
  { type: 'running', label: 'Running', category: 'cardio', met: 8.0, pointsPerMinute: 2.2, defaultIntensity: 'vigorous' },
  { type: 'cycling', label: 'Cycling', category: 'cardio', met: 6.8, pointsPerMinute: 1.8, defaultIntensity: 'moderate' },
  { type: 'household_cleaning', label: 'Household cleaning', category: 'chores', met: 3.5, pointsPerMinute: 1.0, defaultIntensity: 'moderate' },
  { type: 'sweeping', label: 'Sweeping', category: 'chores', met: 3.3, pointsPerMinute: 0.9, defaultIntensity: 'light' },
  { type: 'mopping', label: 'Mopping', category: 'chores', met: 3.5, pointsPerMinute: 1.0, defaultIntensity: 'moderate' },
  { type: 'carrying_water', label: 'Carrying water', category: 'carry', met: 5.0, pointsPerMinute: 1.5, defaultIntensity: 'moderate' },
  { type: 'carrying_groceries', label: 'Carrying groceries', category: 'carry', met: 4.0, pointsPerMinute: 1.2, defaultIntensity: 'moderate' },
  { type: 'stairs', label: 'Climbing stairs', category: 'cardio', met: 8.0, pointsPerMinute: 2.0, defaultIntensity: 'vigorous' },
  { type: 'gardening', label: 'Gardening', category: 'farm', met: 4.0, pointsPerMinute: 1.2, defaultIntensity: 'moderate' },
  { type: 'farming', label: 'Farming / shamba work', category: 'farm', met: 5.5, pointsPerMinute: 1.6, defaultIntensity: 'vigorous' },
  { type: 'other_manual', label: 'Other manual activity', category: 'other', met: 4.0, pointsPerMinute: 1.1, defaultIntensity: 'moderate' },
];

export function getShambaActivity(type: ShambaActivityType): ShambaActivityDef {
  return SHAMBA_ACTIVITIES.find((a) => a.type === type) ?? SHAMBA_ACTIVITIES[SHAMBA_ACTIVITIES.length - 1];
}
