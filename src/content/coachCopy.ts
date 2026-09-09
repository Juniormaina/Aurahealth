import { resolveSessionLanguage, SessionLanguageId } from './valueProps';

const PROMPT_CHIPS: Record<SessionLanguageId, string[]> = {
  en: ['Start a 5-minute stress reset', 'Adapt a session to my mood', 'How do I boost my streak?'],
  sw: [
    'Anza zoezi la dakika 5 la kupunguza msongo',
    'Badilisha zoezi kulingana na hisia zangu',
    'Ninawezaje kuongeza mfululizo wangu?',
  ],
  luo: ['Start a 5-minute stress reset', 'Adapt a session to my mood', 'How do I boost my streak?'],
  kik: ['Start a 5-minute stress reset', 'Adapt a session to my mood', 'How do I boost my streak?'],
  yo: ['Start a 5-minute stress reset', 'Adapt a session to my mood', 'How do I boost my streak?'],
  ha: ['Start a 5-minute stress reset', 'Adapt a session to my mood', 'How do I boost my streak?'],
};

const GREETING: Record<SessionLanguageId, string> = {
  en: "Hi, I'm Astra — your AI wellness companion, not a doctor. Tell me how you feel, or tap a prompt for a 5-minute reset.",
  sw: 'Habari, mimi ni Astra — mwandamani wako wa AI, si daktari. Niambie unavyohisi, au bonyeza prompt kuanza zoezi la dakika tano.',
  luo: "Mosi, an Astra — ja-kony AI, ok a daktar. Nyisa kaka ineno, kata yier prompt mondo wachak yweyo mar dakika 5.",
  kik: 'Wĩ mwega, niĩ Astra — mũthĩĩna waku wa AI, ti daktari. Njĩra ũrĩa ũiguaga, kana hũthĩra prompt kĩambĩrĩria gĩa ndagika 5.',
  yo: 'Ẹ n lẹ, èmi ni Astra — ẹlẹgbẹ́ AI rẹ, kìí ṣe dókítà. Sọ bí o ṣe rí, tàbí tẹ prompt láti bẹ̀rẹ̀ ìdánwò ìṣẹ́jú márùn-ún.',
  ha: "Sannu, ni Astra — abokiyar AI, ba likita ba. Faɗa mini yadda kake ji, ko danna prompt don farawa da minti 5.",
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
