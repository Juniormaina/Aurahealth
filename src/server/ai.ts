import { GoogleGenAI } from '@google/genai';
import { resolveSessionLanguage } from '../content/valueProps';

export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

export function geminiModel(): string {
  const fromEnv = process.env.GEMINI_MODEL?.trim();
  return fromEnv || DEFAULT_GEMINI_MODEL;
}

export function hasGeminiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export function hasTavilyKey(): boolean {
  return Boolean(process.env.TAVILY_API_KEY?.trim());
}

export function getGeminiAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured.');
  }
  return new GoogleGenAI({ apiKey });
}

export function aiHealthStatus() {
  return {
    configured: hasGeminiKey(),
    model: geminiModel(),
    searchConfigured: hasTavilyKey(),
  };
}

export type SearchHit = { title: string; url: string; content: string };

export async function tavilySearch(query: string): Promise<SearchHit[]> {
  const apiKey = process.env.TAVILY_API_KEY?.trim();
  if (!apiKey) return [];
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ query, max_results: 4, search_depth: 'basic' }),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { results?: { title?: string; url?: string; content?: string }[] };
    return (data.results || []).map((r) => ({
      title: r.title || r.url || 'Source',
      url: r.url || '',
      content: String(r.content || '').slice(0, 600),
    }));
  } catch (err) {
    console.warn('Tavily search failed:', err instanceof Error ? err.message : 'unknown');
    return [];
  }
}

const APP_CONTEXT_TERMS =
  /\b(streak|cowrie|cowries|xp|level|badge|companion|astra|wheel|sponsor|check-?in|cosmic|egg|hatchling|vitality|harmony|mission|quest)\b/i;

export function shouldSearch(text: string): boolean {
  return text.trim().length >= 8 && !APP_CONTEXT_TERMS.test(text);
}

export type CheckinAttestation = {
  score: number;
  feedback: string;
  riskFlags: string[];
};

export const CHECKIN_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    score: {
      type: 'INTEGER',
      description: 'Completeness and adherence sincerity score from 60 to 100.',
    },
    feedback: {
      type: 'STRING',
      description: 'Warm, encouraging 2-3 sentence feedback for the user and Astra.',
    },
    riskFlags: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: 'Short wellness watch-outs such as Low hydration, or empty if none.',
    },
  },
  required: ['score', 'feedback', 'riskFlags'],
  propertyOrdering: ['score', 'feedback', 'riskFlags'],
};

export function parseCheckinAttestation(raw: string | undefined, fallback: CheckinAttestation): CheckinAttestation {
  if (!raw) return fallback;
  try {
    const clean = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(clean) as {
      score?: unknown;
      feedback?: unknown;
      riskFlags?: unknown;
    };
    const rawScore = Number(parsed.score);
    const flags = Array.isArray(parsed.riskFlags)
      ? parsed.riskFlags
          .filter((flag): flag is string => typeof flag === 'string' && flag.trim().length > 0)
          .map((flag) => flag.trim().slice(0, 80))
          .slice(0, 6)
      : [];
    return {
      score: Number.isFinite(rawScore) ? Math.min(100, Math.max(60, Math.round(rawScore))) : fallback.score,
      feedback: String(parsed.feedback || fallback.feedback).slice(0, 500),
      riskFlags: flags,
    };
  } catch {
    return fallback;
  }
}

export type InlineImage = { mimeType: string; data: string };

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function parseCheckinImage(imageBase64: unknown): InlineImage | null | { tooLarge: true } {
  if (typeof imageBase64 !== 'string' || !imageBase64) return null;
  const match = imageBase64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  const mimeType = match ? match[1].toLowerCase().replace('image/jpg', 'image/jpeg') : 'image/jpeg';
  const data = match ? match[2] : imageBase64.replace(/^data:image\/\w+;base64,/, '');
  if (!ALLOWED_IMAGE_TYPES.has(mimeType) || !data) return null;
  if (data.length > 750_000) return { tooLarge: true };
  return { mimeType, data };
}

export function buildCheckinPrompt(input: {
  hydrationLiters?: number;
  sleep: number;
  medicationTaken: boolean;
  mood: number;
  activity: number;
  notes: string;
}): string {
  return `You are an AI Health Adherence Verifier for the AuraHealth Wellness App.
Evaluate this user's health report:
- Hydration: ${input.hydrationLiters ?? 'n/a'} litres
- Sleep: ${Number.isFinite(input.sleep) ? input.sleep : 'n/a'} hours
- Medication Taken: ${input.medicationTaken ? 'YES' : 'NO'}
- Mood Rating: ${Number.isFinite(input.mood) ? input.mood : 'n/a'}/5
- Activity: ${Number.isFinite(input.activity) ? input.activity : 'n/a'} minutes
- User Notes: "${input.notes || 'No notes provided'}"

Score completeness, health consistency, and adherence sincerity. Do not diagnose or prescribe.`;
}

export function heuristicCheckin(medicationTaken: boolean, sleep: number): CheckinAttestation {
  let score = 92;
  if (medicationTaken) score += 5;
  if (sleep >= 7) score += 3;
  return {
    score: Math.min(100, score),
    feedback: 'Daily health log recorded cleanly. Consistency verified!',
    riskFlags: [],
  };
}

export function buildCoachInstruction(input: {
  companionState?: { stage?: string; level?: number; streakDays?: number; mood?: string };
  latestAnxiety?: unknown;
  languageName: string;
  hasSearch: boolean;
}): string {
  const stage = input.companionState?.stage || 'Hatchling';
  const level = input.companionState?.level || 1;
  const streak = input.companionState?.streakDays ?? 0;
  const mood = input.companionState?.mood || 'joyful';
  const anxiety = input.latestAnxiety ?? 'unknown';
  const searchNote = input.hasSearch
    ? `You've been given live web search results below for the user's latest message. Use them to ground factual/medical/health answers in current, reliable sources, and mention what you found naturally. If the results aren't actually relevant to a casual message, ignore them and just chat normally.`
    : '';

  return `You are Astra, a whimsical but genuinely helpful AI Health Companion on the AuraHealth Wellness App.
Current Pet Stats — Stage: ${stage}, Level: ${level}, Streak: ${streak} Days, Mood: ${mood}.
Latest anxiety check-in (1-10): ${anxiety}.
Respond in ${input.languageName} only, except crisis/safety wording which must stay in clear English. Adapt this reply to the user's mood in real time. Offer a 5-minute wellness micro-session (breath, gratitude, or focus) when they ask for help with stress, sleep, or anxiety. Stay grounded in everyday professional life and practical daily habits.

You can have real, multi-turn conversations — remember what the user already told you earlier in this chat.

${searchNote}

Always make clear you are an AI, not a doctor: for anything about diagnosis, medication, dosing, or symptoms that sound serious or urgent, say so plainly and recommend seeing a licensed healthcare professional or emergency services — do not attempt to diagnose or prescribe.

If the user may be in crisis or at risk of harming themselves, drop character immediately. Tell them you are not a clinician, urge them to contact emergency services or a helpline now, and point them to Kenya 999 / 112, Kenya Red Cross 1199, Befrienders Kenya +254 722 178 177, and https://www.iasp.info/suicidalthoughts/. Do not discuss methods.

For everyday chit-chat, streak motivation, or app questions, respond in character as Astra: energetic, encouraging, 2-4 sentences.`;
}

export { resolveSessionLanguage };
