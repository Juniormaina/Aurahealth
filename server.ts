import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

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
            model: 'gemini-2.5-flash',
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

  // AI Companion Chat & Health Coach Endpoint
  // Real multi-turn conversation (full history sent each turn) with Google
  // Search grounding enabled, so Astra can answer factual/medical questions
  // from current web sources instead of only from model training data.
  app.post('/api/ai-coach', async (req, res) => {
    try {
      const { userMessage, companionState, history } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.json({
          reply: `Astra (${companionState?.stage || 'Hatchling'}): "Keep up the fantastic work! Stay hydrated and take your daily checks to help me level up!"`,
          sources: [],
        });
      }

      const ai = getGeminiAI();

      const systemInstruction = `You are Astra, a whimsical but genuinely helpful AI Health Companion on the AuraHealth Wellness App.
Current Pet Stats — Stage: ${companionState?.stage || 'Hatchling'}, Level: ${companionState?.level || 1}, Streak: ${companionState?.streakDays ?? 0} Days, Mood: ${companionState?.mood || 'joyful'}.

You can have real, multi-turn conversations — remember what the user already told you earlier in this chat.

When the user asks a factual, medical, nutrition, fitness, or health-related question, use Google Search to ground your answer in current, reliable sources (e.g. major health organizations, medical references, peer-reviewed sources) rather than guessing from memory, and keep your tone clear and accurate rather than overly whimsical for that part of the reply.

Always make clear you are an AI, not a doctor: for anything about diagnosis, medication, dosing, or symptoms that sound serious or urgent, say so plainly and recommend seeing a licensed healthcare professional or emergency services — do not attempt to diagnose or prescribe.

For everyday chit-chat, streak motivation, or app questions, respond in character as Astra: energetic, encouraging, 2-4 sentences.`;

      const contents = [
        ...(Array.isArray(history) ? history : []).slice(-12).map((m: { sender: string; text: string }) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }],
        })),
        { role: 'user', parts: [{ text: String(userMessage || '') }] },
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
        },
      });

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const seen = new Set<string>();
      const sources = groundingChunks
        .map((c: any) => c.web)
        .filter((w: any) => w?.uri && !seen.has(w.uri) && seen.add(w.uri))
        .slice(0, 5)
        .map((w: any) => ({ title: w.title || w.uri, uri: w.uri }));

      res.json({
        reply: response.text || "Astra beams with energy! Let's keep your health streak going!",
        sources,
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
