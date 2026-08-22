import React, { useState } from 'react';
import { Flame, Coins, Sparkles, Trophy, ChevronDown, Heart, Droplets, Moon, Activity, Pill, Star } from 'lucide-react';
import { HealthCompanion, EconomyStats } from '../types';
import { CompanionAvatar } from './CompanionAvatar';
import { DailyGoalTracker } from './DailyGoalTracker';
import { OnboardingTutorial } from './OnboardingTutorial';

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
}) => {
  const [missionsExpanded, setMissionsExpanded] = useState(false);

  return (
    <div className="space-y-6">
      {/* ── Top Bar: Streak · Astra's Mood · Cowries ── */}
      <section
        aria-label="Quick stats"
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        {/* Streak */}
        <div className="aura-module-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-[4px] bg-ivory border border-line flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 text-gold" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-muted uppercase tracking-wide">Streak</div>
            <div className="aura-highlight-number">{stats.currentStreak}<span className="text-sm font-bold text-muted ml-1">days</span></div>
          </div>
        </div>

        {/* Astra's Mood */}
        <div className="aura-module-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-[4px] bg-ivory border border-line flex items-center justify-center shrink-0 text-xl">
            {MOOD_EMOJI[companion.mood]}
          </div>
          <div>
            <div className="text-[11px] font-semibold text-muted uppercase tracking-wide">Astra's Mood</div>
            <div className="text-base font-bold text-navy capitalize leading-tight">{companion.mood}</div>
            <div className="text-[11px] text-muted">{companion.stage}</div>
          </div>
        </div>

        {/* Cowries Balance */}
        <div className="aura-module-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-[4px] bg-ivory border border-line flex items-center justify-center shrink-0 text-xl">
            🐚
          </div>
          <div>
            <div className="text-[11px] font-semibold text-muted uppercase tracking-wide">Cowries</div>
            <div className="aura-highlight-number">{stats.cowriesBalance}</div>
          </div>
        </div>

        {/* Total XP */}
        <div className="aura-module-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-[4px] bg-ivory border border-line flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 text-harmony" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-muted uppercase tracking-wide">Total XP</div>
            <div className="aura-highlight-number">{stats.totalXp}</div>
          </div>
        </div>
      </section>

      {/* ── Middle: Unified Habits Tracker + Astra Companion ── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Habits Tracker (spans 2 columns) */}
        <div className="lg:col-span-2">
          <DailyGoalTracker
            key={new Date().toISOString().slice(0, 10)}
            onOpenCheckin={onOpenCheckin}
            streakDays={companion.streakDays}
            isFreshStart={isFreshStart}
            onGoalUpdated={onGoalUpdated}
          />
        </div>

        {/* Astra Companion */}
        <div className="lg:col-span-1">
          <CompanionAvatar
            companion={companion}
            cowriesBalance={stats.cowriesBalance}
            onFeedCompanion={onFeedCompanion}
            onOpenCheckin={onOpenCheckin}
            onOpenWheel={onOpenWheel}
          />
        </div>
      </section>

      {/* ── Bottom: Missions & Rewards (expandable) ── */}
      <section className="aura-module-card overflow-hidden">
        <button
          type="button"
          onClick={() => setMissionsExpanded((v) => !v)}
          className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-ivory transition-colors"
          aria-expanded={missionsExpanded}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[4px] bg-ivory border border-line flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5 text-harmony" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-navy">Missions & Rewards</h3>
              <p className="text-xs text-muted leading-[1.6]">
                Complete first-day missions, then explore the rewards wheel & hub.
              </p>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-muted transition-transform duration-300 ${missionsExpanded ? 'rotate-180' : ''}`}
          />
        </button>

        <div className={`progressive-content ${missionsExpanded ? 'expanded' : ''}`}>
          <div className="px-4 pb-4 pt-1 border-t border-line">
            <OnboardingTutorial
              userName={userName}
              onOpenCheckin={onOpenCheckin}
              onNavigateTab={onNavigateTab}
              onMissionCompleted={onMissionCompleted}
              streakDays={companion.streakDays}
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigateTab('wheel')}
                className="btn-secondary"
              >
                <Sparkles className="w-4 h-4" />
                Open Rewards Hub
              </button>
              <button
                onClick={onOpenCheckin}
                className="btn-primary"
              >
                <Coins className="w-4 h-4" />
                Daily Check-In
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
