import type { HealthBriefItem } from '../content/healthBriefContent';

export type { HealthBriefItem };

export async function fetchHealthBrief(): Promise<HealthBriefItem[]> {
  try {
    const res = await fetch('/api/health-brief', { credentials: 'include' });
    if (!res.ok) return [];
    const data = (await res.json()) as { items?: HealthBriefItem[] };
    return Array.isArray(data.items) ? data.items : [];
  } catch {
    return [];
  }
}
