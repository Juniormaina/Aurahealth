import React, { useState } from 'react';
import { HealthCompanion } from '../types';
import { MessageSquare, Send, Sparkles, Bot, Loader2, Heart, Flame } from 'lucide-react';

interface AIHealthCoachProps {
  companion: HealthCompanion;
}

export const AIHealthCoach: React.FC<AIHealthCoachProps> = ({ companion }) => {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'astra'; text: string; time: string }>>([
    {
      sender: 'astra',
      text: `Hello friend! I am Astra, your AI Health Companion! How are you feeling today? Ask me anything about your health routine, hydration goals, or streak rewards!`,
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

    setMessages((prev) => [...prev, { sender: 'user', text: userText, time }]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: userText,
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
        setMessages((prev) => [...prev, { sender: 'astra', text: data.reply, time }]);
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
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden backdrop-blur-sm max-w-4xl mx-auto flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
        <div className="relative">
          <img
            src={companion.imageUrl}
            alt="Astra"
            className="w-12 h-12 rounded-full border-2 border-rose-500 object-cover"
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full" />
        </div>
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            Astra AI Health Coach <Sparkles className="w-4 h-4 text-amber-400" />
          </h3>
          <p className="text-xs text-slate-400">
            Powered by Gemini AI • Stage: {companion.stage} (Level {companion.level})
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
              <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center text-sm font-bold shrink-0">
                ✨
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center text-sm font-bold shrink-0">
                👤
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-rose-600 text-white rounded-tr-none shadow-md'
                  : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}
            >
              <p>{m.text}</p>
              <div
                className={`text-[9px] mt-1 text-right font-mono ${
                  m.sender === 'user' ? 'text-rose-200' : 'text-slate-500'
                }`}
              >
                {m.time}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 italic">
            <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
            <span>Astra is crafting a response...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSendMessage} className="pt-4 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask Astra for health tips, hydration advice, or streak motivation..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-rose-500"
        />
        <button
          type="submit"
          disabled={isLoading || !inputMessage.trim()}
          className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white p-3 rounded-xl transition-colors font-bold flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
