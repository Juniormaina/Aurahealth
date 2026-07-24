import React, { useState } from 'react';
import { Users, Trophy, Flame, Shield, Sparkles, Target, ArrowUpRight, CheckCircle2, HeartPulse, Droplets, Award, MessageSquare, ChevronRight, PlusCircle, Building2, Gift, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export interface GuildMember {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  guildName: string;
  streakDays: number;
  cowriesEarned: number;
  adherenceRate: number; // percentage
  badgeTitle: string;
  isCurrentUser?: boolean;
}

export interface TeamChallenge {
  id: string;
  title: string;
  description: string;
  category: 'Hydration' | 'Medication' | 'Sleep' | 'Community Care' | 'Nutrition' | 'Fitness';
  sponsorName: string;
  currentProgress: number;
  targetGoal: number;
  unit: string;
  rewardText: string;
  rewardCowries: number;
  participantsCount: number;
  isJoined: boolean;
  daysRemaining: number;
  icon: any;
  accentColor: string;
}

interface CommunityLeaderboardProps {
  userStreak: number;
  userName: string;
  userCowries: number;
  onContributeCheckin: () => void;
  onShowToast?: (msg: string) => void;
}

export const CommunityLeaderboard: React.FC<CommunityLeaderboardProps> = ({
  userStreak,
  userName,
  userCowries,
  onContributeCheckin,
  onShowToast,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'squads' | 'leaderboard'>('squads');
  const [showProposeModal, setShowProposeModal] = useState(false);

  // Global Cooperative Goal State
  const [globalGoalProgress, setGlobalGoalProgress] = useState(3870);
  const globalGoalTarget = 5000;

  // New Challenge Form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSponsor, setNewSponsor] = useState('');
  const [newCategory, setNewCategory] = useState<TeamChallenge['category']>('Community Care');
  const [newTarget, setNewTarget] = useState('500');
  const [newReward, setNewReward] = useState('150 🐚 Cowries & Community Health Voucher');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [teamChallenges, setTeamChallenges] = useState<TeamChallenge[]>([
    {
      id: 'tc-1',
      title: 'Sub-Saharan Hydration Challenge',
      description: 'Log daily water intake together to unlock the AquaLife Clean Water Grant for 150 families.',
      category: 'Hydration',
      sponsorName: 'AquaLife NGO Network',
      currentProgress: 840,
      targetGoal: 1000,
      unit: 'Log Gallons',
      rewardText: '+250 🐚 Cowries & $500 Clean Water Grant',
      rewardCowries: 250,
      participantsCount: 312,
      isJoined: true,
      daysRemaining: 4,
      icon: Droplets,
      accentColor: 'from-cyan-500 to-blue-600',
    },
    {
      id: 'tc-2',
      title: 'Maternal Adherence Sprint',
      description: 'Squad goal: complete 500 daily prenatal/iron supplement logs to fund maternal clinic care.',
      category: 'Medication',
      sponsorName: 'Global Wellness Foundation',
      currentProgress: 410,
      targetGoal: 500,
      unit: 'Verified Doses',
      rewardText: '+300 🐚 Cowries & $1,000 Clinic Care Fund',
      rewardCowries: 300,
      participantsCount: 184,
      isJoined: false,
      daysRemaining: 6,
      icon: HeartPulse,
      accentColor: 'from-rose-500 to-emerald-500',
    },
    {
      id: 'tc-3',
      title: '7-Day Sleep & Recovery Drive',
      description: 'Promote mental wellness and restorative sleep habits across community health pods.',
      category: 'Sleep',
      sponsorName: 'Aura Community Care Node',
      currentProgress: 620,
      targetGoal: 700,
      unit: 'Quality Rest Hours',
      rewardText: '+200 🐚 Cowries & Restorative Wellness Badge',
      rewardCowries: 200,
      participantsCount: 240,
      isJoined: true,
      daysRemaining: 2,
      icon: Sparkles,
      accentColor: 'from-purple-500 to-indigo-600',
    },
  ]);

  const handleGlobalPledge = () => {
    const nextVal = Math.min(globalGoalTarget, globalGoalProgress + 25);
    setGlobalGoalProgress(nextVal);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.5 },
      colors: ['#10b981', '#f59e0b', '#3b82f6'],
    });
    if (onShowToast) onShowToast(`Pledged +25 logs to the Global Cooperative Goal! Total: ${nextVal}/${globalGoalTarget}`);
  };

  const handleProposeChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const created: TeamChallenge = {
        id: `tc-${Date.now()}`,
        title: newTitle || 'Community Diabetes Adherence Drive',
        description: newDesc || 'Log daily glucose readings and medication compliance to trigger clinic vouchers.',
        category: newCategory,
        sponsorName: newSponsor || 'Regional Health Alliance',
        currentProgress: 15,
        targetGoal: parseInt(newTarget) || 500,
        unit: 'Check-In Units',
        rewardText: newReward || '+200 🐚 Cowries & Health Voucher',
        rewardCowries: 200,
        participantsCount: 1,
        isJoined: true,
        daysRemaining: 7,
        icon: Target,
        accentColor: 'from-amber-500 to-emerald-500',
      };

      setTeamChallenges((prev) => [created, ...prev]);
      setIsSubmitting(false);
      setShowProposeModal(false);
      setNewTitle('');
      setNewDesc('');
      setNewSponsor('');

      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#10b981', '#fbbf24', '#e11d48'],
      });
      if (onShowToast) onShowToast(`Cooperative challenge "${created.title}" successfully created and live!`);
    }, 800);
  };

  const leaderboards: GuildMember[] = [
    {
      id: 'u-curr',
      rank: 4,
      name: userName || 'Aura Member (You)',
      avatar: '🌟',
      guildName: 'Lagos Health Guild',
      streakDays: Math.max(1, userStreak),
      cowriesEarned: userCowries > 0 ? userCowries : 120,
      adherenceRate: 98,
      badgeTitle: 'Adherence Pioneer',
      isCurrentUser: true,
    },
    {
      id: 'u-1',
      rank: 1,
      name: 'Aisha Kwame',
      avatar: '👩🏾‍⚕️',
      guildName: 'Sub-Saharan Wellness Pod',
      streakDays: 42,
      cowriesEarned: 3850,
      adherenceRate: 100,
      badgeTitle: 'Health Master',
    },
    {
      id: 'u-2',
      rank: 2,
      name: 'Dr. Tariq Osei',
      avatar: '👨🏾‍🔬',
      guildName: 'Accra Health Guardians',
      streakDays: 31,
      cowriesEarned: 2940,
      adherenceRate: 97,
      badgeTitle: 'Community Anchor',
    },
    {
      id: 'u-3',
      rank: 3,
      name: 'Fatima Z.',
      avatar: '👩🏽',
      guildName: 'Maternal Care Collective',
      streakDays: 24,
      cowriesEarned: 2100,
      adherenceRate: 95,
      badgeTitle: 'Hydration Hero',
    },
    {
      id: 'u-5',
      rank: 5,
      name: 'Kofi Mensah',
      avatar: '👨🏾',
      guildName: 'Kumasie Wellness Node',
      streakDays: 19,
      cowriesEarned: 1680,
      adherenceRate: 92,
      badgeTitle: 'Habit Sentinel',
    },
  ];

  const handleJoinChallenge = (id: string) => {
    setTeamChallenges((prev) =>
      prev.map((tc) => {
        if (tc.id === id) {
          const joined = !tc.isJoined;
          if (joined) {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.6 },
              colors: ['#10b981', '#38bdf8', '#fbbf24'],
            });
            if (onShowToast) onShowToast(`Joined "${tc.title}"! Your daily logs now count for the team.`);
          }
          return {
            ...tc,
            isJoined: joined,
            participantsCount: joined ? tc.participantsCount + 1 : tc.participantsCount - 1,
          };
        }
        return tc;
      })
    );
  };

  const handleContributeLogToChallenge = (id: string) => {
    setTeamChallenges((prev) =>
      prev.map((tc) => {
        if (tc.id === id) {
          const nextVal = Math.min(tc.targetGoal, tc.currentProgress + 10);
          confetti({
            particleCount: 40,
            spread: 50,
            origin: { y: 0.6 },
            colors: ['#38bdf8', '#10b981'],
          });
          if (onShowToast) onShowToast(`Contributed 10 units to "${tc.title}"! Team Progress: ${nextVal}/${tc.targetGoal}`);
          return { ...tc, currentProgress: nextVal };
        }
        return tc;
      })
    );
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
      {/* Community Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-500/20 text-emerald-300 font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1">
              <Users className="w-3 h-3 text-emerald-400" /> Community Guild Dynamics
            </span>
            <span className="text-xs text-slate-400">Collaborative Healthcare</span>
          </div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span>Team Challenges & Global Leaderboard</span>
            <span className="text-xl">🏆</span>
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Join community health pods, complete team challenges together, and boost squad progress to unlock sponsor grant funds for healthcare clinics!
          </p>
        </div>

        {/* Sub-tab switcher */}
        <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 shrink-0">
          <button
            onClick={() => setActiveSubTab('squads')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'squads'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Team Challenges ({teamChallenges.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('leaderboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'leaderboard'
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Community Leaderboard</span>
          </button>
        </div>
      </div>

      {/* Sub-tab 1: Team Challenges & Cooperative Goals */}
      {activeSubTab === 'squads' && (
        <div className="space-y-6">
          {/* Global Cooperative Community Impact Banner */}
          <div className="bg-gradient-to-r from-emerald-950/80 via-slate-950 to-indigo-950/80 p-5 rounded-2xl border border-emerald-500/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/20 text-emerald-300 font-black text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-widest flex items-center gap-1">
                  <Target className="w-3 h-3 text-emerald-400" /> Global Cooperative Target
                </span>
                <span className="text-xs text-amber-300 font-bold">Sponsor Grant: $2,500 Community Clinic Voucher Fund</span>
              </div>

              <h4 className="text-lg font-black text-white leading-snug">
                Cooperative Goal: 5,000 Verified Community Health Logs
              </h4>

              <p className="text-xs text-slate-300 leading-relaxed">
                When our global community achieves 5,000 logs together, partner health networks unlock free clinic vouchers and health screening kits for all active participants!
              </p>

              {/* Cooperative Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs text-slate-300 font-extrabold font-mono">
                  <span>Community Cumulative Progress: {globalGoalProgress.toLocaleString()} / {globalGoalTarget.toLocaleString()} Logs</span>
                  <span className="text-emerald-400 font-black">{Math.round((globalGoalProgress / globalGoalTarget) * 100)}% Reached</span>
                </div>
                <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800 shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-full transition-all duration-700"
                    style={{ width: `${(globalGoalProgress / globalGoalTarget) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
              <button
                onClick={handleGlobalPledge}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 py-3 rounded-xl transition-all shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Pledge Daily Log (+25)</span>
              </button>

              <button
                onClick={() => setShowProposeModal(true)}
                className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4 text-amber-400" />
                <span>Propose Challenge</span>
              </button>
            </div>
          </div>

          {/* Active Sponsor-Backed Challenges Grid Header */}
          <div className="flex items-center justify-between pt-2">
            <h4 className="text-base font-black text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" /> Active Sponsor-Backed Challenges
            </h4>
            <span className="text-xs text-slate-400 font-semibold">{teamChallenges.length} Active Cooperative Squads</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {teamChallenges.map((tc) => {
              const IconComp = tc.icon;
              const percent = Math.round((tc.currentProgress / tc.targetGoal) * 100);
              return (
                <div
                  key={tc.id}
                  className="bg-slate-950/80 rounded-xl border border-slate-800 p-5 flex flex-col justify-between hover:border-slate-700 transition-all group relative overflow-hidden"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2 rounded-xl bg-gradient-to-tr ${tc.accentColor} text-white shadow-md`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                        {tc.daysRemaining} days left
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-white mb-1 group-hover:text-emerald-300 transition-colors">
                      {tc.title}
                    </h4>
                    <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                      {tc.description}
                    </p>

                    <div className="text-[11px] text-slate-300 font-semibold mb-1 flex justify-between">
                      <span>Sponsor: {tc.sponsorName}</span>
                      <span className="text-emerald-400">{tc.participantsCount} Members Joined</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1 mb-4">
                      <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                        <span>Progress: {tc.currentProgress} / {tc.targetGoal} {tc.unit}</span>
                        <span className="font-bold text-emerald-400">{percent}%</span>
                      </div>
                      <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full bg-gradient-to-r ${tc.accentColor} rounded-full transition-all duration-500`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-900 space-y-2">
                    <div className="text-[11px] text-amber-300 font-bold flex items-center justify-between">
                      <span>Group Reward:</span>
                      <span>{tc.rewardText}</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleJoinChallenge(tc.id)}
                        className={`flex-1 text-xs font-bold py-2 px-3 rounded-lg border transition-all ${
                          tc.isJoined
                            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/40'
                            : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {tc.isJoined ? 'Joined Squad ✓' : 'Join Team Challenge'}
                      </button>

                      {tc.isJoined && (
                        <button
                          onClick={() => handleContributeLogToChallenge(tc.id)}
                          className="bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-slate-950 text-xs font-black px-3 py-2 rounded-lg shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-1"
                          title="Contribute +10 units from your daily health check-in"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Log +10</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                🤝
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Want to start a new Health Squad for your region?</h4>
                <p className="text-[11px] text-slate-400">Connect with local clinics, friends, or family to compete together.</p>
              </div>
            </div>
            <button
              onClick={() => setShowProposeModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Propose Cooperative Goal</span>
            </button>
          </div>
        </div>
      )}

      {/* Sub-tab 2: Leaderboard */}
      {activeSubTab === 'leaderboard' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Guild / Pod</th>
                  <th className="py-3 px-4 text-center">Streak</th>
                  <th className="py-3 px-4 text-right">Cowries 🐚</th>
                  <th className="py-3 px-4 text-center">Adherence</th>
                  <th className="py-3 px-4">Title Badge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                {leaderboards.map((mem) => (
                  <tr
                    key={mem.id}
                    className={`transition-colors ${
                      mem.isCurrentUser
                        ? 'bg-indigo-950/40 border-l-4 border-indigo-500 font-bold'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-black">
                      {mem.rank === 1 ? (
                        <span className="text-amber-400 flex items-center gap-1 text-sm">🥇 #1</span>
                      ) : mem.rank === 2 ? (
                        <span className="text-slate-300 flex items-center gap-1 text-sm">🥈 #2</span>
                      ) : mem.rank === 3 ? (
                        <span className="text-amber-600 flex items-center gap-1 text-sm">🥉 #3</span>
                      ) : (
                        <span className="text-slate-400 font-mono">#{mem.rank}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{mem.avatar}</span>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{mem.name}</span>
                            {mem.isCurrentUser && (
                              <span className="bg-indigo-500/20 text-indigo-300 text-[10px] px-1.5 py-0.2 rounded font-mono">
                                YOU
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      {mem.guildName}
                    </td>

                    <td className="py-3.5 px-4 text-center font-black text-rose-400">
                      <span className="flex items-center justify-center gap-1">
                        <Flame className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                        {mem.streakDays} Days
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-black text-amber-300 font-mono">
                      {mem.cowriesEarned} 🐚
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="bg-emerald-500/10 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {mem.adherenceRate}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="bg-slate-800 text-slate-300 font-semibold px-2.5 py-1 rounded-lg border border-slate-700 text-[11px]">
                        {mem.badgeTitle}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Propose Cooperative Challenge Modal */}
      {showProposeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-xl font-black text-white mb-1 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-400" /> Propose Cooperative Goal
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Launch a sponsor-backed community challenge for your guild or region.
            </p>

            <form onSubmit={handleProposeChallenge} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Challenge Title</label>
                <input
                  type="text"
                  placeholder="e.g. Lagos Maternal Care Supplement Drive"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="Community Care">Community Care</option>
                  <option value="Medication">Medication Adherence</option>
                  <option value="Hydration">Hydration & Clean Water</option>
                  <option value="Sleep">Sleep & Rest</option>
                  <option value="Nutrition">Nutrition & Meals</option>
                  <option value="Fitness">Fitness & Activity</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Sponsor Organization</label>
                <input
                  type="text"
                  placeholder="e.g. West Africa Clinic Alliance"
                  value={newSponsor}
                  onChange={(e) => setNewSponsor(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Target Check-Ins</label>
                  <input
                    type="number"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Group Reward</label>
                  <input
                    type="text"
                    value={newReward}
                    onChange={(e) => setNewReward(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Short Description</label>
                <textarea
                  rows={2}
                  placeholder="Explain how members contribute to unlock the sponsor grant..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowProposeModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Launch Challenge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
