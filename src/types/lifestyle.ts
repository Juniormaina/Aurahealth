/** Kenya/Africa lifestyle layer — MOVE / EAT / RECOVER */

export type ActivityIntensity = 'light' | 'moderate' | 'vigorous';

export type ShambaActivityType =
  | 'walking_market'
  | 'walking_work'
  | 'walking_town'
  | 'running'
  | 'cycling'
  | 'household_cleaning'
  | 'sweeping'
  | 'mopping'
  | 'carrying_water'
  | 'carrying_groceries'
  | 'stairs'
  | 'gardening'
  | 'farming'
  | 'other_manual';

export interface Activity {
  id: string;
  activityType: ShambaActivityType;
  label: string;
  durationMinutes: number;
  intensity: ActivityIntensity;
  estimatedCalories: number;
  movementPoints: number;
  timestamp: string;
  source: 'manual' | 'motion_hint';
}

export type FoodCategory = 'staple' | 'vegetable' | 'protein' | 'other';

export type PortionSize = 'half' | 'small' | 'medium' | 'full' | 'large';

export interface Food {
  id: string;
  name: string;
  category: FoodCategory;
  /** Base serving description, e.g. "1 cup (200g)" */
  servingSize: string;
  /** Per base serving — estimates only */
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
}

export interface MealItem {
  foodId: string;
  foodName: string;
  portion: PortionSize;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
}

export interface Meal {
  id: string;
  items: MealItem[];
  totals: NutritionSummary;
  timestamp: string;
  note?: string;
  photoDataUrl?: string;
}

export interface NutritionSummary {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
}

export type UkoFeeling = 'great' | 'good' | 'okay' | 'low' | 'stressed' | 'tired';

export interface WellnessCheck {
  id: string;
  feeling: UkoFeeling;
  sleepHours?: number;
  energyLevel?: number; // 1-5
  stressLevel?: number; // 1-5
  soreness?: number; // 1-5
  activityLevel?: number; // 1-5 self-reported
  timestamp: string;
  voiceNoteLocalId?: string;
}

export interface RecoveryScore {
  score: number; // 0-100
  guidance: string;
  inputs: {
    sleep?: number;
    energy?: number;
    stress?: number;
    soreness?: number;
    recentActivityMinutes: number;
    feeling: UkoFeeling;
  };
}

export interface DailySummary {
  date: string; // YYYY-MM-DD local
  activeMinutes: number;
  movementPoints: number;
  estimatedCaloriesBurned: number;
  nutrition: NutritionSummary;
  mealCount: number;
  recovery: RecoveryScore | null;
  hydrationGlasses?: number;
}

export interface LifestyleSnapshot {
  today: DailySummary;
  recentActivities: Activity[];
  recentMeals: Meal[];
  latestCheck: WellnessCheck | null;
}
