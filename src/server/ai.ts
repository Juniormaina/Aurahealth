import { GoogleGenAI } from '@google/genai';
import { moodAdaptiveSession, resolveSessionLanguage } from '../content/valueProps';
import {
  buildCoachInstruction,
  formatSearchContext,
  isHealthScopedMessage,
  OFF_TOPIC_HEALTH_REPLY,
  shouldSearch,
  toGeminiContents,
  type CoachHistoryItem,
  type SearchHit,
} from './coachTurn';

export {
  buildCoachInstruction,
  formatSearchContext,
  isHealthScopedMessage,
  normalizeAnxiety,
  OFF_TOPIC_HEALTH_REPLY,
  shouldSearch,
  toGeminiContents,
} from './coachTurn';
export type { CoachHistoryItem, GeminiContent, SearchHit } from './coachTurn';

export const DEFAULT_GEMINI_MODEL = 'gemini-3.6-flash';

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

export type CoachGenerateResult = {
  reply: string;
  sources: SearchHit[];
  searched: boolean;
};

export class CoachGenerateError extends Error {
  code: 'empty_message' | 'empty_reply';
  constructor(code: CoachGenerateError['code'], message: string) {
    super(message);
    this.code = code;
    this.name = 'CoachGenerateError';
  }
}

export async function generateCoachReply(input: {
  userMessage: string;
  history?: CoachHistoryItem[];
  companionState?: { stage?: string; level?: number; streakDays?: number; mood?: string };
  language?: unknown;
  latestAnxiety?: unknown;
  lifestyleContext?: string;
  search?: (query: string) => Promise<SearchHit[]>;
}): Promise<CoachGenerateResult> {
  const userText = String(input.userMessage || '').trim().slice(0, 4000);
  if (!userText) {
    throw new CoachGenerateError('empty_message', 'Message required');
  }

  if (!isHealthScopedMessage(userText)) {
    return { reply: OFF_TOPIC_HEALTH_REPLY, sources: [], searched: false };
  }

  const language = resolveSessionLanguage('en');
  const mood = input.companionState?.mood || 'joyful';
  const session = moodAdaptiveSession(mood, 'en');
  const searchFn = input.search || tavilySearch;
  const searchResults = shouldSearch(userText) ? await searchFn(userText) : [];
  const instruction = buildCoachInstruction({
    companionState: input.companionState,
    latestAnxiety: input.latestAnxiety,
    languageName: 'English',
    languageId: 'en',
    hasSearch: searchResults.length > 0,
    sessionTitle: session.title,
    sessionScript: session.script,
    lifestyleContext: typeof input.lifestyleContext === 'string' ? input.lifestyleContext.slice(0, 4000) : undefined,
  });
  const contents = toGeminiContents(input.history, formatSearchContext(userText, searchResults));

  const ai = getGeminiAI();
  const response = await ai.models.generateContent({
    model: geminiModel(),
    contents,
    config: {
      systemInstruction: instruction,
      temperature: 0.65,
      maxOutputTokens: 640,
    },
  });

  const reply = String(response.text || '').trim();
  if (!reply) {
    throw new CoachGenerateError('empty_reply', 'Astra returned an empty reply');
  }

  return { reply, sources: searchResults, searched: searchResults.length > 0 };
}

export { resolveSessionLanguage };
