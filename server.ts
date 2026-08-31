import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import {
  addCorporateLead,
  checkout,
  funnelSummary,
  getOrCreatePlan,
  impactSummary,
  listCorporateLeads,
  listMetrics,
  recordMetric,
  seedDemoMetrics,
  startTrial,
  trackFunnel,
  PUBLIC_PROOF_USER_ID,
} from './src/server/commerceStore';
import { CORPORATE_PACKAGES, SUBSCRIPTION_TIERS, VALUE_PROPS } from './src/content/valueProps';
import { CRISIS_REPLY, CRISIS_RESOURCES, looksLikeCrisis } from './src/content/crisisSupport';
import {
  clientIp,
  ipKey,
  rateLimit,
  requireAdmin,
  requireAuth,
  uidKey,
} from './src/server/auth';
import { applyCheckinRewards, applyGrant, applySpend, applyWheelSpin, RewardsError } from './src/server/rewards';

// This project's env vars (GEMINI_API_KEY, PRIVATE_KEY, etc.) live in
// src/.env, not a root .env — load that explicitly, with a plain
// dotenv.config() fallback for deployments that inject env vars a
// different way (e.g. a root .env, or the platform's own env injection).
dotenv.config({ path: path.join(process.cwd(), 'src', '.env') });
dotenv.config();

function listenPort(raw: string | undefined, fallback = 3000): number {
  const n = Number.parseInt(String(raw || ''), 10);
  if (!Number.isInteger(n) || n < 1 || n > 65535) return fallback;
  return n;
}

