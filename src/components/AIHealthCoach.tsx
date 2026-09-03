import React, { useEffect, useMemo, useRef, useState } from 'react';
import { HealthCompanion } from '../types';
import { fetchCoachReply, isCoachReplyFailure } from '../services/commerce';
import { CRISIS_REPLY, CRISIS_RESOURCES, looksLikeCrisis } from '../content/crisisSupport';
import { resolveSessionLanguage, SessionLanguageId } from '../content/valueProps';
import {
  Send,
  Sparkles,
  Loader2,
  ExternalLink,
  Search,
  Phone,
  ChevronDown,
  AlertTriangle,
} from 'lucide-react';

interface AIHealthCoachProps {
  companion: HealthCompanion;
  latestAnxiety?: number;
  language?: SessionLanguageId;
  onShowToast?: (message: string) => void;
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

const PROMPT_CHIPS = [
  'Start a 5-minute stress reset',
  'Adapt a session to my mood',
  'How do I boost my streak?',
];

function coachGreeting(latestAnxiety?: number, languageName = 'English'): string {
  const languageNote =
    languageName === 'English' ? '' : ` I can chat in ${languageName}.`;
  return `Hello! I'm Astra. Today's anxiety check-in is ${latestAnxiety ?? 7}/10 — we can do a 5-minute reset together.${languageNote} I'm not a doctor; for diagnosis or medication, see a licensed professional.`;
}

function PromptChipRow({
  chips,
  disabled,
  onSelect,
}: {
  chips: string[];
  disabled: boolean;
  onSelect: (text: string) => void;
}) {
  return (
    <div className="coach-prompt-scroll pl-11 sm:pl-11">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory">
        {chips.map((chip) => (
          <button
            key={chip}
            type="button"
            className="prompt-chip snap-start shrink-0"
            disabled={disabled}
            onClick={() => onSelect(chip)}
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}

export const AIHealthCoach: React.FC<AIHealthCoachProps> = ({
  companion,
  latestAnxiety,
  language,
  onShowToast,
}) => {
  const languageName = resolveSessionLanguage(language).native;
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'astra',
      text: coachGreeting(latestAnxiety, languageName),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [crisisOpen, setCrisisOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const levelPct = Math.min(100, (companion.xp / Math.max(1, companion.xpToNextLevel)) * 100);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const lastAstraIndex = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].sender === 'astra') return i;
    }
    return -1;
  }, [messages]);

  const appendAstraReply = (text: string, time: string, sources?: ChatSource[]) => {
    setMessages((prev) => [...prev, { sender: 'astra', text, time, sources }]);
  };

  const sendMessage = async (rawText: string) => {
    const userText = rawText.trim();
    if (!userText || isLoading) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const history = messagesRef.current.map((m) => ({ sender: m.sender, text: m.text }));

    setMessages((prev) => [...prev, { sender: 'user', text: userText, time }]);
    setInputMessage('');
    if (inputRef.current) inputRef.current.value = '';
    setIsLoading(true);

    if (looksLikeCrisis(userText)) {
      appendAstraReply(CRISIS_REPLY, time);
      setIsLoading(false);
      return;
    }

    try {
      const result = await fetchCoachReply({
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
      });

      if (isCoachReplyFailure(result)) {
        console.error('Coach reply failed:', result.status, result.message);
        onShowToast?.(result.message);
        appendAstraReply(
          result.status === 401
            ? `${result.message} Tap Enter Dashboard on the home page to sign in, then come back to Coach.`
            : result.message,
          time
        );
      } else {
        appendAstraReply(
          result.crisis ? CRISIS_REPLY : result.reply,
          time,
          result.crisis ? undefined : result.sources
        );
      }
    } catch (err) {
      console.error('Failed to fetch AI response:', err);
      const message = 'Something went wrong reaching Astra. Try sending again.';
      onShowToast?.(message);
      appendAstraReply(message, time);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = inputRef.current?.value ?? inputMessage;
    await sendMessage(text);
  };

  const renderMessage = (m: ChatMessage, idx: number) => {
    const isUser = m.sender === 'user';

    return (
      <div key={idx} className={`flex items-end gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isUser && (
          <img
            src={companion.imageUrl}
            alt=""
            className="w-8 h-8 rounded-full border border-white/15 object-cover shrink-0 mb-0.5"
          />
        )}
        {isUser && (
          <div className="w-8 h-8 rounded-full bg-primary/90 text-[var(--color-primary-foreground)] flex items-center justify-center text-xs font-bold shrink-0 mb-0.5">
            You
          </div>
        )}

        <div className={`flex flex-col max-w-[min(82%,20rem)] ${isUser ? 'items-end' : 'items-start'}`}>
          {!isUser && <span className="text-[10px] font-semibold text-slate-400 mb-1 px-1">Astra</span>}
          <div className={`rounded-2xl px-3.5 py-2.5 text-xs leading-[1.65] ${isUser ? 'chat-bubble-user' : 'chat-bubble-astra'}`}>
            <p className="whitespace-pre-wrap">{m.text}</p>

            {!isUser && m.sources && m.sources.length > 0 && (
              <div className="mt-2.5 pt-2 border-t border-white/10 space-y-1">
                <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold uppercase tracking-wide">
                  <Search className="w-2.5 h-2.5" /> Sources
                </div>
                {m.sources
                  .filter((s) => {
                    try {
                      const u = new URL(s.uri);
                      return u.protocol === 'https:' || u.protocol === 'http:';
                    } catch {
                      return false;
                    }
                  })
                  .map((s, sIdx) => (
                  <a
                    key={sIdx}
                    href={s.uri}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[10px] text-[var(--color-harmony)] hover:underline truncate"
                    title={s.uri}
                  >
                    <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate">{s.title}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
          <span className={`text-[9px] mt-1 font-mono px-1 ${isUser ? 'text-slate-500' : 'text-slate-500'}`}>
            {m.time}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="aura-card-gradient chat-container p-4 sm:p-6 relative max-w-4xl mx-auto">
      <div className="chat-container-header shrink-0 min-w-0">
      <div className="flex items-start sm:items-center gap-3 pb-3 border-b border-line min-w-0">
        <div className="relative shrink-0">
          <img
            src={companion.imageUrl}
            alt="Astra"
            className="w-12 h-12 rounded-full border-2 border-sunlight object-cover"
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-harmony border-2 border-peach rounded-full" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-bold text-navy flex items-center gap-2 flex-wrap">
            Astra AI Health Coach <Sparkles className="w-4 h-4 text-gold shrink-0" />
          </h3>
          <p className="text-[11px] text-muted leading-[1.5] mt-0.5">
            Gemini AI + live web search · Not a clinician or emergency service
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="text-[11px] font-semibold text-ink whitespace-nowrap">
              {companion.stage} · Level {companion.level}
            </span>
            <div className="flex items-center gap-2 min-w-[8rem] flex-1 max-w-[12rem]">
              <div className="coach-level-progress flex-1" aria-hidden>
                <div className="coach-level-progress-fill" style={{ width: `${levelPct}%` }} />
              </div>
              <span className="text-[10px] tabular-nums text-muted whitespace-nowrap">
                {companion.xp}/{companion.xpToNextLevel} XP
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-rose-400/25 bg-rose-500/8 overflow-hidden">
        <button
          type="button"
          onClick={() => setCrisisOpen((open) => !open)}
          className="coach-crisis-toggle w-full flex items-center justify-between gap-2 px-3 py-2 text-left"
          aria-expanded={crisisOpen}
        >
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold text-rose-100">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            In crisis? Get immediate help
          </span>
          <ChevronDown className={`w-4 h-4 text-rose-200/80 shrink-0 transition-transform ${crisisOpen ? 'rotate-180' : ''}`} />
        </button>
        {crisisOpen && (
          <div className="px-3 pb-3 pt-0 space-y-2 border-t border-rose-400/20">
            <p className="text-[11px] text-rose-100/90 leading-[1.5] pt-2">
              Astra cannot keep you safe in an emergency. If you might hurt yourself, contact a helpline now.
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
        )}
      </div>
      </div>

      <div className="chat-messages py-4 pr-1 scrollbar-none">
        {messages.map((m, idx) => (
          <React.Fragment key={idx}>
            {renderMessage(m, idx)}
            {idx === lastAstraIndex && !isLoading && (
              <PromptChipRow chips={PROMPT_CHIPS} disabled={isLoading} onSelect={sendMessage} />
            )}
          </React.Fragment>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 pl-11 text-xs text-muted">
            <Loader2 className="w-4 h-4 animate-spin text-gold shrink-0" />
            <span>Astra is thinking…</span>
          </div>
        )}
        <div ref={messagesEndRef} aria-hidden />
      </div>

      <div className="chat-input-area">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Chat about your routine, sleep, or stress..."
            className="aura-input flex-1 text-xs"
            aria-label="Message to Astra"
          />
          <button type="submit" disabled={isLoading || !inputMessage.trim()} className="btn-primary p-3 shrink-0" aria-label="Send message">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
