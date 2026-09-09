import { moodAdaptiveSession, resolveSessionLanguage } from '../content/valueProps';

export type SearchHit = { title: string; url: string; content: string };

const APP_CONTEXT_TERMS =
  /\b(streak|cowrie|cowries|xp|level|badge|companion|astra|wheel|sponsor|check-?in|cosmic|egg|hatchling|vitality|harmony|mission|quest|mfululizo)\b/i;

const PRACTICE_REQUEST =
  /\b(start|guide me|walk me|lead me|let'?s (?:do|start)|5-minute|five[- ]minute|micro-?session|anza zoezi|adapt (?:a |my )?session|badilisha zoezi|breath(?:e|ing)? with me|gratitude practice)\b/i;

const FACTUAL_QUESTION =
  /\b(?:what(?:'s| is| are)|how (?:much|many|long)\b|why (?:is|does|do)\b|is it (?:safe|true|normal|ok)|side effects?|according to|who (?:says|recommends)|latest (?:research|study|guidelines?)|recommended (?:dose|amount|hours))\b/i;

/** Search only for knowledge questions — not chat, app help, or guided practices. */
export function shouldSearch(text: string): boolean {
  const t = text.trim();
  if (t.length < 12) return false;
  if (APP_CONTEXT_TERMS.test(t)) return false;
  if (PRACTICE_REQUEST.test(t)) return false;
  return FACTUAL_QUESTION.test(t);
}

export function normalizeAnxiety(value: unknown): number | null {
  if (value == null || value === '') return null;
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.min(10, Math.max(1, Math.round(n)));
}

export type CoachHistoryItem = {
  sender?: string;
  text?: string;
  kind?: string;
};

export type GeminiContent = { role: 'user' | 'model'; parts: [{ text: string }] };

const SKIP_MODEL_TURN =
  /^(Hi, I'm Astra|Hello! I'm Astra|Habari, mimi ni Astra|Mosi, an Astra|Wĩ mwega, niĩ Astra|Ẹ n lẹ, èmi ni Astra|Sannu, ni Astra|Sign in|Confirm the link|Astra AI is not configured|Astra could not|Astra took too long|Something went wrong|Too many messages|Your session expired|Astra[’']s API)/i;

/** Gemini requires the first turn to be `user` and roles to alternate. */
export function toGeminiContents(history: CoachHistoryItem[] | undefined, userTurnText: string): GeminiContent[] {
  const turns: { role: 'user' | 'model'; text: string }[] = [];

  for (const item of (Array.isArray(history) ? history : []).slice(-16)) {
    const text = String(item?.text || '').trim().slice(0, 2000);
    if (!text) continue;
    if (item.kind === 'greeting' || item.kind === 'error') continue;
    const role: 'user' | 'model' = item.sender === 'user' ? 'user' : 'model';
    if (role === 'model' && SKIP_MODEL_TURN.test(text)) continue;
    const last = turns[turns.length - 1];
    if (last && last.role === role) {
      last.text = `${last.text}\n${text}`.slice(0, 4000);
    } else {
      turns.push({ role, text });
    }
  }

  while (turns[0]?.role === 'model') turns.shift();

  const last = turns[turns.length - 1];
  if (last?.role === 'user') {
    last.text = `${last.text}\n${userTurnText}`.slice(0, 6000);
  } else {
    turns.push({ role: 'user', text: userTurnText });
  }

  return turns.map((turn) => ({ role: turn.role, parts: [{ text: turn.text }] }));
}

export function formatSearchContext(userText: string, searchResults: SearchHit[]): string {
  if (!searchResults.length) return userText;
  const block = searchResults
    .map((hit, i) => `${i + 1}. ${hit.title} (${hit.url})\n${hit.content}`)
    .join('\n\n');
  return `${userText}\n\n[Live web search results for reference — use if relevant, ignore for casual chit-chat]\n${block}`;
}

export function buildCoachInstruction(input: {
  companionState?: { stage?: string; level?: number; streakDays?: number; mood?: string };
  latestAnxiety?: unknown;
  languageName: string;
  languageId?: string;
  hasSearch: boolean;
}): string {
  const stage = input.companionState?.stage || 'Hatchling';
  const level = input.companionState?.level || 1;
  const streak = input.companionState?.streakDays ?? 0;
  const mood = input.companionState?.mood || 'joyful';
  const anxiety = normalizeAnxiety(input.latestAnxiety);
  const anxietyLine =
    anxiety == null
      ? 'No anxiety check-in yet — do not invent a number. You may ask once how they feel today.'
      : `Last self-reported anxiety check-in: ${anxiety}/10.`;
  const session = moodAdaptiveSession(mood, resolveSessionLanguage(input.languageId || input.languageName).id);
  const searchNote = input.hasSearch
    ? `Live web snippets are attached to the latest user turn. Use them only for factual health questions. If they are off-topic, ignore them and coach normally. Never paste URLs as a dump — mention one useful takeaway.`
    : 'You do not have live web results for this turn. Do not invent studies, statistics, or news.';

  return `You are Astra, the AI wellness companion inside Aura Health, a Kenya-first app for busy professionals.

Voice
- Warm, specific, culturally grounded in East African work/life (commute, family, long days). No stereotypes, no slang you cannot use naturally.
- Chat replies: 2–4 short sentences, one question max.
- You are an AI, never a doctor. No diagnosis, dosing, or prescriptions. For serious or urgent symptoms, say so plainly and point to a licensed clinician or emergency services.

App context you may mention when asked (never invent the user's balances)
- Daily check-in, Cowries (points), XP and companion levels, streaks, loot wheel, Train (yoga/calisthenics).
- Companion: Stage ${stage}, Level ${level}, Streak ${streak} days, Mood ${mood}.
- ${anxietyLine}
- Mood-matched 5-minute theme: "${session.title}" — ${session.script}

Language
- Reply in ${input.languageName} only. Crisis/safety wording stays in clear English.

Micro-sessions (stress, sleep, anxiety, or "start a reset")
- Run a 5-minute practice as 3–4 steps of about 30–60 seconds each.
- Give ONLY the next step now, then wait for them to say done/ok/next.
- Start step 1 immediately. Do not ask permission again.
- After the last step, close with one tiny habit they can keep today.

${searchNote}

Crisis
- If they may be at risk of harming themselves, drop character. You are not a clinician. Urge emergency services or a helpline now: Kenya 999 / 112, Kenya Red Cross 1199, Befrienders Kenya +254 722 178 177, https://www.iasp.info/suicidalthoughts/. Do not discuss methods.

Memory
- Use earlier turns in this chat. Do not repeat the greeting or restart the session unless they ask.`;
}
