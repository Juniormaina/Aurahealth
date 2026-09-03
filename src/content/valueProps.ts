export const VALUE_PROPS = {
  microSessions:
    'Aura Health helps professionals reduce stress in 5 minutes a day with AI-guided micro-sessions in natural language.',
  culturalRelevance:
    'Culturally relevant sessions designed to support sleep and focus. Early self-reported logs suggest many people feel a difference within a week — not a clinical guarantee.',
  realtimeMood:
    'Astra adapts to how you say you feel. Demo check-in samples show anxiety scores trending down over two weeks of daily logs — results are individual, not a medical claim.',
  heroSubtext: 'Start your journey today — free trial available.',
  ctaHeadline: 'Ready to reduce stress and improve focus?',
} as const;

export const SESSION_LANGUAGES = [
  { id: 'en', label: 'English', native: 'English' },
  { id: 'sw', label: 'Swahili', native: 'Kiswahili' },
  { id: 'luo', label: 'Luo', native: 'Dholuo' },
  { id: 'kik', label: 'Kikuyu', native: 'Gĩkũyũ' },
  { id: 'yo', label: 'Yoruba', native: 'Yorùbá' },
  { id: 'ha', label: 'Hausa', native: 'Hausa' },
] as const;

export type SessionLanguageId = (typeof SESSION_LANGUAGES)[number]['id'];

export function isSessionLanguageId(value: unknown): value is SessionLanguageId {
  return typeof value === 'string' && SESSION_LANGUAGES.some((lang) => lang.id === value);
}

/** Map a Settings language id (or free-form label) to the native session language name. */
export function resolveSessionLanguage(value: unknown): (typeof SESSION_LANGUAGES)[number] {
  if (isSessionLanguageId(value)) {
    return SESSION_LANGUAGES.find((lang) => lang.id === value) ?? SESSION_LANGUAGES[0];
  }
  if (typeof value === 'string') {
    const needle = value.trim().toLowerCase();
    const match = SESSION_LANGUAGES.find(
      (lang) => lang.native.toLowerCase() === needle || lang.label.toLowerCase() === needle
    );
    if (match) return match;
  }
  return SESSION_LANGUAGES[0];
}

export const SUBSCRIPTION_TIERS = [
  {
    id: 'monthly' as const,
    name: 'Premium Monthly',
    priceUsd: 6.99,
    cadence: 'month',
    highlight: '7-day free trial, then auto-renews',
  },
  {
    id: 'annual' as const,
    name: 'Premium Annual',
    priceUsd: 59.99,
    cadence: 'year',
    highlight: 'Save ~28% vs monthly',
  },
  {
    id: 'lifetime' as const,
    name: 'Lifetime',
    priceUsd: 149,
    cadence: 'once',
    highlight: 'One-time purchase, no renewal',
  },
];

export const CORPORATE_PACKAGES = [
  { id: 'team', name: 'Team Wellness', seats: 25, priceUsd: 199, cadence: 'month' },
  { id: 'org', name: 'Organization', seats: 100, priceUsd: 649, cadence: 'month' },
  { id: 'enterprise', name: 'Enterprise Africa', seats: 500, priceUsd: 2400, cadence: 'month' },
] as const;

export function moodAdaptiveSession(
  mood: string,
  languageId: SessionLanguageId = 'en'
): { title: string; minutes: number; language: string; script: string } {
  const lang = SESSION_LANGUAGES.find((l) => l.id === languageId) ?? SESSION_LANGUAGES[0];
  const scripts: Record<string, { title: string; script: string }> = {
    sleepy: {
      title: 'Sunset rest reset',
      script: `A 5-minute wind-down in ${lang.native}: slow breath, gratitude for the day, and a short body scan for sleep.`,
    },
    focused: {
      title: 'Market-day focus',
      script: `A 5-minute attention drill in ${lang.native}: one breath, one task, one intention — built for busy professionals.`,
    },
    energetic: {
      title: 'Sunrise energy',
      script: `A 5-minute activation in ${lang.native}: posture, breath, and a short affirmation before the workday.`,
    },
    eager: {
      title: 'Community lift',
      script: `A 5-minute encouragement in ${lang.native}: name one person you care for, then one next healthy step.`,
    },
    joyful: {
      title: 'Ubuntu pause',
      script: `A 5-minute joy practice in ${lang.native}: smile, breath, and a culturally grounded gratitude prompt.`,
    },
  };
  const pick = scripts[mood] ?? scripts.joyful;
  return { ...pick, minutes: 5, language: lang.native };
}
