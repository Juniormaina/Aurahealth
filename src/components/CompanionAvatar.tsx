import React, { useState } from 'react';
import { HealthCompanion } from '../types';
import { EVOLUTION_STAGES_INFO } from '../data/initialData';
import { Heart, Zap, Sparkles, Shield, ChevronRight, Award, Utensils, RefreshCw, Flame, TrendingUp, Calendar, Activity } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import confetti from 'canvas-confetti';

interface CompanionAvatarProps {
  companion: HealthCompanion;
  cowriesBalance: number;
  onFeedCompanion: (cost: number, stat: 'health' | 'vitality' | 'harmony') => void;
  onOpenCheckin: () => void;
  onOpenWheel: () => void;
}

const TrendTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-xl shadow-2xl text-xs space-y-1 backdrop-blur-md">
        <p className="font-bold text-white border-b border-slate-800 pb-1">{label}</p>
        <div className="flex items-center gap-2 text-rose-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          <span>Health Integrity: {payload[0]?.value}%</span>
        </div>
        <div className="flex items-center gap-2 text-cyan-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>Vitality: {payload[1]?.value}%</span>
        </div>
      </div>
    );
  }
  return null;
};

export const CompanionAvatar: React.FC<CompanionAvatarProps> = ({
  companion,
  cowriesBalance,
  onFeedCompanion,
  onOpenCheckin,
  onOpenWheel,
}) => {
  const [isInteracting, setIsInteracting] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'trends' | 'evolution' | 'cosmetics'>('stats');

  // Generate 30-day health and vitality historical trend dataset
  const generate30DayTrend = (currHealth: number, currVitality: number) => {
    const data = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      const progress = (30 - i) / 30;
      // Smooth curve ending at exact current values on day 30 (i = 0)
      const h = i === 0 ? currHealth : Math.min(100, Math.max(50, Math.round(62 + (currHealth - 62) * progress + Math.sin(i * 0.7) * 3)));
      const v = i === 0 ? currVitality : Math.min(100, Math.max(45, Math.round(58 + (currVitality - 58) * progress + Math.cos(i * 0.8) * 4)));
      data.push({ date: label, day: 30 - i, health: h, vitality: v });
    }
    return data;
  };

  const trendData = generate30DayTrend(companion.health, companion.vitality);
  const avgHealth30d = Math.round(trendData.reduce((acc, c) => acc + c.health, 0) / trendData.length);
  const avgVitality30d = Math.round(trendData.reduce((acc, c) => acc + c.vitality, 0) / trendData.length);

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
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
              Health Pass ID #{companion.tokenId}
            </span>
            <span>• Verifiable Wellness Companion</span>
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
          <div className="flex border-b border-slate-800 space-x-4 sm:space-x-6 text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setActiveTab('stats')}
              className={`pb-2 transition-colors whitespace-nowrap ${
                activeTab === 'stats' ? 'text-rose-400 border-b-2 border-rose-500' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Vitality & Attributes
            </button>
            <button
              onClick={() => setActiveTab('trends')}
              className={`pb-2 transition-colors whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'trends' ? 'text-rose-400 border-b-2 border-rose-500' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
              <span>30-Day Trends</span>
            </button>
            <button
              onClick={() => setActiveTab('evolution')}
              className={`pb-2 transition-colors whitespace-nowrap ${
                activeTab === 'evolution' ? 'text-rose-400 border-b-2 border-rose-500' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Evolution Roadmap
            </button>
            <button
              onClick={() => setActiveTab('cosmetics')}
              className={`pb-2 transition-colors whitespace-nowrap ${
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

              {/* 30-Day Trend Quick Sparkline Preview */}
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>30-Day Health & Vitality Curve</span>
                      <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded font-mono font-bold">
                        +18% Growth
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      30d Avg Health: <strong className="text-rose-300">{avgHealth30d}%</strong> | Vitality: <strong className="text-cyan-300">{avgVitality30d}%</strong>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('trends')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700 transition-all flex items-center gap-1 shrink-0"
                >
                  <span>Detailed Chart</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
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

              {/* Health Pass Digital Identity Badge */}
              <div className="bg-gradient-to-r from-emerald-950/60 via-slate-950 to-teal-950/60 p-3.5 rounded-xl border border-emerald-500/30 flex items-center justify-between text-xs shadow-md">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-base">
                    🪪
                  </div>
                  <div>
                    <div className="font-black text-white flex items-center gap-2">
                      <span>Verified Health Pass</span>
                      <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.2 rounded-full font-extrabold border border-emerald-500/30">
                        Level {companion.level} Active
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Frictionless Digital Health Pass • {companion.streakDays}-Day Unbroken Adherence
                    </p>
                  </div>
                </div>
              </div>

              {/* Gentle Push Notification Reminder Status */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>Streak Retention Alert Active</span>
                      <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded font-mono">
                        {companion.streakDays}d Streak
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">Evening Nudge: 08:30 PM prior to midnight reset</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="space-y-4">
              {/* 30-Day Metric Header KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold mb-1">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                    <span>Avg Health</span>
                  </div>
                  <div className="text-lg font-black text-white">{avgHealth30d}%</div>
                  <div className="text-[10px] text-rose-400 font-medium">30-day average</div>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Avg Vitality</span>
                  </div>
                  <div className="text-lg font-black text-white">{avgVitality30d}%</div>
                  <div className="text-[10px] text-cyan-400 font-medium">30-day average</div>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold mb-1">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Adherence Rate</span>
                  </div>
                  <div className="text-lg font-black text-white">96.8%</div>
                  <div className="text-[10px] text-emerald-400 font-medium">{companion.streakDays}d active streak</div>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold mb-1">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                    <span>Net Growth</span>
                  </div>
                  <div className="text-lg font-black text-emerald-400">+18.4%</div>
                  <div className="text-[10px] text-slate-400 font-medium">Over last 30 days</div>
                </div>
              </div>

              {/* Interactive 30-Day Trend Area Chart */}
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-rose-400" />
                      <span>30-Day Health & Vitality Progression</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Daily tracking of companion's status derived from verified health check-ins
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-semibold">
                    <span className="flex items-center gap-1 text-rose-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> Health
                    </span>
                    <span className="flex items-center gap-1 text-cyan-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span> Vitality
                    </span>
                  </div>
                </div>

                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorVitality" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        stroke="#475569"
                        interval={5}
                      />
                      <YAxis
                        domain={[30, 100]}
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        stroke="#475569"
                        unit="%"
                      />
                      <Tooltip content={<TrendTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="health"
                        stroke="#f43f5e"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorHealth)"
                        name="Health Integrity"
                      />
                      <Area
                        type="monotone"
                        dataKey="vitality"
                        stroke="#22d3ee"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorVitality)"
                        name="Vitality"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Vitality Insights Summary Banner */}
              <div className="bg-gradient-to-r from-rose-950/40 via-slate-950 to-cyan-950/40 p-3.5 rounded-xl border border-rose-500/20 text-xs text-slate-300 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block mb-0.5">30-Day Trajectory Summary:</span>
                  <span>
                    Astra's health integrity and vitality have steadily increased over the last 30 days due to unbroken daily habit logging ({companion.streakDays} consecutive days). Consistent routine maintenance prevents health decay and yields bonus Cowries!
                  </span>
                </div>
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
