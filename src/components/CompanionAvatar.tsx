import React, { useState } from 'react';
import { HealthCompanion } from '../types';
import { EVOLUTION_STAGES_INFO } from '../data/initialData';
import { Heart, Zap, Sparkles, Shield, ChevronRight, Award, Utensils, RefreshCw, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CompanionAvatarProps {
  companion: HealthCompanion;
  cowriesBalance: number;
  onFeedCompanion: (cost: number, stat: 'health' | 'vitality' | 'harmony') => void;
  onOpenCheckin: () => void;
  onOpenWheel: () => void;
}

export const CompanionAvatar: React.FC<CompanionAvatarProps> = ({
  companion,
  cowriesBalance,
  onFeedCompanion,
  onOpenCheckin,
  onOpenWheel,
}) => {
  const [isInteracting, setIsInteracting] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'evolution' | 'cosmetics'>('stats');

  const handlePetCompanion = () => {
    setIsInteracting(true);
    confetti({
      particleCount: 25,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#38bdf8', '#f43f5e', '#a855f7'],
    });
    setTimeout(() => setIsInteracting(false), 1200);
  };

  const getStageEmoji = (stage: string) => {
    switch (stage) {
      case 'Egg': return '🥚';
      case 'Hatchling': return '🐣';
      case 'Spark Companion': return '⚡';
      case 'Guardian Beast': return '🐺';
      case 'Luminary Spirit': return '✨';
      case 'Celestial Sentinel': return '🌌';
      default: return '🐣';
    }
  };

  const getMoodBadgeColor = (mood: string) => {
    switch (mood) {
      case 'joyful': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'energetic': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'focused': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default: return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    }
  };

  const currentStageInfo = EVOLUTION_STAGES_INFO.find((s) => s.stage === companion.stage) || EVOLUTION_STAGES_INFO[1];

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getStageEmoji(companion.stage)}</span>
            <h2 className="text-2xl font-black text-white">{companion.name}</h2>
            <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold capitalize ${getMoodBadgeColor(companion.mood)}`}>
              Mood: {companion.mood}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Verified Digital Companion #{companion.tokenId}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCheckin}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-lg shadow-emerald-900/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Report Health Log
          </button>
        </div>
      </div>

      {/* Main Companion Display Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
        {/* Companion Visual Box (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-950/80 rounded-2xl p-6 border border-slate-800/80 relative">
          {/* Element Badge */}
          <div className="absolute top-3 left-3 bg-slate-800/80 text-cyan-300 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-slate-700/60 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Element: {companion.element}
          </div>

          {/* Evolution Stage Badge */}
          <div className="absolute top-3 right-3 bg-rose-500/20 text-rose-300 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-rose-500/30">
            {companion.stage}
          </div>

          {/* Interactive Pet Image Container */}
          <div
            onClick={handlePetCompanion}
            className={`cursor-pointer my-6 relative transition-transform duration-300 ${
              isInteracting ? 'scale-110 rotate-3' : 'hover:scale-105'
            }`}
          >
            {/* Ambient Aura Ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-cyan-500 blur-xl opacity-30 animate-pulse" />

            {/* Avatar Graphic */}
            <div className="relative w-44 h-44 rounded-full border-4 border-slate-800 bg-slate-900 overflow-hidden shadow-2xl flex items-center justify-center">
              <img
                src={companion.imageUrl}
                alt={companion.name}
                className="w-full h-full object-cover"
              />
              {/* Overlay Interactive Heart */}
              {isInteracting && (
                <div className="absolute inset-0 flex items-center justify-center bg-rose-950/60 backdrop-blur-xs animate-bounce">
                  <Heart className="w-16 h-16 text-rose-400 fill-rose-500" />
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-400 text-center italic mb-4">
            "Click Astra to interact and boost happiness!"
          </p>

          {/* Feeding Action Controls */}
          <div className="w-full pt-4 border-t border-slate-800/80">
            <div className="text-xs text-slate-300 font-semibold mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-amber-400" /> Feed Astra (Uses Cowries)
              </span>
              <span className="text-amber-300 font-bold">🐚 {cowriesBalance} Balance</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onFeedCompanion(25, 'vitality')}
                disabled={cowriesBalance < 25}
                className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs font-medium text-slate-200 py-2 px-3 rounded-xl border border-slate-700/80 transition-colors flex items-center justify-between"
              >
                <span>Aether Elixir</span>
                <span className="text-amber-300 font-bold text-[11px]">-25 🐚</span>
              </button>
              <button
                onClick={() => onFeedCompanion(40, 'harmony')}
                disabled={cowriesBalance < 40}
                className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs font-medium text-slate-200 py-2 px-3 rounded-xl border border-slate-700/80 transition-colors flex items-center justify-between"
              >
                <span>Cosmic Treat</span>
                <span className="text-amber-300 font-bold text-[11px]">-40 🐚</span>
              </button>
            </div>
          </div>
        </div>

        {/* Companion Stats & Evolution Progress (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Sub Tab Switcher */}
          <div className="flex border-b border-slate-800 space-x-6 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('stats')}
              className={`pb-2 transition-colors ${
                activeTab === 'stats' ? 'text-rose-400 border-b-2 border-rose-500' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Vitality & Attributes
            </button>
            <button
              onClick={() => setActiveTab('evolution')}
              className={`pb-2 transition-colors ${
                activeTab === 'evolution' ? 'text-rose-400 border-b-2 border-rose-500' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Evolution Roadmap
            </button>
            <button
              onClick={() => setActiveTab('cosmetics')}
              className={`pb-2 transition-colors ${
                activeTab === 'cosmetics' ? 'text-rose-400 border-b-2 border-rose-500' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Equipped Assets ({companion.equippedCosmetics.length})
            </button>
          </div>

          {activeTab === 'stats' && (
            <div className="space-y-4">
              {/* Level & XP Bar */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-bold text-white">Level {companion.level}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {companion.xp} / {companion.xpToNextLevel} XP
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-rose-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (companion.xp / companion.xpToNextLevel) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Health Gauge */}
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center text-xs font-semibold mb-1">
                  <span className="text-rose-300 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> Health Integrity
                  </span>
                  <span className="text-white">{companion.health}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: `${companion.health}%` }} />
                </div>
              </div>

              {/* Vitality Gauge */}
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center text-xs font-semibold mb-1">
                  <span className="text-cyan-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Vitality
                  </span>
                  <span className="text-white">{companion.vitality}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${companion.vitality}%` }} />
                </div>
              </div>

              {/* Harmony Gauge */}
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center text-xs font-semibold mb-1">
                  <span className="text-purple-300 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-purple-400" /> Harmony
                  </span>
                  <span className="text-white">{companion.harmony}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: `${companion.harmony}%` }} />
                </div>
              </div>

              {/* Quick Minigame Trigger */}
              <div className="pt-2 flex items-center justify-between bg-gradient-to-r from-rose-950/30 to-amber-950/30 p-3 rounded-xl border border-rose-500/20">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="text-xs font-bold text-white">Daily Adherence Loot Wheel</div>
                    <div className="text-[11px] text-slate-400">Spin for care passes, Cowries & XP</div>
                  </div>
                </div>
                <button
                  onClick={onOpenWheel}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-lg transition-colors"
                >
                  Spin Wheel
                </button>
              </div>
            </div>
          )}

          {activeTab === 'evolution' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Astra evolves dynamically as you maintain verified health check-ins.
              </p>
              <div className="space-y-2">
                {EVOLUTION_STAGES_INFO.map((stg) => {
                  const isCurrent = stg.stage === companion.stage;
                  const isUnlocked = companion.level >= stg.minLevel;
                  return (
                    <div
                      key={stg.stage}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                        isCurrent
                          ? 'bg-rose-950/40 border-rose-500/60 text-white'
                          : isUnlocked
                          ? 'bg-slate-950/40 border-slate-800 text-slate-300'
                          : 'bg-slate-950/20 border-slate-900 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{stg.icon}</span>
                        <div>
                          <div className="font-bold flex items-center gap-2">
                            {stg.stage}
                            {isCurrent && (
                              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded font-mono">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] opacity-80">{stg.desc}</div>
                        </div>
                      </div>
                      <div className="text-right font-mono text-[11px]">
                        Lvl {stg.minLevel}+
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'cosmetics' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Cosmetic traits and milestone badges attached to your Companion.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {companion.equippedCosmetics.map((item, idx) => (
                  <div key={idx} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="text-xs font-bold text-slate-200">{item}</div>
                      <div className="text-[10px] text-emerald-400">Verified Trait</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
