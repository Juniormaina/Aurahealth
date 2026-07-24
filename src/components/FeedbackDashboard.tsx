import React from 'react';
import { HealthCompanion, SoulboundBadge, EconomyStats, HealthCheckIn } from '../types';
import { Trophy, Flame, Target, Compass, Sparkles, CheckCircle2, Award, Shield, ArrowRight, Calendar } from 'lucide-react';

interface FeedbackDashboardProps {
  companion: HealthCompanion;
  stats: EconomyStats;
  badges: SoulboundBadge[];
  checkIns: HealthCheckIn[];
  onOpenCheckin: () => void;
  onOpenSponsors: () => void;
}

export const FeedbackDashboard: React.FC<FeedbackDashboardProps> = ({
  companion,
  stats,
  badges,
  checkIns,
  onOpenCheckin,
  onOpenSponsors,
}) => {
  return (
    <div className="space-y-6">
      {/* Routledge Framework Header */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Question 1: Where am I going? */}
          <div className="bg-slate-950/80 p-5 rounded-2xl border border-rose-500/30 relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-rose-400 font-extrabold text-xs mb-2">
                <Target className="w-4 h-4" /> 1. WHERE AM I GOING?
              </div>
              <h3 className="text-lg font-black text-white mb-1">7-Day Adherence Milestone</h3>
              <p className="text-xs text-slate-400 mb-4">
                Maintain 2 more daily check-ins to evolve Astra to <strong className="text-amber-300">Spark Companion</strong> and mint the <strong className="text-emerald-300">7-Day Novice Soulbound Token</strong>.
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
          <div className="bg-slate-950/80 p-5 rounded-2xl border border-amber-500/30 relative overflow-hidden flex flex-col justify-between">
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
                You are in the top <strong className="text-emerald-300">5% of community adherence</strong> on Avalanche Fuji Subnet!
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
          <div className="bg-slate-950/80 p-5 rounded-2xl border border-cyan-500/30 relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-xs mb-2">
                <Compass className="w-4 h-4" /> 3. WHERE TO NEXT?
              </div>
              <h3 className="text-lg font-black text-white mb-1">Community Sponsor Unlock</h3>
              <p className="text-xs text-slate-400 mb-3">
                Help unlock the <strong className="text-cyan-300">15 AVAX Vaccine Grant Pool</strong> by contributing 1 additional daily report.
              </p>
            </div>
            <div className="space-y-2">
              <button
                onClick={onOpenSponsors}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                View Community Sponsor Pools <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Soulbound Badges & Achievements Grid */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" /> Soulbound Badges & Milestones (SBT)
            </h3>
            <p className="text-xs text-slate-400">
              Non-transferable ERC-721 tokens minted permanently to your Avalanche wallet upon key milestones.
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
                className={`p-4 rounded-xl border transition-all ${
                  isUnlocked
                    ? 'bg-slate-950/80 border-amber-500/40 shadow-lg'
                    : 'bg-slate-950/30 border-slate-900 opacity-60'
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
