import type { SessionLanguageId } from './valueProps.ts';
import { resolveSessionLanguage } from './valueProps.ts';

const PROMPT_CHIPS: Record<SessionLanguageId, string[]> = {
  en: ['I have a headache after poor sleep', 'How much water should I drink today?', 'Start a 5-minute stress reset'],
  sw: [
    'Ninaumwa na kichwa baada ya kulala vibaya',
    'Ninafaa kunywa maji kiasi gani leo?',
    'Anza zoezi la dakika 5 la kupunguza msongo',
  ],
  luo: ['I have a headache after poor sleep', 'How much water should I drink today?', 'Start a 5-minute stress reset'],
  kik: ['I have a headache after poor sleep', 'How much water should I drink today?', 'Start a 5-minute stress reset'],
  yo: ['I have a headache after poor sleep', 'How much water should I drink today?', 'Start a 5-minute stress reset'],
  ha: ['I have a headache after poor sleep', 'How much water should I drink today?', 'Start a 5-minute stress reset'],
};

const GREETING: Record<SessionLanguageId, string> = {
  en: "Hi, I'm Astra — your AI health companion for medical and wellness questions only (not a doctor). Ask about sleep, stress, nutrition, movement, recovery, or symptoms to take to a clinician.",
  sw: 'Habari, mimi ni Astra — mwandamani wako wa AI wa afya tu (si daktari). Uliza kuhusu usingizi, msongo, lishe, mwendo, au dalili za kumwona daktari.',
  luo: "Mosi, an Astra — ja-kony AI mar ngima kende (ok a daktar). Penja kuom nindo, chuny lit, chiemo, kata ranyisi ma dwaro daktari.",
  kik: 'Wĩ mwega, niĩ Astra — mũthĩĩna waku wa AI wa ũgima tu (ti daktari). Ũria ũhoro wa kũrara, thĩĩna, irio, kana ũrĩa ũkwenda daktari.',
  yo: 'Ẹ n lẹ, èmi ni Astra — ẹlẹgbẹ́ AI ìlera nìkan (kìí ṣe dókítà). Béèrè nípa oorun, ìdààmú, oúnjẹ, tàbí ààmì àìsàn fún dókítà.',
  ha: "Sannu, ni Astra — abokiyar AI ta lafiya kawai (ba likita ba). Tambayi game da barci, damuwa, abinci, ko alamun cuta ga likita.",
};

const ANXIETY_NOTE: Record<SessionLanguageId, (n: number) => string> = {
  en: (n) => ` Last anxiety check-in: ${n}/10.`,
  sw: (n) => ` Cheki-in yako ya mwisho ya wasiwasi: ${n}/10.`,
  luo: (n) => ` Check-in marichien mar parruok: ${n}/10.`,
  kik: (n) => ` Check-in yaku ya mwisho ya wĩtĩkio: ${n}/10.`,
  yo: (n) => ` Ìṣàyẹ̀wò àníyàn tó kẹ́yìn: ${n}/10.`,
  ha: (n) => ` Duban damuwa na ƙarshe: ${n}/10.`,
};

export function coachPromptChips(language?: SessionLanguageId | string): string[] {
  return PROMPT_CHIPS[resolveSessionLanguage(language).id];
}

export function coachGreeting(
  language?: SessionLanguageId | string,
  latestAnxiety?: number | null
): string {
  const lang = resolveSessionLanguage(language);
  const n =
    typeof latestAnxiety === 'number' && Number.isFinite(latestAnxiety)
      ? Math.min(10, Math.max(1, Math.round(latestAnxiety)))
      : null;
  const extra = n == null ? '' : ANXIETY_NOTE[lang.id](n);
  return `${GREETING[lang.id]}${extra}`;
}
