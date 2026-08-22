import React, { useState } from 'react';
import { HealthCompanion } from '../types';
import { MessageSquare, Send, Sparkles, Bot, Loader2, Heart, Flame, ExternalLink, Search } from 'lucide-react';

interface AIHealthCoachProps {
  companion: HealthCompanion;
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

export const AIHealthCoach: React.FC<AIHealthCoachProps> = ({ companion }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'astra',
      text: `Hello friend! I am Astra, your AI Health Companion! I can chat about your routine, streaks and rewards, and I can also search the web for real health and medical information. I'm not a doctor though — for anything urgent or about diagnosis/medication, please see a licensed professional. What's on your mind?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userText = inputMessage.trim();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const history = messages.map((m) => ({ sender: m.sender, text: m.text }));
    setMessages((prev) => [...prev, { sender: 'user', text: userText, time }]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: userText,
          history,
          companionState: {
            stage: companion.stage,
            level: companion.level,
            streakDays: companion.streakDays,
            mood: companion.mood,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, { sender: 'astra', text: data.reply, time, sources: data.sources }]);
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

  return (
    <div className="aura-card-gradient p-6 relative overflow-hidden max-w-4xl mx-auto flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-700/50">
        <div className="relative">
          <img
            src={companion.imageUrl}
            alt="Astra"
            className="w-12 h-12 rounded-full border-2 border-rose-300 dark:border-rose-500 object-cover"
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white dark:border-slate-900 rounded-full" />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            Astra AI Health Coach <Sparkles className="w-4 h-4 text-amber-500" />
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Gemini AI + live web search • Not a substitute for professional medical advice • Stage: {companion.stage} (Level {companion.level})
          </p>
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
              <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-900/30 text-rose-500 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center text-sm font-bold shrink-0">
                ✨
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30 flex items-center justify-center text-sm font-bold shrink-0">
                👤
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-rose-500 text-white rounded-tr-none shadow-md'
                  : 'bg-white/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-200 rounded-tl-none'
              }`}
            >
              <p className="whitespace-pre-wrap">{m.text}</p>

              {m.sender === 'astra' && m.sources && m.sources.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700/50 space-y-1">
                  <div className="flex items-center gap-1 text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide">
                    <Search className="w-2.5 h-2.5" /> Sources
                  </div>
                  {m.sources.map((s, sIdx) => (
                    <a
                      key={sIdx}
                      href={s.uri}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-[10px] text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 truncate"
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
                  m.sender === 'user' ? 'text-rose-100' : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {m.time}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 italic">
            <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
            <span>Astra is searching & thinking...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSendMessage} className="pt-4 border-t border-slate-200 dark:border-slate-700/50 flex items-center gap-2">
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
