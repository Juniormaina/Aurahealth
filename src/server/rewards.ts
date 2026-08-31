import { FieldValue, type DocumentData } from 'firebase-admin/firestore';
import { getAdminDb } from './firebaseAdmin';
import {
  BENEFIT_COSTS,
  HABIT_REWARDS,
  MISSION_REWARDS,
  checkinPayout,
  nextStreak,
  utcToday,
  type LedgerSnapshot,
} from './rewardsCatalog';

export type { LedgerSnapshot };

export class RewardsError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
  }
}

type UserLedger = {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  cowriesBalance: number;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  lastCheckInDate: string | null;
  completedRewardKeys: string[];
  habitClaims: Record<string, string>;
};

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asStringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

function asStringMap(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (typeof v === 'string') out[k] = v;
  }
  return out;
}

function snapshot(row: UserLedger): LedgerSnapshot {
  return {
    cowriesBalance: row.cowriesBalance,
    totalXp: row.totalXp,
    currentStreak: row.currentStreak,
    longestStreak: row.longestStreak,
    lastCheckInDate: row.lastCheckInDate,
    completedRewardKeys: row.completedRewardKeys,
  };
}

function readLedger(uid: string, email: string | undefined, data: DocumentData | undefined): UserLedger {
  return {
    uid,
    email: typeof data?.email === 'string' ? data.email : email || '',
    displayName: typeof data?.displayName === 'string' ? data.displayName : '',
    photoURL: typeof data?.photoURL === 'string' ? data.photoURL : '',
    cowriesBalance: asNumber(data?.cowriesBalance),
    totalXp: asNumber(data?.totalXp),
    currentStreak: asNumber(data?.currentStreak),
    longestStreak: asNumber(data?.longestStreak),
    lastCheckInDate: typeof data?.lastCheckInDate === 'string' ? data.lastCheckInDate : null,
    completedRewardKeys: asStringList(data?.completedRewardKeys),
    habitClaims: asStringMap(data?.habitClaims),
  };
}

async function withUserLedger<T>(
  uid: string,
  email: string | undefined,
  mutate: (row: UserLedger) => T
): Promise<T> {
  const db = getAdminDb();
  if (!db) {
    throw new RewardsError(503, 'ledger_unavailable', 'Rewards ledger is not configured');
  }
  const ref = db.collection('users').doc(uid);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const row = readLedger(uid, email, snap.exists ? snap.data() : undefined);
    const result = mutate(row);
    tx.set(
      ref,
      {
        uid: row.uid,
        email: row.email || email || '',
        cowriesBalance: row.cowriesBalance,
        totalXp: row.totalXp,
        currentStreak: row.currentStreak,
        longestStreak: row.longestStreak,
        lastCheckInDate: row.lastCheckInDate,
        completedRewardKeys: row.completedRewardKeys,
        habitClaims: row.habitClaims,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return result;
  });
}

export async function applyCheckinRewards(
  uid: string,
  email: string | undefined,
  input: { medicationTaken: boolean; activityMinutes: number }
) {
  const today = utcToday();
  const payout = checkinPayout(input.medicationTaken === true, input.activityMinutes);
  return withUserLedger(uid, email, (row) => {
    const alreadyToday = row.lastCheckInDate === today;
    const cowriesEarned = alreadyToday ? 0 : payout.cowries;
    const xpEarned = alreadyToday ? 0 : payout.xp;
    row.cowriesBalance += cowriesEarned;
    row.totalXp += xpEarned;
    row.currentStreak = nextStreak(row.lastCheckInDate, today, row.currentStreak);
    row.longestStreak = Math.max(row.longestStreak, row.currentStreak);
    row.lastCheckInDate = today;
    return {
      ...snapshot(row),
      cowriesEarned,
      xpEarned,
      awarded: !alreadyToday,
    };
  });
}

export async function applyGrant(
  uid: string,
  email: string | undefined,
  kind: 'mission' | 'habit',
  id: string
) {
  const catalog = kind === 'mission' ? MISSION_REWARDS : HABIT_REWARDS;
  const reward = catalog[id];
  if (!reward) {
    throw new RewardsError(400, 'unknown_reward', 'Unknown reward');
  }
  const today = utcToday();
  return withUserLedger(uid, email, (row) => {
    if (kind === 'habit') {
      if (row.habitClaims[id] === today) {
        throw new RewardsError(409, 'already_claimed', 'Already claimed today');
      }
      row.habitClaims[id] = today;
    } else {
      const key = `mission:${id}`;
      if (row.completedRewardKeys.includes(key)) {
        throw new RewardsError(409, 'already_claimed', 'Already claimed');
      }
      if (row.completedRewardKeys.length >= 4000) {
        throw new RewardsError(429, 'ledger_full', 'Reward history is full');
      }
      row.completedRewardKeys.push(key);
    }
    row.cowriesBalance += reward.cowries;
    row.totalXp += reward.xp;
    return {
      ...snapshot(row),
      cowriesEarned: reward.cowries,
      xpEarned: reward.xp,
    };
  });
}

export async function applySpend(uid: string, email: string | undefined, benefitId: string) {
  const benefit = BENEFIT_COSTS[benefitId];
  if (!benefit) {
    throw new RewardsError(400, 'unknown_benefit', 'Unknown benefit');
  }
  return withUserLedger(uid, email, (row) => {
    const key = `benefit:${benefitId}`;
    if (row.completedRewardKeys.includes(key)) {
      throw new RewardsError(409, 'already_claimed', 'Already redeemed');
    }
    if (row.cowriesBalance < benefit.cowriesCost) {
      throw new RewardsError(400, 'insufficient_cowries', 'Insufficient Cowries');
    }
    if (row.completedRewardKeys.length >= 4000) {
      throw new RewardsError(429, 'ledger_full', 'Reward history is full');
    }
    row.cowriesBalance -= benefit.cowriesCost;
    row.completedRewardKeys.push(key);
    return {
      ...snapshot(row),
      cowriesSpent: benefit.cowriesCost,
      title: benefit.title,
    };
  });
}