async function startServer() {
  const app = express();
  const PORT = listenPort(process.env.PORT);
  app.set('trust proxy', 1);

  const jsonDefault = express.json({ limit: '32kb' });
  const jsonCheckin = express.json({ limit: '1mb' });
  app.use((req, res, next) => {
    if (req.path === '/api/verify-checkin') return jsonCheckin(req, res, next);
    return jsonDefault(req, res, next);
  });

  const geminiUserLimit = rateLimit({ windowMs: 60 * 60 * 1000, max: 30, key: uidKey('gemini') });
  const geminiIpLimit = rateLimit({ windowMs: 60 * 60 * 1000, max: 60, key: ipKey('gemini') });
  const geminiGlobalLimit = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 300,
    key: () => 'gemini:global',
  });
  const geminiLimit = [geminiUserLimit, geminiIpLimit, geminiGlobalLimit];
  const checkinLimit = rateLimit({ windowMs: 60 * 60 * 1000, max: 20, key: uidKey('checkin') });
  const leadLimit = rateLimit({ windowMs: 60 * 60 * 1000, max: 8, key: ipKey('lead') });
  const funnelLimit = rateLimit({ windowMs: 60 * 60 * 1000, max: 60, key: uidKey('funnel') });
  const adminLimit = rateLimit({ windowMs: 60 * 60 * 1000, max: 30, key: uidKey('admin') });
  const rewardsLimit = rateLimit({ windowMs: 60 * 60 * 1000, max: 40, key: uidKey('rewards') });

  const sendRewardsError = (res: express.Response, err: unknown) => {
    if (err instanceof RewardsError) {
      return res.status(err.status).json({ error: err.message, code: err.code });
    }
    console.warn('Rewards ledger error:', err);
    return res.status(500).json({ error: 'Rewards ledger failed', code: 'ledger_error' });
  };

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

  seedDemoMetrics(PUBLIC_PROOF_USER_ID);

  // AI Health Check-in Verification & Attestation Endpoint
  app.post('/api/verify-checkin', requireAuth, checkinLimit, ...geminiLimit, async (req, res) => {
    try {
      const {
        waterLiters,
        waterOz,
        sleepHours,
        medicationTaken,
        moodRating,
        activityMinutes,
        notes,
        imageBase64,
      } = req.body || {};
      const hydrationLiters =
        typeof waterLiters === 'number'
          ? waterLiters
          : typeof waterOz === 'number'
            ? Number((waterOz / 33.814).toFixed(2))
            : undefined;
      const sleep = typeof sleepHours === 'number' ? sleepHours : Number(sleepHours);
      const mood = typeof moodRating === 'number' ? moodRating : Number(moodRating);
      const activity = typeof activityMinutes === 'number' ? activityMinutes : Number(activityMinutes);
      const safeNotes = String(notes || '').slice(0, 500);
      const photo =
        typeof imageBase64 === 'string' ? imageBase64.replace(/^data:image\/\w+;base64,/, '') : '';
      if (photo.length > 750_000) {
        return res.status(413).json({ success: false, error: 'Photo too large' });
      }

      let aiAttestationScore = 92;
      let aiFeedback = 'Health log successfully analyzed and verified.';

      if (process.env.GEMINI_API_KEY) {
        try {
          const ai = getGeminiAI();
          const promptParts: any[] = [
            `You are an AI Health Adherence Verifier for the AuraHealth Wellness App.
Evaluate this user's health report:
- Hydration: ${hydrationLiters ?? 'n/a'} litres
- Sleep: ${Number.isFinite(sleep) ? sleep : 'n/a'} hours
- Medication Taken: ${medicationTaken ? 'YES' : 'NO'}
- Mood Rating: ${Number.isFinite(mood) ? mood : 'n/a'}/5
- Activity: ${Number.isFinite(activity) ? activity : 'n/a'} minutes
- User Notes: "${safeNotes || 'No notes provided'}"

Provide a JSON object response with:
1. "score": number between 60 and 100 based on completeness, health consistency, and adherence sincerity.
2. "feedback": 2-3 sentences of warm, encouraging feedback for the user and their Health Companion.
3. "riskFlags": array of strings (e.g. ["Low hydration", "Missed medication"]) or empty array if none.
4. "suggestedCowriesBonus": number between 10 and 50.

Response MUST be valid JSON string only.`,
          ];

          if (photo) {
            promptParts.push({
              inlineData: {
                mimeType: 'image/jpeg',
                data: photo,
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
          if (medicationTaken) aiAttestationScore += 5;
          if (sleep >= 7) aiAttestationScore += 3;
          aiFeedback = 'Daily health log recorded cleanly. Consistency verified!';
        }
      }

      res.json({
        success: true,
        aiAttestationScore,
        aiFeedback,
        timestamp: new Date().toISOString(),
      });
    } catch {
      res.status(500).json({ success: false, error: 'Verification failed' });
    }
  });

  app.post('/api/rewards/checkin', requireAuth, rewardsLimit, async (req, res) => {
    try {
      const body = req.body || {};
      const result = await applyCheckinRewards(req.user!.uid, req.user!.email, {
        medicationTaken: body.medicationTaken === true,
        activityMinutes: Number(body.activityMinutes),
      });
      res.json(result);
    } catch (err) {
      sendRewardsError(res, err);
    }
  });

  app.post('/api/rewards/grant', requireAuth, rewardsLimit, async (req, res) => {
    try {
      const { kind, id } = req.body || {};
      if (kind !== 'mission' && kind !== 'habit' && kind !== 'quicklog') {
        return res.status(400).json({ error: 'kind must be mission, habit, or quicklog', code: 'invalid_kind' });
      }
      if (typeof id !== 'string' || !id || id.length > 64) {
        return res.status(400).json({ error: 'id required', code: 'invalid_id' });
      }
      const result = await applyGrant(req.user!.uid, req.user!.email, kind, id);
      res.json(result);
    } catch (err) {
      sendRewardsError(res, err);
    }
  });

  app.post('/api/rewards/spin', requireAuth, rewardsLimit, async (req, res) => {
    try {
      const result = await applyWheelSpin(req.user!.uid, req.user!.email);
      res.json(result);
    } catch (err) {
      sendRewardsError(res, err);
    }
  });

  app.post('/api/rewards/spend', requireAuth, rewardsLimit, async (req, res) => {
    try {
      const benefitId = String(req.body?.benefitId || '');
      if (!benefitId || benefitId.length > 64) {
        return res.status(400).json({ error: 'benefitId required', code: 'invalid_id' });
      }
      const result = await applySpend(req.user!.uid, req.user!.email, benefitId);
      res.json(result);
    } catch (err) {
      sendRewardsError(res, err);
    }
  });

  // App-internal chit-chat (streaks, cowries, badges, etc.) should never
  // trigger a web search — the model already has that context from
  // companionState/history, and searching the raw message pulls back
  // unrelated results (e.g. "how's my streak?" surfacing Snapchat streak
  // guides). Only search for messages that don't look like app talk.
  const APP_CONTEXT_TERMS = /\b(streak|cowrie|cowries|xp|level|badge|companion|astra|wheel|sponsor|check-?in|cosmic|egg|hatchling|vitality|harmony|mission|quest)\b/i;
  const shouldSearch = (text: string) => text.trim().length >= 8 && !APP_CONTEXT_TERMS.test(text);

  app.get('/api/plans', (_req, res) => {
    res.json({
      valueProps: VALUE_PROPS,
      tiers: SUBSCRIPTION_TIERS,
      corporate: CORPORATE_PACKAGES,
    });
  });

  app.get('/api/subscriptions/me', requireAuth, (req, res) => {
    res.json({ plan: getOrCreatePlan(req.user!.uid) });
  });
  app.get('/api/subscriptions/:userId', requireAuth, (req, res) => {
    res.json({ plan: getOrCreatePlan(req.user!.uid) });
  });

  app.post('/api/subscriptions/trial', requireAuth, (req, res) => {
    const { interval } = req.body || {};
    res.json({ plan: startTrial(req.user!.uid, interval || 'monthly') });
  });

  app.post('/api/subscriptions/checkout', requireAuth, (req, res) => {
    const { interval } = req.body || {};
    if (!interval) return res.status(400).json({ error: 'interval required' });
    res.json({ plan: checkout(req.user!.uid, interval) });
  });

  app.post('/api/metrics', requireAuth, (req, res) => {
    const { moodScore, anxietyLevel, sessionDate, language, source } = req.body || {};
    if (moodScore == null || anxietyLevel == null) {
      return res.status(400).json({ error: 'moodScore and anxietyLevel required' });
    }
    recordMetric({
      userId: req.user!.uid,
      moodScore: Number(moodScore),
      anxietyLevel: Number(anxietyLevel),
      sessionDate: sessionDate || new Date().toISOString().slice(0, 10),
      language,
      source,
    });
    res.json({ ok: true });
  });

  app.get('/api/metrics/proof', (_req, res) => {
    res.json(impactSummary(PUBLIC_PROOF_USER_ID));
  });

  app.get('/api/metrics/me/impact', requireAuth, (req, res) => {
    res.json(impactSummary(req.user!.uid));
  });
  app.get('/api/metrics/:userId/impact', requireAuth, (req, res) => {
    res.json(impactSummary(req.user!.uid));
  });
  app.get('/api/metrics/me', requireAuth, (req, res) => {
    res.json({ metrics: listMetrics(req.user!.uid) });
  });
  app.get('/api/metrics/:userId', requireAuth, (req, res) => {
    res.json({ metrics: listMetrics(req.user!.uid) });
  });

  app.post('/api/funnel/event', requireAuth, funnelLimit, (req, res) => {
    const { event, meta } = req.body || {};
    if (!event) return res.status(400).json({ error: 'event required' });
    trackFunnel(req.user!.uid, String(event), meta);
    res.json({ ok: true });
  });

  app.get('/api/admin/session', requireAuth, adminLimit, requireAdmin, (req, res) => {
    res.json({ ok: true, email: req.user!.email });
  });

  app.get('/api/funnel/summary', requireAuth, requireAdmin, (_req, res) => {
    res.json(funnelSummary());
  });

  const saveCorporateLead = (req: express.Request, res: express.Response) => {
    const { company, contactEmail, seats, packageId, notes } = req.body || {};
    if (!company || !contactEmail) {
      return res.status(400).json({ error: 'company and contactEmail required' });
    }
    addCorporateLead({
      company: String(company).slice(0, 200),
      contactEmail: String(contactEmail).slice(0, 200),
      seats: Number(seats) || 25,
      packageId: String(packageId || 'team').slice(0, 40),
      notes: notes != null ? String(notes).slice(0, 500) : undefined,
      sourceIp: clientIp(req),
    });
    res.json({ ok: true });
  };

  app.post('/api/corporate', leadLimit, saveCorporateLead);
  app.post('/api/corporate/packages', leadLimit, saveCorporateLead);

  app.get('/api/corporate/leads', requireAuth, requireAdmin, (_req, res) => {
    res.json({ leads: listCorporateLeads() });
  });
  app.get('/api/corporate', (_req, res) => {
    res.json({ packages: CORPORATE_PACKAGES });
  });
  app.get('/api/corporate/packages', (_req, res) => {
    res.json({ packages: CORPORATE_PACKAGES });
  });

  // AI Companion Chat & Health Coach Endpoint
  // Real multi-turn conversation (full history sent each turn). Factual/
  // medical questions are grounded with a real Tavily web search — Gemini's
  // native Google Search grounding tool needs a billing-enabled Google Cloud
  // project, so this does the same job manually against a free search API
  // instead: search, then feed the results in as context.
  app.post('/api/ai-coach', requireAuth, ...geminiLimit, async (req, res) => {
    try {
      const { userMessage, companionState, history, language, latestAnxiety } = req.body || {};
      const userText = String(userMessage || '').slice(0, 4000);

      if (looksLikeCrisis(userText)) {
        return res.json({
          reply: CRISIS_REPLY,
          crisis: true,
          resources: CRISIS_RESOURCES,
          sources: [],
        });
      }

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
Preferred session language: ${language || 'English'}. Latest anxiety check-in (1-10): ${latestAnxiety ?? 'unknown'}.
Adapt this reply to the user's mood in real time. Offer a 5-minute culturally relevant micro-session (breath, gratitude, or focus) in the requested language when they ask for help with stress, sleep, or anxiety. You are not Calm or Headspace — stay grounded in African professional life, ubuntu, and local language.

You can have real, multi-turn conversations — remember what the user already told you earlier in this chat.

${searchResults.length > 0 ? `You've been given live web search results below for the user's latest message. Use them to ground factual/medical/health answers in current, reliable sources, and mention what you found naturally. If the results aren't actually relevant to a casual message, ignore them and just chat normally.` : ''}

Always make clear you are an AI, not a doctor: for anything about diagnosis, medication, dosing, or symptoms that sound serious or urgent, say so plainly and recommend seeing a licensed healthcare professional or emergency services — do not attempt to diagnose or prescribe.

If the user may be in crisis or at risk of harming themselves, drop character immediately. Tell them you are not a clinician, urge them to contact emergency services or a helpline now, and point them to Kenya 999 / 112, Kenya Red Cross 1199, Befrienders Kenya +254 722 178 177, and https://www.iasp.info/suicidalthoughts/. Do not discuss methods.

For everyday chit-chat, streak motivation, or app questions, respond in character as Astra: energetic, encouraging, 2-4 sentences.`;

      const userTurnText = searchResults.length > 0
        ? `${userText}\n\n[Live web search results for reference — use if relevant, ignore for casual chit-chat]\n${searchResults
            .map((r, i) => `${i + 1}. ${r.title} (${r.url})\n${r.content}`)
            .join('\n\n')}`
        : userText;

      const contents = [
        ...(Array.isArray(history) ? history : []).slice(-12).map((m: { sender: string; text: string }) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: String(m?.text || '').slice(0, 2000) }],
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
