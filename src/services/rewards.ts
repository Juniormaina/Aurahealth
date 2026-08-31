import { authorizedFetch } from './commerce';
import type { LedgerSnapshot } from '../server/rewardsCatalog';

export type { LedgerSnapshot };

export class RewardsApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
  }
}

async function parse<T>(res: Response): Promise<T> {
  const body = (await res.json().catch(() => ({}))) as {
    error?: string;
    code?: string;
  };
  if (!res.ok) {
    throw new RewardsApiError(res.status, body.code || 'error', body.error || 'Rewards request failed');
  }
  return body as T;
}

export async function persistCheckinRewards(input: {
  medicationTaken: boolean;
  activityMinutes: number;
}) {
  return parse<LedgerSnapshot & { cowriesEarned: number; xpEarned: number; awarded: boolean }>(
    await authorizedFetch('/api/rewards/checkin', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  );
}

export async function persistGrant(kind: 'mission' | 'habit', id: string) {
  return parse<LedgerSnapshot & { cowriesEarned: number; xpEarned: number }>(
    await authorizedFetch('/api/rewards/grant', {
      method: 'POST',
      body: JSON.stringify({ kind, id }),
    })
  );
}

export async function persistSpend(benefitId: string) {
  return parse<LedgerSnapshot & { cowriesSpent: number; title: string }>(
    await authorizedFetch('/api/rewards/spend', {
      method: 'POST',
      body: JSON.stringify({ benefitId }),
    })
  );
}
