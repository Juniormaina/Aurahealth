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
      <div className="bg-white border border-slate-200 p-2.5 rounded-xl shadow-xl text-xs space-y-1">
        <p className="font-bold text-slate-800 border-b border-slate-100 pb-1">{label}</p>
        <div className="flex items-center gap-2 text-rose-500 font-semibold">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          <span>Health Integrity: {payload[0]?.value}%</span>
        </div>
        <div className="flex items-center gap-2 text-cyan-600 font-semibold">
          <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
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
      colors: ['#71C7EC', '#FFD700', '#10b981'],
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
      case 'joyful': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'energetic': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'focused': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-purple-100 text-purple-700 border-purple-200';
    }
  };

  const currentStageInfo = EVOLUTION_STAGES_INFO.find((s) => s.stage === companion.stage) || EVOLUTION_STAGES_INFO[1];

  return (
    <div className="aura-module-card p-6 relative overflow-hidden">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getStageEmoji(companion.stage)}</span>
            <h2 className="text-2xl font-black text-slate-800">{companion.name}</h2>
            <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold capitalize ${getMoodBadgeColor(companion.mood)}`}>
              Mood: {companion.mood}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-bold">
              Health Pass ID #{companion.tokenId}
            </span>
            <span>• Verifiable Wellness Companion</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCheckin}
            className="btn-primary text-xs"
          >
            <Sparkles className="w-4 h-4" />
            Report Health Log
          </button>
        </div>
      </div>

      {/* Main Companion Display Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
        {/* Companion Visual Box (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-50 rounded-2xl p-6 border border-slate-200 relative aura-module-card">
          {/* Element Badge */}
          <div className="absolute top-3 left-3 bg-teal-50 text-teal-600 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-teal-200 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-teal-500" />
            Element: {companion.element}
          </div>

          {/* Evolution Stage Badge */}
          <div className="absolute top-3 right-3 bg-rose-50 text-rose-600 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-rose-200">
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
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-400 via-amber-400 to-cyan-400 blur-xl opacity-30 animate-pulse" />

            {/* Avatar Graphic */}
            <div className="relative w-44 h-44 rounded-full border-4 border-white bg-slate-100 overflow-hidden shadow-lg flex items-center justify-center">
              <img
                src={companion.imageUrl}
                alt={companion.name}
                className="w-full h-full object-cover"
              />
              {/* Overlay Interactive Heart */}
              {isInteracting && (
                <div className="absolute inset-0 flex items-center justify-center bg-rose-900/50 backdrop-blur-xs animate-bounce">
                  <Heart className="w-16 h-16 text-rose-300 fill-rose-400" />
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-500 text-center italic mb-4">
            "Click Astra to interact and boost happiness!"
          </p>

          {/* Feeding Action Controls */}
          <div className="w-full pt-4 border-t border-slate-200">
            <div className="text-xs text-slate-600 font-semibold mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-amber-500" /> Feed Astra (Uses Cowries)
              </span>
              <span className="text-amber-600 font-bold">🐚 {cowriesBalance} Balance</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onFeedCompanion(25, 'vitality')}
                disabled={cowriesBalance < 25}
                className="btn-ghost text-xs justify-between disabled:opacity-50"
              >
                <span>Aether Elixir</span>
                <span className="text-amber-600 font-bold text-[11px]">-25 🐚</span>
              </button>
              <button
                onClick={() => onFeedCompanion(40, 'harmony')}
                disabled={cowriesBalance < 40}
                className="btn-ghost text-xs justify-between disabled:opacity-50"
              >
                <span>Cosmic Treat</span>
                <span className="text-amber-600 font-bold text-[11px]">-40 🐚</span>
              </button>
            </div>
          </div>
        </div>

        {/* Companion Stats & Evolution Progress (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Sub Tab Switcher */}
          <div className="flex border-b border-slate-200 space-x-4 sm:space-x-6 text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setActiveTab('stats')}
              className={`pb-2 transition-colors whitespace-nowrap ${
                activeTab === 'stats' ? 'text-teal-600 border-b-2 border-teal-500' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Vitality & Attributes
            </button>
            <button
              onClick={() => setActiveTab('trends')}
              className={`pb-2 transition-colors whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'trends' ? 'text-teal-600 border-b-2 border-teal-500' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-teal-500" />
              <span>30-Day Trends</span>
            </button>
            <button
              onClick={() => setActiveTab('evolution')}
              className={`pb-2 transition-colors whitespace-nowrap ${
                activeTab === 'evolution' ? 'text-teal-600 border-b-2 border-teal-500' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Evolution Roadmap
            </button>
            <button
              onClick={() => setActiveTab('cosmetics')}
              className={`pb-2 transition-colors whitespace-nowrap ${
                activeTab === 'cosmetics' ? 'text-teal-600 border-b-2 border-teal-500' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Equipped Assets ({companion.equippedCosmetics.length})
            </button>
          </div>

          {activeTab === 'stats' && (
            <div className="space-y-4">
              {/* Level & XP Bar */}
              <div className="aura-module-card p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-bold text-slate-800">Level {companion.level}</span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    {companion.xp} / {companion.xpToNextLevel} XP
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (companion.xp / companion.xpToNextLevel) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Health Gauge */}
              <div className="aura-module-card p-3.5">
                <div className="flex justify-between items-center text-xs font-semibold mb-1">
                  <span className="text-rose-600 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> Health Integrity
                  </span>
                  <span className="text-slate-800">{companion.health}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: `${companion.health}%` }} />
                </div>
              </div>

              {/* Vitality Gauge */}
              <div className="aura-module-card p-3.5">
                <div className="flex justify-between items-center text-xs font-semibold mb-1">
                  <span className="text-cyan-600 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-500" /> Vitality
                  </span>
                  <span className="text-slate-800">{companion.vitality}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${companion.vitality}%` }} />
                </div>
              </div>

              {/* Harmony Gauge */}
              <div className="aura-module-card p-3.5">
                <div className="flex justify-between items-center text-xs font-semibold mb-1">
                  <span className="text-purple-600 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-purple-500" /> Harmony
                  </span>
                  <span className="text-slate-800">{companion.harmony}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: `${companion.harmony}%` }} />
                </div>
              </div>

              {/* 30-Day Trend Quick Sparkline Preview */}
              <div className="aura-module-card p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-rose-100 text-rose-500">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <span>30-Day Health & Vitality Curve</span>
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.2 rounded font-mono font-bold">
                        +18% Growth
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      30d Avg Health: <strong className="text-rose-600">{avgHealth30d}%</strong> | Vitality: <strong className="text-cyan-600">{avgVitality30d}%</strong>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('trends')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 transition-all flex items-center gap-1 shrink-0"
                >
                  <span>Detailed Chart</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick Minigame Trigger */}
              <div className="pt-2 flex items-center justify-between bg-rose-50 p-3 rounded-xl border border-rose-200 aura-module-card">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <div>
                    <div className="text-xs font-bold text-slate-800">Daily Adherence Loot Wheel</div>
                    <div className="text-[11px] text-slate-500">Spin for care passes, Cowries & XP</div>
                  </div>
                </div>
                <button
                  onClick={onOpenWheel}
                  className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-xs px-3.5 py-1.5 rounded-lg transition-colors"
                >
                  Spin Wheel
                </button>
              </div>

              {/* Health Pass Digital Identity Badge */}
              <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 flex items-center justify-between text-xs shadow-sm aura-module-card">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600 border border-emerald-200 font-bold text-base">
                    🪪
                  </div>
                  <div>
                    <div className="font-black text-slate-800 flex items-center gap-2">
                      <span>Verified Health Pass</span>
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.2 rounded-full font-extrabold border border-emerald-200">
                        Level {companion.level} Active
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Frictionless Digital Health Pass • {companion.streakDays}-Day Unbroken Adherence
                    </p>
                  </div>
                </div>
              </div>

              {/* Gentle Push Notification Reminder Status */}
              <div className="aura-module-card p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span>Streak Retention Alert Active</span>
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.2 rounded font-mono">
                        {companion.streakDays}d Streak
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">Evening Nudge: 08:30 PM prior to midnight reset</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="space-y-4">
              {/* 30-Day Metric Header KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="aura-module-card p-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold mb-1">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                    <span>Avg Health</span>
                  </div>
                  <div className="text-lg font-black text-slate-800">{avgHealth30d}%</div>
                  <div className="text-[10px] text-rose-500 font-medium">30-day average</div>
                </div>

                <div className="aura-module-card p-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Avg Vitality</span>
                  </div>
                  <div className="text-lg font-black text-slate-800">{avgVitality30d}%</div>
                  <div className="text-[10px] text-cyan-500 font-medium">30-day average</div>
                </div>

                <div className="aura-module-card p-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold mb-1">
                    <Activity className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Adherence Rate</span>
                  </div>
                  <div className="text-lg font-black text-slate-800">96.8%</div>
                  <div className="text-[10px] text-emerald-500 font-medium">{companion.streakDays}d active streak</div>
                </div>

                <div className="aura-module-card p-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold mb-1">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                    <span>Net Growth</span>
                  </div>
                  <div className="text-lg font-black text-emerald-600">+18.4%</div>
                  <div className="text-[10px] text-slate-500 font-medium">Over last 30 days</div>
                </div>
              </div>

              {/* Interactive 30-Day Trend Area Chart */}
              <div className="aura-module-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-teal-500" />
                      <span>30-Day Health & Vitality Progression</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Daily tracking of companion's status derived from verified health check-ins
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-semibold">
                    <span className="flex items-center gap-1 text-rose-500">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> Health
                    </span>
                    <span className="flex items-center gap-1 text-cyan-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block"></span> Vitality
                    </span>
                  </div>
                </div>

                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorVitality" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: '#64748b', fontSize: 10 }}
                        stroke="#cbd5e1"
                        interval={5}
                      />
                      <YAxis
                        domain={[30, 100]}
                        tick={{ fill: '#64748b', fontSize: 10 }}
                        stroke="#cbd5e1"
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
                        stroke="#06b6d4"
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
              <div className="bg-teal-50 p-3.5 rounded-xl border border-teal-200 text-xs text-slate-600 flex items-start gap-3 aura-module-card">
                <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 block mb-0.5">30-Day Trajectory Summary:</span>
                  <span>
                    Astra's health integrity and vitality have steadily increased over the last 30 days due to unbroken daily habit logging ({companion.streakDays} consecutive days). Consistent routine maintenance prevents health decay and yields bonus Cowries!
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'evolution' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Astra evolves dynamically as you maintain verified health check-ins.
              </p>
              <div className="space-y-2">
                {EVOLUTION_STAGES_INFO.map((stg) => {
                  const isCurrent = stg.stage === companion.stage;
                  const isUnlocked = companion.level >= stg.minLevel;
                  return (
                    <div
                      key={stg.stage}
                      className={`aura-module-card p-3 flex items-center justify-between text-xs transition-colors ${
                        isCurrent
                          ? 'border-teal-400'
                          : isUnlocked
                          ? 'border-slate-200'
                          : 'border-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{stg.icon}</span>
                        <div>
                          <div className="font-bold flex items-center gap-2 text-slate-800">
                            {stg.stage}
                            {isCurrent && (
                              <span className="bg-teal-500 text-white text-[10px] px-1.5 py-0.2 rounded font-mono">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">{stg.desc}</div>
                        </div>
                      </div>
                      <div className="text-right font-mono text-[11px] text-slate-500">
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
              <p className="text-xs text-slate-500">
                Cosmetic traits and milestone badges attached to your Companion.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {companion.equippedCosmetics.map((item, idx) => (
                  <div key={idx} className="aura-module-card p-3 flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <div>
                      <div className="text-xs font-bold text-slate-800">{item}</div>
                      <div className="text-[10px] text-emerald-600">Verified Trait</div>
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
