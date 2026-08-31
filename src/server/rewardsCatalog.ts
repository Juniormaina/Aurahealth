/** Server-defined Cowries / XP / streak payouts. Clients may display these
 *  numbers; they must not be accepted as write input for the user ledger. */

export const CHECKIN_REWARDS = {
  cowries: 80,
  cowriesWithMedication: 120,
  xpBase: 150,
  xpPerActivityMinute: 1.5,
  maxActivityMinutesForXp: 180,
} as const;

export const MISSION_REWARDS: Record<string, { xp: number; cowries: number }> = {
  m1: { xp: 50, cowries: 30 },
  m2: { xp: 50, cowries: 30 },
  m3: { xp: 120, cowries: 80 },
  m4: { xp: 50, cowries: 30 },
  grand_onboarding_completion: { xp: 150, cowries: 100 },
};

export const HABIT_REWARDS: Record<string, { xp: number; cowries: number }> = {
  water: { xp: 50, cowries: 30 },
  meds: { xp: 80, cowries: 50 },
  sleep: { xp: 60, cowries: 40 },
  movement: { xp: 70, cowries: 45 },
};

export const BENEFIT_COSTS: Record<string, { cowriesCost: number; title: string }> = {
  'b-1': { cowriesCost: 250, title: '$2.50 Clinic Medication Voucher' },
  'b-2': { cowriesCost: 250, title: '1.25 GB Mobile Health Data Top-Up' },
  'b-3': { cowriesCost: 200, title: 'Clean Water Care Grant Token' },
  'b-4': { cowriesCost: 150, title: '7-Day Streak Insurance Shield' },
  'b-5': { cowriesCost: 400, title: '$10 Partner Gym Pass' },
};

export function checkinPayout(medicationTaken: boolean, activityMinutes: number) {
  const mins = Math.max(
    0,
    Math.min(CHECKIN_REWARDS.maxActivityMinutesForXp, Math.floor(Number(activityMinutes) || 0))
  );
  return {
    cowries: medicationTaken
      ? CHECKIN_REWARDS.cowriesWithMedication
      : CHECKIN_REWARDS.cowries,
    xp: CHECKIN_REWARDS.xpBase + Math.floor(mins * CHECKIN_REWARDS.xpPerActivityMinute),
  };
}

export function utcToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export function utcDayDiff(fromYmd: string, toYmd: string): number {
  const from = Date.parse(`${fromYmd}T00:00:00.000Z`);
  const to = Date.parse(`${toYmd}T00:00:00.000Z`);
  if (!Number.isFinite(from) || !Number.isFinite(to)) return Number.POSITIVE_INFINITY;
  return Math.round((to - from) / 86400000);
}

export type LedgerSnapshot = {
  cowriesBalance: number;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  lastCheckInDate: string | null;
  completedRewardKeys: string[];
};

export function nextStreak(lastCheckInDate: string | null | undefined, today: string, currentStreak: number) {
  if (!lastCheckInDate) return 1;
  const diff = utcDayDiff(lastCheckInDate, today);
  if (diff <= 0) return Math.max(1, currentStreak);
  if (diff === 1) return currentStreak + 1;
  return 1;
}
