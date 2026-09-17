import type { HealthBriefItem } from '../services/healthBrief';

/** Backend-managed curated tips — no third-party API keys required */
export const HEALTH_BRIEF_ITEMS: HealthBriefItem[] = [
  {
    id: 'hydrate-hot',
    title: 'Hydration on warm days',
    body: 'Sip water steadily through the day — especially after walking, market runs, or shamba work. Aim for regular glasses rather than large gulps once.',
    category: 'hydration',
  },
  {
    id: 'sukuma-plate',
    title: 'Balance your plate',
    body: 'Pair staples like ugali or rice with sukuma wiki or managu and a protein. Estimated nutrition in Food Lens is for guidance, not medical advice.',
    category: 'nutrition',
  },
  {
    id: 'stairs-count',
    title: 'Everyday movement counts',
    body: 'Stairs, carrying water, and walking to work all add Movement Points in Shamba Fit. You do not need a gym for an active day.',
    category: 'fitness',
  },
  {
    id: 'uko-sawa',
    title: 'Uko sawa? Check in once',
    body: 'A quick Uko Sawa? check helps Astra suggest lighter mobility when sleep or energy is low — without diagnosing illness.',
    category: 'recovery',
  },
  {
    id: 'local-care',
    title: 'Know your local care options',
    body: 'For medical concerns, visit a licensed clinician or facility. Aura is a wellness companion, not a substitute for professional care.',
    category: 'local',
  },
];
