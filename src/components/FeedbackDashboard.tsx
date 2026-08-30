import React, { useState } from 'react';
import { HealthCompanion, SoulboundBadge, EconomyStats, HealthCheckIn } from '../types';
import { Trophy, Flame, Target, Compass, Sparkles, CheckCircle2, Award, Shield, ArrowRight, Calendar, TrendingUp, Activity, Droplets, Moon, Zap } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { CommunityLeaderboard } from './CommunityLeaderboard';
import { StreakReminderManager } from './StreakReminderManager';

interface FeedbackDashboardProps {
  companion: HealthCompanion;
  stats: EconomyStats;
  badges: SoulboundBadge[];
  checkIns: HealthCheckIn[];
  onOpenCheckin: () => void;
  onOpenSponsors: () => void;
  userName?: string;
  onShowToast?: (msg: string) => void;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1.5">
        <p className="font-extrabold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-1 flex items-center justify-between gap-4">
          <span>{data.date} ({data.day})</span>
          <span className="text-emerald-500 font-mono font-bold">Score: {data.score}/100</span>
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
            <span>Sleep: <strong>{data.sleep} hrs</strong></span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block"></span>
            <span>Water: <strong>{data.water} oz</strong></span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
            <span>Active: <strong>{data.activity} mins</strong></span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block"></span>
            <span>Mood: <strong>{data.mood}/5</strong></span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const FeedbackDashboard: React.FC<FeedbackDashboardProps> = ({
  companion,
  stats,
  badges,
  checkIns,
  onOpenCheckin,
  onOpenSponsors,
  userName = 'Health Pioneer',
  onShowToast,
}) => {
  const [metricMode, setMetricMode] = useState<'score' | 'sleep' | 'water' | 'activity'>('score');
  const [chartTimeframe, setChartTimeframe] = useState<'7d' | '14d'>('7d');

  // Generate trend dataset merging real checkIns with weekly time series baseline
  const generateChartData = () => {
    const days7 = [
      { day: 'Mon', date: 'Jul 19', score: 82, sleep: 6.8, water: 54, activity: 25, mood: 4 },
      { day: 'Tue', date: 'Jul 20', score: 88, sleep: 7.2, water: 64, activity: 30, mood: 4 },
      { day: 'Wed', date: 'Jul 21', score: 91, sleep: 8.0, water: 72, activity: 40, mood: 5 },
      { day: 'Thu', date: 'Jul 22', score: 86, sleep: 7.0, water: 60, activity: 25, mood: 4 },
      { day: 'Fri', date: 'Jul 23', score: 94, sleep: 7.8, water: 68, activity: 45, mood: 5 },
      { day: 'Sat', date: 'Jul 24', score: 98, sleep: 8.2, water: 80, activity: 50, mood: 5 },
      { day: 'Sun', date: 'Jul 25', score: 96, sleep: 7.5, water: 76, activity: 35, mood: 5 },
    ];

    const days14 = [
      { day: 'W1 M', date: 'Jul 12', score: 75, sleep: 6.2, water: 48, activity: 20, mood: 3 },
      { day: 'W1 T', date: 'Jul 13', score: 78, sleep: 6.5, water: 52, activity: 25, mood: 3 },
      { day: 'W1 W', date: 'Jul 14', score: 80, sleep: 7.0, water: 58, activity: 30, mood: 4 },
      { day: 'W1 T', date: 'Jul 15', score: 84, sleep: 7.1, water: 60, activity: 30, mood: 4 },
      { day: 'W1 F', date: 'Jul 16', score: 82, sleep: 6.8, water: 55, activity: 25, mood: 4 },
      { day: 'W1 S', date: 'Jul 17', score: 89, sleep: 7.6, water: 64, activity: 35, mood: 4 },
      { day: 'W1 S', date: 'Jul 18', score: 87, sleep: 7.4, water: 62, activity: 30, mood: 4 },
      ...days7,
    ];

    const baseData = chartTimeframe === '7d' ? [...days7] : [...days14];

    // Inject recent real check-in entries if present
    if (checkIns && checkIns.length > 0) {
      const sortedCheckins = [...checkIns].reverse();
      sortedCheckins.forEach((ci, index) => {
        const targetIdx = Math.max(0, baseData.length - sortedCheckins.length + index);
        if (baseData[targetIdx]) {
          baseData[targetIdx].score = ci.aiAttestationScore || baseData[targetIdx].score;
          baseData[targetIdx].sleep = ci.sleepHours || baseData[targetIdx].sleep;
          baseData[targetIdx].water = ci.waterOz || baseData[targetIdx].water;
          baseData[targetIdx].activity = ci.activityMinutes || baseData[targetIdx].activity;
          baseData[targetIdx].mood = ci.moodRating || baseData[targetIdx].mood;
        }
      });
    }

    return baseData;
  };

  const chartData = generateChartData();
  const avgScore = Math.round(chartData.reduce((acc, curr) => acc + curr.score, 0) / chartData.length);
  const maxScore = Math.max(...chartData.map((d) => d.score));

  return (
    <div className="space-y-6">
      {/* Routledge Framework Header */}
      <div className="aura-module-card-dark p-6 relative overflow-hidden backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-rose-500/20 text-rose-300 p-2 rounded-xl border border-rose-500/30">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Adherence Feedback Surface</h2>
            <p className="text-xs text-slate-400">
              Routledge Gamification Framework: Real-time progress guidance for sustained health habits.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Question 1: Where am I going? */}
          <div className="aura-module-card p-5 relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-rose-400 font-extrabold text-xs mb-2">
                <Target className="w-4 h-4" /> 1. WHERE AM I GOING?
              </div>
              <h3 className="text-lg font-black text-white mb-1">7-Day Adherence Milestone</h3>
              <p className="text-xs text-slate-400 mb-4">
                Maintain 2 more daily check-ins to evolve Astra to <strong className="text-amber-300">Spark Companion</strong> and unlock the <strong className="text-emerald-300">7-Day Novice Milestone Badge</strong>.
              </p>
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                <span>Streak Target</span>
                <span>{stats.currentStreak} / 7 Days</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-3">
                <div
                  className="bg-gradient-to-r from-rose-500 to-amber-400 h-full rounded-full"
                  style={{ width: `${(stats.currentStreak / 7) * 100}%` }}
                />
              </div>
              <button
                onClick={onOpenCheckin}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                Log Today's Health <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Question 2: How am I doing? */}
          <div className="aura-module-card p-5 relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs mb-2">
                <Trophy className="w-4 h-4" /> 2. HOW AM I DOING?
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400">Current Streak</div>
                  <div className="text-lg font-black text-orange-400 flex items-center justify-center gap-1">
                    <Flame className="w-4 h-4 fill-orange-500" /> {stats.currentStreak}d
                  </div>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400">Total Check-Ins</div>
                  <div className="text-lg font-black text-emerald-400">{companion.totalCheckIns}</div>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                You are in the top <strong className="text-emerald-300">5% of community adherence</strong>!
              </p>
            </div>
            <div className="mt-3">
              <div className="text-[11px] text-slate-400 font-semibold mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" /> 7-Day Matrix
              </div>
              <div className="flex gap-1.5 justify-between">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                  <div
                    key={idx}
                    className={`flex-1 py-1.5 rounded-lg text-center font-bold text-[10px] border ${
                      idx < stats.currentStreak
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-900 text-slate-600 border-slate-800'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Question 3: Where to next? */}
          <div className="aura-module-card p-5 relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-extrabold text-xs mb-2">
                <Compass className="w-4 h-4" /> 3. WHERE TO NEXT?
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">Community Sponsor Unlock</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Help unlock the <strong className="text-cyan-600 dark:text-cyan-300">Vaccine Grant Pool</strong> by contributing 1 additional daily report.
              </p>
            </div>
            <div className="space-y-2">
              <button
                onClick={onOpenSponsors}
                className="btn-primary w-full justify-center text-xs"
              >
                View Community Sponsor Pools <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recharts Interactive Weekly Health Check-in Score Chart */}
      <div className="aura-module-card p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-500/30 text-rose-500">
                <TrendingUp className="w-5 h-5" />
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Weekly Health Check-In Trends</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Visualizing AI attestation scores and biometrics consistency over time
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Metric Selector Buttons */}
            <div className="flex bg-white/80 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
              <button
                onClick={() => setMetricMode('score')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  metricMode === 'score'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" /> Score (0-100)
              </button>
              <button
                onClick={() => setMetricMode('sleep')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  metricMode === 'sleep'
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5" /> Sleep (hrs)
              </button>
              <button
                onClick={() => setMetricMode('water')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  metricMode === 'water'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Droplets className="w-3.5 h-3.5" /> Water (oz)
              </button>
              <button
                onClick={() => setMetricMode('activity')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  metricMode === 'activity'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" /> Active (m)
              </button>
            </div>

            {/* Timeframe Selector */}
            <div className="flex bg-white/80 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-extrabold">
              <button
                onClick={() => setChartTimeframe('7d')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  chartTimeframe === '7d' ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setChartTimeframe('14d')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  chartTimeframe === '14d' ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                14 Days
              </button>
            </div>
          </div>
        </div>

        {/* Quick Summary Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="aura-module-card p-3.5">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Average Check-in Score</div>
            <div className="text-xl font-black text-rose-500 font-mono mt-0.5">{avgScore}/100</div>
          </div>
          <div className="aura-module-card p-3.5">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Peak Adherence Score</div>
            <div className="text-xl font-black text-emerald-500 font-mono mt-0.5">{maxScore}/100</div>
          </div>
          <div className="aura-module-card p-3.5">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Avg Sleep Duration</div>
            <div className="text-xl font-black text-indigo-500 font-mono mt-0.5">
              {(chartData.reduce((a, b) => a + b.sleep, 0) / chartData.length).toFixed(1)} hrs
            </div>
          </div>
          <div className="aura-module-card p-3.5">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Weekly Hydration Avg</div>
            <div className="text-xl font-black text-cyan-500 font-mono mt-0.5">
              {Math.round(chartData.reduce((a, b) => a + b.water, 0) / chartData.length)} oz
            </div>
          </div>
        </div>

        {/* Recharts Chart View */}
        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={metricMode === 'score' ? [50, 100] : [0, 'auto']} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />

              {metricMode === 'score' && (
                <Area
                  type="monotone"
                  dataKey="score"
                  name="Health Check-In Score"
                  stroke="#f43f5e"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#scoreGradient)"
                  dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#1e293b' }}
                  activeDot={{ r: 7, fill: '#fda4af' }}
                />
              )}

              {metricMode === 'sleep' && (
                <Area
                  type="monotone"
                  dataKey="sleep"
                  name="Sleep Hours"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#sleepGradient)"
                  dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#1e293b' }}
                  activeDot={{ r: 7, fill: '#a5b4fc' }}
                />
              )}

              {metricMode === 'water' && (
                <Area
                  type="monotone"
                  dataKey="water"
                  name="Hydration (oz)"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#waterGradient)"
                  dot={{ r: 4, fill: '#06b6d4', strokeWidth: 2, stroke: '#1e293b' }}
                  activeDot={{ r: 7, fill: '#67e8f9' }}
                />
              )}

              {metricMode === 'activity' && (
                <Area
                  type="monotone"
                  dataKey="activity"
                  name="Active Minutes"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#activityGradient)"
                  dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#1e293b' }}
                  activeDot={{ r: 7, fill: '#fde047' }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Retention & Notifications: Streak Reminders */}
      <StreakReminderManager
        currentStreak={stats.currentStreak}
        companionName={companion.name}
        companionHealth={companion.health}
        onOpenCheckin={onOpenCheckin}
        onShowToast={onShowToast}
      />

      {/* Community Features: Team Challenges & Leaderboard */}
      <CommunityLeaderboard
        userStreak={stats.currentStreak}
        userName={userName}
        userCowries={stats.cowriesBalance}
        onContributeCheckin={onOpenCheckin}
        onShowToast={onShowToast}
      />

      {/* Badges & Achievements Grid */}
      <div className="aura-module-card-dark p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" /> Milestone Badges & Verified Proofs
            </h3>
            <p className="text-xs text-slate-400">
              Verifiable digital badges awarded permanently upon reaching key health milestones.
            </p>
          </div>
          <span className="text-xs font-bold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            {badges.filter((b) => b.unlockedAt).length} / {badges.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => {
            const isUnlocked = !!badge.unlockedAt;
            return (
              <div
                key={badge.id}
                className={`aura-module-card p-4 transition-all ${
                  isUnlocked
                    ? 'border-amber-500/40'
                    : 'border-slate-900 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{isUnlocked ? '🏆' : '🔒'}</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{badge.title}</h4>
                      <span className="text-[10px] font-semibold text-amber-400 capitalize">{badge.rarity} Badge</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mb-3">{badge.description}</p>

                {isUnlocked ? (
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3 h-3" /> Unlocked on {badge.unlockedAt}
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-500 font-mono">In Progress...</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

