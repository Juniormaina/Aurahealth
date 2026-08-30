import React, { useMemo, useState } from 'react';
import { Flame, Sparkles, Trophy, ChevronDown, Star, Calendar } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { HealthCompanion, EconomyStats } from '../types';
import { CompanionAvatar } from './CompanionAvatar';
import { DailyGoalTracker } from './DailyGoalTracker';
import { OnboardingTutorial } from './OnboardingTutorial';
import { QuickLogBar, QuickLogKind } from './QuickLogBar';
import { ImpactDashboard } from './ImpactDashboard';
import { UpgradePrompt } from './UpgradePrompt';
import { moodAdaptiveSession, SessionLanguageId, VALUE_PROPS } from '../content/valueProps';
import { IconBadge } from './ui/IconBadge';

interface DashboardHomeProps {
  companion: HealthCompanion;
  stats: EconomyStats;
  userName: string;
  onOpenCheckin: () => void;
  onNavigateTab: (tab: string) => void;
  onMissionCompleted: (addedXp: number, addedCowries: number, missionId: string) => void;
  onFeedCompanion: (cost: number, stat: 'health' | 'vitality' | 'harmony') => void;
  onOpenWheel: () => void;
  isFreshStart: boolean;
  onGoalUpdated: (addedXp: number, addedCowries: number) => void;
  onQuickLog?: (kind: QuickLogKind) => void;
  astraReaction?: string | null;
  userId: string;
  showUpgrade: boolean;
  onUpgrade: () => void;
  sessionLanguage: SessionLanguageId;
}

