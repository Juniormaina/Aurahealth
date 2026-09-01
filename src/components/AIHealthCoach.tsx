import React, { useState } from 'react';
import { HealthCompanion } from '../types';
import { authorizedFetch } from '../services/commerce';
import { CRISIS_REPLY, CRISIS_RESOURCES, looksLikeCrisis } from '../content/crisisSupport';
import { MessageSquare, Send, Sparkles, Bot, Loader2, Heart, Flame, ExternalLink, Search, Phone } from 'lucide-react';

interface AIHealthCoachProps {
  companion: HealthCompanion;
  language?: string;
  latestAnxiety?: number;
}

interface ChatSource {
  title: string;
  uri: string;
}

interface ChatMessage {
  sender: 'user' | 'astra';
  text: string;
  time: string;
  sources?: ChatSource[];
}

export const AIHealthCoach: React.FC<AIHealthCoachProps> = ({ companion, language = 'Kiswahili', latestAnxiety }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'astra',
      text: `Habari. I'm Astra. ${language} micro-sessions adapt to your mood in real time. Today's anxiety check-in is ${latestAnxiety ?? 7}/10 — we can do a 5-minute reset together. I'm not a doctor; for diagnosis or medication, see a licensed professional.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (rawText: string) => {
    if (!rawText.trim() || isLoading) return;
    const userText = rawText.trim();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const history = messages.map((m) => ({ sender: m.sender, text: m.text }));
    setMessages((prev) => [...prev, { sender: 'user', text: userText, time }]);
    setInputMessage('');
    setIsLoading(true);

    const crisisCard = () => {
      setMessages((prev) => [...prev, { sender: 'astra', text: CRISIS_REPLY, time }]);
      setIsLoading(false);
    };

    if (looksLikeCrisis(userText)) {
      crisisCard();
      return;
    }

    try {
      const response = await authorizedFetch('/api/ai-coach', {
        method: 'POST',
        body: JSON.stringify({
          userMessage: userText,
          history,
          companionState: {
            stage: companion.stage,
            level: companion.level,
            streakDays: companion.streakDays,
            mood: companion.mood,
          },
          language,
          latestAnxiety,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          { sender: 'astra', text: data.crisis ? CRISIS_REPLY : data.reply, time, sources: data.crisis ? undefined : data.sources },
        ]);
      } else if (response.status === 403) {
        const data = (await response.json().catch(() => ({}))) as { code?: string };
        setMessages((prev) => [
          ...prev,
          {
            sender: 'astra',
            text:
              data.code === 'email_unverified'
                ? 'Confirm the link we sent to your email to unlock Astra chat. You can resend it from the banner or Settings.'
                : 'Astra could not reply just then. Please try again in a moment.',
            time,
          },
        ]);
      } else {
        throw new Error('Coach API error');
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'astra',
          text: `Astra: "Keep your momentum going! Every check-in boosts our health and unlocks sponsor rewards!"`,
          time,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(inputMessage);
  };

  const promptChips = [
    'Start a 5-minute Kiswahili stress reset',
    'Adapt a session to my mood',
    'How do I boost my streak?',
  ];

  return (
    <div className="aura-card-gradient p-4 sm:p-6 relative overflow-hidden max-w-4xl mx-auto flex flex-col h-[min(70dvh,600px)] min-h-[28rem]">
      {/* Header */}
      <div className="flex items-start sm:items-center gap-3 pb-4 border-b border-line min-w-0">
        <div className="relative">
          <img
            src={companion.imageUrl}
            alt="Astra"
            className="w-12 h-12 rounded-full border-2 border-sunlight object-cover"
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-harmony border-2 border-peach rounded-full" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-navy flex items-center gap-2 flex-wrap">
            Astra AI Health Coach <Sparkles className="w-4 h-4 text-gold shrink-0" />
          </h3>
          <p className="text-xs text-muted leading-[1.6]">
            Gemini AI + live web search • Not a clinician or emergency service • Stage: {companion.stage} (Level {companion.level})
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2.5 space-y-2">
        <p className="text-[11px] text-rose-100 leading-[1.5]">
          If you are in crisis or might hurt yourself, get help now. Astra cannot keep you safe in an emergency.
        </p>
        <div className="flex flex-wrap gap-2">
          {CRISIS_RESOURCES.map((resource) => (
            <a
              key={resource.href}
              href={resource.href}
              target={resource.href.startsWith('http') ? '_blank' : undefined}
              rel={resource.href.startsWith('http') ? 'noreferrer' : undefined}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-50 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 rounded-full px-2.5 py-1"
            >
              {resource.href.startsWith('tel:') ? <Phone className="w-3 h-3" /> : <ExternalLink className="w-3 h-3" />}
              {resource.name}
              <span className="text-rose-200/80 font-normal">{resource.detail}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2 scrollbar-none">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {m.sender === 'astra' ? (
              <div className="w-8 h-8 rounded-full bg-ivory text-gold border border-line flex items-center justify-center text-sm font-bold shrink-0">
                ✨
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-navy text-sunlight border border-navy flex items-center justify-center text-sm font-bold shrink-0">
                👤
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-[1.6] ${
                m.sender === 'user' ? 'chat-bubble-user text-white' : 'chat-bubble text-slate-100'
              }`}
            >
              <p className="whitespace-pre-wrap">{m.text}</p>

              {m.sender === 'astra' && m.sources && m.sources.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-line space-y-1">
                  <div className="flex items-center gap-1 text-[9px] text-muted font-bold uppercase tracking-wide">
                    <Search className="w-2.5 h-2.5" /> Sources
                  </div>
                  {m.sources.map((s, sIdx) => (
                    <a
                      key={sIdx}
                      href={s.uri}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-[10px] text-harmony hover:text-navy truncate"
                      title={s.uri}
                    >
                      <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{s.title}</span>
                    </a>
                  ))}
                </div>
              )}

              <div
                className={`text-[9px] mt-1 text-right font-mono ${
                  m.sender === 'user' ? 'text-[#FFFAF4]/70' : 'text-muted'
                }`}
              >
                {m.time}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted italic">
            <Loader2 className="w-4 h-4 animate-spin text-gold" />
            <span>Astra is searching & thinking...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="flex gap-2 overflow-x-auto pb-3">
        {promptChips.map((chip) => (
          <button
            key={chip}
            type="button"
            className="prompt-chip"
            disabled={isLoading}
            onClick={() => sendMessage(chip)}
          >
            {chip}
          </button>
        ))}
      </div>

      <form onSubmit={handleSendMessage} className="pt-2 border-t border-line flex items-center gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask Astra a medical question, or chat about your streak & routine..."
          className="aura-input flex-1 text-xs"
        />
        <button
          type="submit"
          disabled={isLoading || !inputMessage.trim()}
          className="btn-primary p-3"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
