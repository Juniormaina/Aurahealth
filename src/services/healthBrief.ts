export type HealthBriefItem = {
  id: string;
  title: string;
  body: string;
  category: 'hydration' | 'fitness' | 'nutrition' | 'recovery' | 'local';
};

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