const MOOD_EMOJI: Record<HealthCompanion['mood'], string> = {
  joyful: '😊',
  energetic: '⚡',
  sleepy: '😴',
  focused: '🎯',
  eager: '🌟',
};

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  companion,
  stats,
  userName,
  onOpenCheckin,
  onNavigateTab,
  onMissionCompleted,
  onFeedCompanion,
  onOpenWheel,
  isFreshStart,
  onGoalUpdated,
  onQuickLog,
  astraReaction,
  userId,
  showUpgrade,
  onUpgrade,
  sessionLanguage,
}) => {
  const [missionsExpanded, setMissionsExpanded] = useState(false);
  const xpPct = Math.min(100, (companion.xp / Math.max(1, companion.xpToNextLevel)) * 100);
  const adherencePct = Math.min(100, Math.round((companion.totalCheckIns % 4) / 4 * 100) || Math.min(100, companion.health));

  const history = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (13 - i));
      const wave = Math.round(55 + companion.vitality * 0.3 + Math.sin(i / 2) * 8);
      return {
        day: d.toLocaleDateString([], { weekday: 'short' }),
        adherence: Math.min(100, Math.max(40, wave)),
      };
    });
  }, [companion.vitality]);

  const session = moodAdaptiveSession(companion.mood, sessionLanguage);

  return (
    <div className="space-y-6">
      {showUpgrade && <UpgradePrompt onUpgrade={onUpgrade} />}
      <p className="text-sm text-slate-400 leading-[1.6]">{VALUE_PROPS.heroSubtext}</p>
      <section className="aura-module-card astra-hero p-6 relative overflow-hidden">
        <div className="flex flex-col items-center text-center relative z-10">
          <div className="relative">
            <div className="w-28 h-28 rounded-full border-2 border-cyan-300/40 overflow-hidden bg-white/5 shadow-[0_0_32px_rgba(34,211,238,0.25)]">
              <img src={companion.imageUrl} alt={companion.name} className="w-full h-full object-cover" />
            </div>
            {astraReaction && (
              <div className="astra-reaction-bubble absolute -top-3 -right-6 bg-amber-400 text-navy text-xs font-bold px-2.5 py-1 rounded-full">
                {astraReaction}
              </div>
            )}
          </div>
          <h2 className="mt-3 text-2xl font-bold text-white font-display">{companion.name}</h2>
          <p className="text-sm text-slate-400 font-display">
            {MOOD_EMOJI[companion.mood]} {companion.mood} · {companion.stage} · Lv {companion.level}
          </p>
          <div className="w-full max-w-xl mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300">Astra’s Vitality / Level</span>
                <span className="text-cyan-300 font-bold">{companion.vitality}% · {xpPct.toFixed(0)}% XP</span>
              </div>
              <div className="aura-progress h-2.5">
                <div className="aura-progress-bar-harmony" style={{ width: `${companion.vitality}%` }} />
              </div>
              <div className="aura-progress h-1.5 mt-1.5">
                <div className="aura-progress-bar-gold" style={{ width: `${xpPct}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300">Daily Adherence</span>
                <span className="text-amber-300 font-bold">{adherencePct}%</span>
              </div>
              <div className="aura-progress h-2.5">
                <div className="aura-progress-bar" style={{ width: `${adherencePct}%` }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Quick stats" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="aura-module-card p-3 sm:p-4 flex items-center gap-3 min-w-0">
          <IconBadge icon={Flame} variant="teal" />
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Streak</div>
            <div className="aura-highlight-number tabular-nums">{stats.currentStreak}<span className="text-sm font-bold text-slate-400 ml-1">days</span></div>
          </div>
        </div>
        <div className="aura-module-card p-3 sm:p-4 flex items-center gap-3 min-w-0">
          <IconBadge variant="violet">{MOOD_EMOJI[companion.mood]}</IconBadge>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Astra's Mood</div>
            <div className="text-base font-bold text-white capitalize leading-tight">{companion.mood}</div>
          </div>
        </div>
        <div className="aura-module-card p-3 sm:p-4 flex items-center gap-3 min-w-0">
          <IconBadge icon={Calendar} variant="slate" />
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Check-ins</div>
            <div className="aura-highlight-number tabular-nums">{companion.totalCheckIns}</div>
          </div>
        </div>
        <div className="aura-module-card p-3 sm:p-4 flex items-center gap-3 min-w-0">
          <IconBadge icon={Star} variant="teal" />
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Total XP</div>
            <div className="aura-highlight-number tabular-nums">{stats.totalXp}</div>
          </div>
        </div>
      </section>

      <section className="aura-module-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 justify-between min-w-0">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-accent-secondary)]">Mood-adaptive session</div>
          <h3 className="text-base sm:text-lg font-bold text-white">{session.title} · {session.minutes} min · {session.language}</h3>
          <p className="text-sm text-slate-400 leading-[1.6] mt-1">{session.script}</p>
        </div>
        <button type="button" onClick={() => onNavigateTab('coach')} className="btn-primary text-xs shrink-0">
          Start with Astra
        </button>
      </section>

      <ImpactDashboard userId={userId} />

      <section className="aura-module-card p-5">
        <h3 className="text-sm font-bold text-white mb-4">Habit tracking history</h3>
        <div className="h-44 sm:h-48 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <defs>
                <linearGradient id="adherenceGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-harmony)" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="var(--color-harmony)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.1)" strokeDasharray="3 6" />
              <XAxis dataKey="day" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} domain={[0, 100]} width={32} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0B192C', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, color: '#fff' }}
              />
              <Area type="monotone" dataKey="adherence" stroke="var(--color-accent-secondary)" strokeWidth={2} fill="url(#adherenceGlow)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
        <div className="lg:col-span-2 min-w-0">
          <DailyGoalTracker
            key={new Date().toISOString().slice(0, 10)}
            onOpenCheckin={onOpenCheckin}
            streakDays={companion.streakDays}
            isFreshStart={isFreshStart}
            onGoalUpdated={onGoalUpdated}
          />
        </div>
        <div className="lg:col-span-1 min-w-0">
          <CompanionAvatar
            companion={companion}
            cowriesBalance={stats.cowriesBalance}
            onFeedCompanion={onFeedCompanion}
            onOpenCheckin={onOpenCheckin}
            onOpenWheel={onOpenWheel}
          />
        </div>
      </section>

      <section className="aura-module-card overflow-hidden">
        <button
          type="button"
          onClick={() => setMissionsExpanded((v) => !v)}
          className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-white/5 transition-colors"
          aria-expanded={missionsExpanded}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5 text-harmony" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Missions & Rewards</h3>
              <p className="text-xs text-slate-400 leading-[1.6]">
                Complete first-day missions, then explore the rewards wheel & hub.
              </p>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${missionsExpanded ? 'rotate-180' : ''}`}
          />
        </button>

        <div className={`progressive-content ${missionsExpanded ? 'expanded' : ''}`}>
          <div className="px-4 pb-4 pt-1 border-t border-white/10">
            <OnboardingTutorial
              userName={userName}
              onOpenCheckin={onOpenCheckin}
              onNavigateTab={onNavigateTab}
              onMissionCompleted={onMissionCompleted}
              streakDays={companion.streakDays}
              autoOpenGuide
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={() => onNavigateTab('wheel')} className="btn-ghost">
                <Sparkles className="w-4 h-4 text-[var(--color-harmony)]" />
                Open Rewards Hub
              </button>
              <button onClick={onOpenCheckin} className="btn-primary">
                <Calendar className="w-4 h-4" />
                Daily Check-In
              </button>
            </div>
          </div>
        </div>
      </section>

      {onQuickLog && <QuickLogBar onLog={onQuickLog} />}
    </div>
  );
};
