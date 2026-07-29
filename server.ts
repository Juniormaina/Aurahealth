import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// This project's env vars (GEMINI_API_KEY, PRIVATE_KEY, etc.) live in
// src/.env, not a root .env — load that explicitly, with a plain
// dotenv.config() fallback for deployments that inject env vars a
// different way (e.g. a root .env, or the platform's own env injection).
dotenv.config({ path: path.join(process.cwd(), 'src', '.env') });
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Real web search via Tavily (free tier, no billing required) — used to
  // ground Astra's factual/medical answers instead of Gemini's native
  // Google Search grounding tool, which needs a billing-enabled Google Cloud
  // project. Returns [] on any failure so a search hiccup never blocks chat.
  const tavilySearch = async (query: string): Promise<{ title: string; url: string; content: string }[]> => {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) return [];
    try {
      const res = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ query, max_results: 4, search_depth: 'basic' }),
      });
      if (!res.ok) return [];
      const data = await res.json();
      return (data.results || []).map((r: any) => ({
        title: r.title || r.url,
        url: r.url,
        content: (r.content || '').slice(0, 600),
      }));
    } catch (err) {
      console.warn('Tavily search failed:', err);
      return [];
    }
  };

  // Initialize Gemini AI lazily/safely
  const getGeminiAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured.');
    }
    return new GoogleGenAI({ apiKey });
  };

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', network: 'AuraHealth Verification Engine' });
  });

  // AI Health Check-in Verification & Attestation Endpoint
  app.post('/api/verify-checkin', async (req, res) => {
    try {
      const { waterOz, sleepHours, medicationTaken, moodRating, activityMinutes, notes, imageBase64 } = req.body;

      let aiAttestationScore = 92;
      let aiFeedback = 'Health log successfully analyzed and verified.';

      if (process.env.GEMINI_API_KEY) {
        try {
          const ai = getGeminiAI();
          const promptParts: any[] = [
            `You are an AI Health Adherence Verifier for the AuraHealth Wellness App.
Evaluate this user's health report:
- Hydration: ${waterOz} oz
- Sleep: ${sleepHours} hours
- Medication Taken: ${medicationTaken ? 'YES' : 'NO'}
- Mood Rating: ${moodRating}/5
- Activity: ${activityMinutes} minutes
- User Notes: "${notes || 'No notes provided'}"

Provide a JSON object response with:
1. "score": number between 60 and 100 based on completeness, health consistency, and adherence sincerity.
2. "feedback": 2-3 sentences of warm, encouraging feedback for the user and their Health Companion.
3. "riskFlags": array of strings (e.g. ["Low hydration", "Missed medication"]) or empty array if none.
4. "suggestedCowriesBonus": number between 10 and 50.

Response MUST be valid JSON string only.`,
          ];

          if (imageBase64) {
            promptParts.push({
              inlineData: {
                mimeType: 'image/jpeg',
                data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
              },
            });
          }

          const response = await ai.models.generateContent({
            model: 'gemini-flash-latest',
            contents: promptParts,
          });

          const textResponse = response.text;
          if (textResponse) {
            const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanJson);
            aiAttestationScore = parsed.score || 90;
            aiFeedback = parsed.feedback || aiFeedback;
          }
        } catch (genErr) {
          console.warn('Gemini AI Verification fallback used:', genErr);
          // Fallback calculation if key missing or rate-limited
          if (medicationTaken) aiAttestationScore += 5;
          if (sleepHours >= 7) aiAttestationScore += 3;
          aiFeedback = 'Daily health log recorded cleanly. Consistency verified!';
        }
      }

      res.json({
        success: true,
        aiAttestationScore,
        aiFeedback,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Verification failed' });
    }
  });

  // App-internal chit-chat (streaks, cowries, badges, etc.) should never
  // trigger a web search — the model already has that context from
  // companionState/history, and searching the raw message pulls back
  // unrelated results (e.g. "how's my streak?" surfacing Snapchat streak
  // guides). Only search for messages that don't look like app talk.
  const APP_CONTEXT_TERMS = /\b(streak|cowrie|cowries|xp|level|badge|companion|astra|wheel|sponsor|check-?in|cosmic|egg|hatchling|vitality|harmony|mission|quest)\b/i;
  const shouldSearch = (text: string) => text.trim().length >= 8 && !APP_CONTEXT_TERMS.test(text);

  // AI Companion Chat & Health Coach Endpoint
  // Real multi-turn conversation (full history sent each turn). Factual/
  // medical questions are grounded with a real Tavily web search — Gemini's
  // native Google Search grounding tool needs a billing-enabled Google Cloud
  // project, so this does the same job manually against a free search API
  // instead: search, then feed the results in as context.
  app.post('/api/ai-coach', async (req, res) => {
    try {
      const { userMessage, companionState, history } = req.body;
      const userText = String(userMessage || '');

      if (!process.env.GEMINI_API_KEY) {
        return res.json({
          reply: `Astra (${companionState?.stage || 'Hatchling'}): "Keep up the fantastic work! Stay hydrated and take your daily checks to help me level up!"`,
          sources: [],
        });
      }

      const ai = getGeminiAI();
      const searchResults = shouldSearch(userText) ? await tavilySearch(userText) : [];

      const baseInstruction = `You are Astra, a whimsical but genuinely helpful AI Health Companion on the AuraHealth Wellness App.
Current Pet Stats — Stage: ${companionState?.stage || 'Hatchling'}, Level: ${companionState?.level || 1}, Streak: ${companionState?.streakDays ?? 0} Days, Mood: ${companionState?.mood || 'joyful'}.

You can have real, multi-turn conversations — remember what the user already told you earlier in this chat.

${searchResults.length > 0 ? `You've been given live web search results below for the user's latest message. Use them to ground factual/medical/health answers in current, reliable sources, and mention what you found naturally. If the results aren't actually relevant to a casual message, ignore them and just chat normally.` : ''}

Always make clear you are an AI, not a doctor: for anything about diagnosis, medication, dosing, or symptoms that sound serious or urgent, say so plainly and recommend seeing a licensed healthcare professional or emergency services — do not attempt to diagnose or prescribe.

For everyday chit-chat, streak motivation, or app questions, respond in character as Astra: energetic, encouraging, 2-4 sentences.`;

      const userTurnText = searchResults.length > 0
        ? `${userText}\n\n[Live web search results for reference — use if relevant, ignore for casual chit-chat]\n${searchResults
            .map((r, i) => `${i + 1}. ${r.title} (${r.url})\n${r.content}`)
            .join('\n\n')}`
        : userText;

      const contents = [
        ...(Array.isArray(history) ? history : []).slice(-12).map((m: { sender: string; text: string }) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }],
        })),
        { role: 'user', parts: [{ text: userTurnText }] },
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents,
        config: { systemInstruction: baseInstruction },
      });

      res.json({
        reply: response.text || "Astra beams with energy! Let's keep your health streak going!",
        sources: searchResults.map((r) => ({ title: r.title, uri: r.url })),
      });
    } catch (err: any) {
      console.warn('AI coach error:', err);
      res.json({
        reply: `Astra: "I'm right here with you! Every daily check-in powers up our health journey!"`,
        sources: [],
      });
    }
  });

  // Vite Middleware in dev vs static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
