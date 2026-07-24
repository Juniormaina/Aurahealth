import React, { useState } from 'react';
import { SponsorPool } from '../types';
import { Coins, ShieldCheck, CheckCircle2, ArrowUpRight, PlusCircle, Building2, Sparkles, Loader2 } from 'lucide-react';
import { createAvalancheTxRecord } from '../services/avalanche';
import { CommunityLeaderboard } from './CommunityLeaderboard';
import confetti from 'canvas-confetti';

interface CommunitySponsorPoolsProps {
  pools: SponsorPool[];
  onClaimReward: (poolId: string) => void;
  onAddSponsorPool: (newPool: SponsorPool) => void;
  userStreak?: number;
  userName?: string;
  userCowries?: number;
  onOpenCheckin?: () => void;
  onShowToast?: (msg: string) => void;
}

export const CommunitySponsorPools: React.FC<CommunitySponsorPoolsProps> = ({
  pools,
  onClaimReward,
  onAddSponsorPool,
  userStreak = 1,
  userName = 'Health Pioneer',
  userCowries = 0,
  onOpenCheckin = () => {},
  onShowToast,
}) => {
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [sponsorName, setSponsorName] = useState('');
  const [poolTitle, setPoolTitle] = useState('');
  const [fundingAvax, setFundingAvax] = useState('5.0');
  const [targetCheckIns, setTargetCheckIns] = useState('100');
  const [category, setCategory] = useState<SponsorPool['category']>('Clinic Support');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreatePool = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    await new Promise((r) => setTimeout(r, 1200));

    const newPool: SponsorPool = {
      id: `pool-${Date.now()}`,
      title: poolTitle || 'Community Health Clinic Sponsor Pool',
      sponsorName: sponsorName || 'Anonymous Sponsor Node',
      sponsorLogo: '🏥',
      totalFundAvax: parseFloat(fundingAvax) || 5.0,
      claimedFundAvax: 0,
      targetCheckIns: parseInt(targetCheckIns) || 100,
      currentCheckIns: 12,
      deadline: '2026-12-31',
      rewardPerMilestone: '0.05 AVAX',
      category,
      isUnlocked: false,
      verifiedSponsorAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    };

    onAddSponsorPool(newPool);
    setIsCreating(false);
    setIsDepositOpen(false);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.5 },
      colors: ['#e11d48', '#38bdf8', '#fbbf24'],
    });
  };

  return (
    <div className="space-y-6">
      {/* 5-Layer Economy Explainer Banner */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/20 text-amber-300 p-2.5 rounded-xl border border-amber-500/30">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">5-Layer Sustainable Economy</h2>
              <p className="text-xs text-slate-400">Sponsor-backed community value loop</p>
            </div>
          </div>

          <button
            onClick={() => setIsDepositOpen(true)}
            className="bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> Deposit Sponsor Grant Pool
          </button>
        </div>

        {/* 5 Layer Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {[
            { step: '1', title: 'Progression', desc: 'XP, streaks & health logs', icon: '📈' },
            { step: '2', title: 'Utility Currency', desc: 'Health Cowries (Off-Chain)', icon: '🐚' },
            { step: '3', title: 'Sponsor Pool', desc: 'External grant funding', icon: '🏦' },
            { step: '4', title: 'Digital Assets', desc: 'Dynamic Avatars & Badges', icon: '💎' },
            { step: '5', title: 'Claimable Value', desc: 'Clinic payouts & vouchers', icon: '✨' },
          ].map((l) => (
            <div key={l.step} className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-lg">{l.icon}</span>
                <span className="text-[10px] font-mono text-slate-500">Layer {l.step}</span>
              </div>
              <div className="font-bold text-white mb-0.5">{l.title}</div>
              <div className="text-[10px] text-slate-400">{l.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Sponsor Pools Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-rose-400" /> Active Sponsor Grant Pools
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pools.map((pool) => {
            const percent = Math.min(100, Math.floor((pool.currentCheckIns / pool.targetCheckIns) * 100));
            return (
              <div
                key={pool.id}
                className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{pool.sponsorLogo}</span>
                    <span className="text-[10px] font-semibold bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-md border border-rose-500/30">
                      {pool.category}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white mb-1">{pool.title}</h4>
                  <p className="text-xs text-slate-400 mb-4 flex items-center gap-1">
                    Sponsored by <strong className="text-slate-200">{pool.sponsorName}</strong>
                  </p>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 mb-4 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Total Funded Pool</span>
                      <span className="font-extrabold text-amber-300 font-mono">{pool.totalFundAvax} AVAX</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Reward Per Milestone</span>
                      <span className="font-semibold text-emerald-400">{pool.rewardPerMilestone}</span>
                    </div>
                  </div>

                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-xs text-slate-300 font-semibold">
                      <span>Community Progress</span>
                      <span>{pool.currentCheckIns} / {pool.targetCheckIns} Reports</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  {pool.isUnlocked ? (
                    <button
                      onClick={() => onClaimReward(pool.id)}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs py-2.5 px-4 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-4 h-4" /> Claim Unlocked AVAX Reward
                    </button>
                  ) : (
                    <div className="text-center text-xs text-slate-500 font-mono py-2 bg-slate-950/60 rounded-xl border border-slate-800">
                      Unlock Target: {percent}% Reached
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Team Challenges & Community Leaderboard */}
      <CommunityLeaderboard
        userStreak={userStreak}
        userName={userName}
        userCowries={userCowries}
        onContributeCheckin={onOpenCheckin}
        onShowToast={onShowToast}
      />

      {/* Sponsor Deposit Modal */}
      {isDepositOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-xl font-black text-white mb-2">Fund a Sponsor Health Pool</h3>
            <p className="text-xs text-slate-400 mb-4">
              Deposit grant funds as a clinic, NGO, or healthcare sponsor to incentivize community health adherence.
            </p>

            <form onSubmit={handleCreatePool} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Sponsor Organization</label>
                <input
                  type="text"
                  placeholder="e.g. Red Cross Clinic Network"
                  value={sponsorName}
                  onChange={(e) => setSponsorName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Campaign Title</label>
                <input
                  type="text"
                  placeholder="e.g. Rural Maternal Health Adherence Grant"
                  value={poolTitle}
                  onChange={(e) => setPoolTitle(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Deposit Fund Amount</label>
                  <input
                    type="number"
                    step="0.1"
                    value={fundingAvax}
                    onChange={(e) => setFundingAvax(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Target Check-Ins</label>
                  <input
                    type="number"
                    value={targetCheckIns}
                    onChange={(e) => setTargetCheckIns(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsDepositOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5"
                >
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Deposit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
