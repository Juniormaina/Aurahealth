import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { CompanionAvatar } from './components/CompanionAvatar';
import { FeedbackDashboard } from './components/FeedbackDashboard';
import { CommunitySponsorPools } from './components/CommunitySponsorPools';
import { SpinWheelLootbox } from './components/SpinWheelLootbox';
import { SmartContractsViewer } from './components/SmartContractsViewer';
import { AIHealthCoach } from './components/AIHealthCoach';
import { HealthCheckinModal } from './components/HealthCheckinModal';
import { JiweEconomyDiagram } from './components/JiweEconomyDiagram';

import {
  INITIAL_COMPANION,
  INITIAL_SPONSOR_POOLS,
  INITIAL_BADGES,
  INITIAL_CHECKINS,
  INITIAL_TX_LOGS,
} from './data/initialData';

import {
  HealthCompanion,
  SponsorPool,
  SoulboundBadge,
  HealthCheckIn,
  EconomyStats,
  WheelPrize,
  TxRecord,
} from './types';

import {
  SANDBOX_WALLET,
  connectWeb3Wallet,
  WalletState,
  createAvalancheTxRecord,
} from './services/avalanche';

import confetti from 'canvas-confetti';

export default function App() {
  const [wallet, setWallet] = useState<WalletState>(SANDBOX_WALLET);
  const [activeTab, setActiveTab] = useState<string>('companion');

  const [companion, setCompanion] = useState<HealthCompanion>(INITIAL_COMPANION);
  const [pools, setPools] = useState<SponsorPool[]>(INITIAL_SPONSOR_POOLS);
  const [badges, setBadges] = useState<SoulboundBadge[]>(INITIAL_BADGES);
  const [checkIns, setCheckIns] = useState<HealthCheckIn[]>(INITIAL_CHECKINS);
  const [txLogs, setTxLogs] = useState<TxRecord[]>(INITIAL_TX_LOGS);

  const [stats, setStats] = useState<EconomyStats>({
    cowriesBalance: 350,
    totalXp: 450,
    avaxEarned: 0.15,
    currentStreak: 5,
    longestStreak: 12,
    rank: 'Sentinel Initiate',
    communityContributionScore: 88,
  });

  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleConnectWallet = async () => {
    const w = await connectWeb3Wallet();
    setWallet(w);
    showToast(`Connected to Avalanche Wallet: ${w.shortAddress}`);
  };

  // Feed companion action
  const handleFeedCompanion = (cost: number, stat: 'health' | 'vitality' | 'harmony') => {
    if (stats.cowriesBalance < cost) {
      showToast('Insufficient Health Cowries balance!');
      return;
    }

    setStats((prev) => ({ ...prev, cowriesBalance: prev.cowriesBalance - cost }));
    setCompanion((prev) => {
      const newValue = Math.min(100, prev[stat] + 15);
      const newXp = prev.xp + 50;
      return {
        ...prev,
        [stat]: newValue,
        xp: newXp,
      };
    });

    showToast(`Astra enjoyed the treat! +15 ${stat.toUpperCase()} & +50 XP accrued.`);
  };

  // Submit check-in success
  const handleCheckinSuccess = (newCheckIn: HealthCheckIn) => {
    setCheckIns((prev) => [newCheckIn, ...prev]);

    // Update Economy stats
    setStats((prev) => ({
      ...prev,
      cowriesBalance: prev.cowriesBalance + newCheckIn.cowriesEarned,
      totalXp: prev.totalXp + newCheckIn.xpEarned,
      currentStreak: prev.currentStreak + 1,
    }));

    // Update Companion
    setCompanion((prev) => {
      const updatedTotal = prev.totalCheckIns + 1;
      const updatedStreak = prev.streakDays + 1;
      const newXp = prev.xp + newCheckIn.xpEarned;
      let newLevel = prev.level;
      let newStage = prev.stage;

      if (newXp >= prev.xpToNextLevel) {
        newLevel += 1;
        if (newLevel >= 5 && prev.stage === 'Hatchling') {
          newStage = 'Spark Companion';
        }
      }

      return {
        ...prev,
        totalCheckIns: updatedTotal,
        streakDays: updatedStreak,
        xp: newXp,
        level: newLevel,
        stage: newStage,
        health: 100,
        vitality: Math.min(100, prev.vitality + 10),
      };
    });

    // Create Avalanche Tx Log
    const tx = createAvalancheTxRecord(
      'ProofOfAdherence.sol',
      'recordCheckIn',
      `CheckInVerified(Score:${newCheckIn.aiAttestationScore}, Cowries:+${newCheckIn.cowriesEarned})`
    );
    setTxLogs((prev) => [tx, ...prev]);

    showToast(`Adherence record verified on Avalanche! +${newCheckIn.cowriesEarned} 🐚 Cowries & +${newCheckIn.xpEarned} XP!`);
  };

  // Win Spin Wheel Prize
  const handleWinPrize = (prize: WheelPrize) => {
    if (prize.type === 'cowries') {
      const amt = typeof prize.amount === 'number' ? prize.amount : 100;
      setStats((prev) => ({ ...prev, cowriesBalance: prev.cowriesBalance + amt }));
    } else if (prize.type === 'xp') {
      const amt = typeof prize.amount === 'number' ? prize.amount : 200;
      setCompanion((prev) => ({ ...prev, xp: prev.xp + amt }));
    } else if (prize.type === 'boost') {
      setStats((prev) => ({ ...prev, avaxEarned: prev.avaxEarned + 0.05 }));
    }

    const tx = createAvalancheTxRecord('RewardSponsorPool.sol', 'claimWheelReward', `PrizeWon(${prize.label})`);
    setTxLogs((prev) => [tx, ...prev]);

    showToast(`Wheel Prize Claimed: ${prize.label}!`);
  };

  // Claim Sponsor Pool Reward
  const handleClaimReward = (poolId: string) => {
    const targetPool = pools.find((p) => p.id === poolId);
    if (!targetPool) return;

    setStats((prev) => ({ ...prev, avaxEarned: prev.avaxEarned + 0.08 }));
    const tx = createAvalancheTxRecord('RewardSponsorPool.sol', 'claimReward', `RewardClaimed(${targetPool.rewardPerMilestone})`);
    setTxLogs((prev) => [tx, ...prev]);

    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#e11d48', '#fbbf24', '#10b981'],
    });

    showToast(`Claimed ${targetPool.rewardPerMilestone} from ${targetPool.sponsorName}!`);
  };

  // Add Sponsor Pool
  const handleAddSponsorPool = (newPool: SponsorPool) => {
    setPools((prev) => [newPool, ...prev]);
    const tx = createAvalancheTxRecord('RewardSponsorPool.sol', 'createPool', `PoolFunded(${newPool.totalFundAvax} AVAX)`);
    setTxLogs((prev) => [tx, ...prev]);
    showToast(`New Sponsor Grant Pool Created: ${newPool.title}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        wallet={wallet}
        stats={stats}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onConnectWallet={handleConnectWallet}
        onOpenCheckin={() => setIsCheckinModalOpen(true)}
      />

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/40 text-emerald-300 text-xs font-bold px-4 py-3 rounded-xl shadow-2xl animate-bounce flex items-center gap-2">
          <span className="text-base">🎉</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* 5-Layer Economy Diagram Banner */}
        <JiweEconomyDiagram />

        {/* Tab 1: Companion & Log (Primary Gameplay Loop) */}
        {activeTab === 'companion' && (
          <CompanionAvatar
            companion={companion}
            cowriesBalance={stats.cowriesBalance}
            onFeedCompanion={handleFeedCompanion}
            onOpenCheckin={() => setIsCheckinModalOpen(true)}
            onOpenWheel={() => setActiveTab('wheel')}
          />
        )}

        {/* Tab 2: Feedback Surface */}
        {activeTab === 'feedback' && (
          <FeedbackDashboard
            companion={companion}
            stats={stats}
            badges={badges}
            checkIns={checkIns}
            onOpenCheckin={() => setIsCheckinModalOpen(true)}
            onOpenSponsors={() => setActiveTab('sponsors')}
          />
        )}

        {/* Tab 3: Sponsor Pools */}
        {activeTab === 'sponsors' && (
          <CommunitySponsorPools
            pools={pools}
            onClaimReward={handleClaimReward}
            onAddSponsorPool={handleAddSponsorPool}
          />
        )}

        {/* Tab 4: Loot Wheel */}
        {activeTab === 'wheel' && (
          <SpinWheelLootbox
            onWinPrize={handleWinPrize}
            cowriesBalance={stats.cowriesBalance}
          />
        )}

        {/* Tab 5: Smart Contracts & On-Chain Verification */}
        {activeTab === 'contracts' && (
          <SmartContractsViewer txLogs={txLogs} />
        )}

        {/* Tab 6: AI Health Coach */}
        {activeTab === 'coach' && (
          <AIHealthCoach companion={companion} />
        )}
      </main>

      {/* Health Check-In Modal */}
      <HealthCheckinModal
        isOpen={isCheckinModalOpen}
        onClose={() => setIsCheckinModalOpen(false)}
        onSuccess={handleCheckinSuccess}
      />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <strong className="text-slate-300">AvaHealth Quest No. 05</strong> • Health & Community Adherence Platform on Avalanche
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Avalanche Fuji C-Chain ID: 43113</span>
            <span>•</span>
            <span>Jiwe IO Hybrid Economy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
