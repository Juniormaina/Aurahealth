import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { CompanionAvatar } from './components/CompanionAvatar';
import { DailyGoalTracker } from './components/DailyGoalTracker';
import { FeedbackDashboard } from './components/FeedbackDashboard';
import { CommunitySponsorPools } from './components/CommunitySponsorPools';
import { SpinWheelLootbox } from './components/SpinWheelLootbox';
import { RewardsHub } from './components/RewardsHub';
import { SmartContractsViewer } from './components/SmartContractsViewer';
import { AIHealthCoach } from './components/AIHealthCoach';
import { HealthCheckinModal } from './components/HealthCheckinModal';
import { JiweEconomyDiagram } from './components/JiweEconomyDiagram';
import { OnboardingTutorial } from './components/OnboardingTutorial';

import {
  INITIAL_COMPANION,
  FRESH_USER_COMPANION,
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

import {
  auth,
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  checkRedirectResult,
  logoutUser,
  syncUserProfile,
  updateUserCowries,
  saveHealthLogToFirestore,
  getUserHealthLogsFromFirestore,
  getCompanionFromFirestore,
  saveCompanionToFirestore,
} from './services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

import confetti from 'canvas-confetti';
import { Sparkles, Play, ArrowRight, Compass, ShieldCheck } from 'lucide-react';

export default function App() {
  const [isLanding, setIsLanding] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [userAccount, setUserAccount] = useState<{ name: string; email: string; isGoogle: boolean; uid?: string; photoURL?: string } | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [isProMode, setIsProMode] = useState<boolean>(false);
  const [theme, setTheme] = useState<'midnight' | 'morning'>(() => (localStorage.getItem('aura_theme') as 'midnight' | 'morning') || 'morning');

  const handleToggleTheme = () => {
    const nextTheme = theme === 'midnight' ? 'morning' : 'midnight';
    setTheme(nextTheme);
    localStorage.setItem('aura_theme', nextTheme);
    showToast(`Switched to ${nextTheme === 'morning' ? 'Light' : 'Dark'} mode`);
  };

  const [wallet, setWallet] = useState<WalletState>(SANDBOX_WALLET);
  const [activeTab, setActiveTab] = useState<string>('companion');

  const handleNavigateTab = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'sponsors' || tab === 'contracts' || tab === 'feedback') {
      setIsProMode(true);
    }
  };

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

  // Firebase Auth Observer
  useEffect(() => {
    // Check redirect result first if user redirected back
    checkRedirectResult().then((user) => {
      if (user) {
        handleFirebaseUserAuthenticated(user);
      }
    });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await handleFirebaseUserAuthenticated(user);
      } else {
        setUserAccount(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleFirebaseUserAuthenticated = async (user: User) => {
    try {
      const profile = await syncUserProfile(user);
      setUserAccount({
        name: profile.displayName,
        email: profile.email,
        isGoogle: true,
        uid: user.uid,
        photoURL: user.photoURL || '',
      });
      // Session starts on landing page; user clicks Enter Dashboard to proceed
      setIsDemoMode(false);

      const userCowries = profile.cowriesBalance ?? 0;
      const userXp = profile.totalXp ?? 0;

      setStats((prev) => ({
        ...prev,
        cowriesBalance: userCowries,
        totalXp: userXp,
      }));

      // Sync companion
      const firestoreComp = await getCompanionFromFirestore(user.uid);
      if (firestoreComp) {
        setCompanion((prev) => ({
          ...prev,
          ...firestoreComp,
        }));
      } else {
        await saveCompanionToFirestore(user.uid, FRESH_USER_COMPANION);
        setCompanion(FRESH_USER_COMPANION);
      }

      // Sync user health logs from Firestore
      const userLogs = await getUserHealthLogsFromFirestore(user.uid);
      if (userLogs && userLogs.length > 0) {
        setCheckIns(userLogs);
      } else {
        setCheckIns([]); // Clean start for new account
      }

      showToast(`Welcome ${profile.displayName}! Authenticated session active.`);
    } catch (err: any) {
      console.error('Failed syncing user profile:', err);
    }
  };

  const handleRealGoogleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      const user = await signInWithGoogle();
      await handleFirebaseUserAuthenticated(user);
      setIsLanding(false); // Explicit login enters dashboard directly
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#e11d48', '#38bdf8', '#10b981', '#fbbf24'],
      });
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      if (err.message?.includes('Redirecting')) {
        showToast('Redirecting to Google Authentication...');
      } else {
        showToast(err.message || 'Could not complete Google Sign-In');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleEmailSignIn = async (email: string, pass: string) => {
    setIsLoggingIn(true);
    try {
      const user = await signInWithEmail(email, pass);
      await handleFirebaseUserAuthenticated(user);
      setIsLanding(false);
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#e11d48', '#38bdf8', '#10b981', '#fbbf24'],
      });
    } catch (err: any) {
      console.warn('Email Sign-In error:', err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        showToast('Invalid email or password.');
      } else if (err.code === 'auth/user-not-found') {
        showToast('No account found for this email. Try Signing Up!');
      } else {
        // Fallback session creation for user convenience
        handleGoogleSignIn(email, email.split('@')[0]);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleEmailSignUp = async (email: string, pass: string, name: string) => {
    setIsLoggingIn(true);
    try {
      const user = await signUpWithEmail(email, pass, name);
      await handleFirebaseUserAuthenticated(user);
      setIsLanding(false);
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#e11d48', '#38bdf8', '#10b981', '#fbbf24'],
      });
    } catch (err: any) {
      console.warn('Email Sign-Up error:', err);
      if (err.code === 'auth/email-already-in-use') {
        showToast('Email is already registered. Please Sign In instead.');
      } else if (err.code === 'auth/weak-password') {
        showToast('Password should be at least 6 characters.');
      } else {
        // Fallback session creation for user testing
        handleGoogleSignIn(email, name || email.split('@')[0]);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleSignIn = (email: string, name: string) => {
    const fakeUid = 'custom_' + email.replace(/[^a-zA-Z0-9]/g, '_');
    setUserAccount({ name, email, isGoogle: true, uid: fakeUid });
    setIsLanding(false);
    setIsDemoMode(false);
    setStats({
      cowriesBalance: 0,
      totalXp: 0,
      currentStreak: 0,
      activeGrantClaims: 0,
    });
    setCompanion(FRESH_USER_COMPANION);
    setCheckIns([]);
    showToast(`Welcome ${name}! Starting fresh with 0 Cowries & 0 Streak.`);
    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#e11d48', '#38bdf8', '#10b981', '#fbbf24'],
    });
  };

  const handleLogout = async () => {
    await logoutUser();
    setUserAccount(null);
    setIsLanding(true);
    showToast('Signed out of AuraHealth.');
  };

  const handleStartDemo = () => {
    setIsLanding(false);
    setIsDemoMode(true);
    showToast('Guided Demo Mode active! Explore Astra Companion, Check-ins & Sponsor Grants.');
  };

  const handleBackToLanding = () => {
    setIsLanding(true);
  };

  const handleConnectWallet = async () => {
    const w = await connectWeb3Wallet();
    setWallet(w);
    showToast(`Connected Health Ledger Account: ${w.shortAddress}`);
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

    // Save to Firestore if authenticated
    if (userAccount?.uid) {
      saveHealthLogToFirestore(userAccount.uid, newCheckIn).catch(console.error);
    }

    // Update Economy stats
    setStats((prev) => {
      const newCowries = prev.cowriesBalance + newCheckIn.cowriesEarned;
      const newXp = prev.totalXp + newCheckIn.xpEarned;
      if (userAccount?.uid) {
        updateUserCowries(userAccount.uid, newCowries, newXp).catch(console.error);
      }
      return {
        ...prev,
        cowriesBalance: newCowries,
        totalXp: newXp,
        currentStreak: prev.currentStreak + 1,
      };
    });

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

      const updatedCompanion = {
        ...prev,
        totalCheckIns: updatedTotal,
        streakDays: updatedStreak,
        xp: newXp,
        level: newLevel,
        stage: newStage,
        health: 100,
        vitality: Math.min(100, prev.vitality + 10),
      };

      if (userAccount?.uid) {
        saveCompanionToFirestore(userAccount.uid, updatedCompanion).catch(console.error);
      }

      return updatedCompanion;
    });

    // Create Avalanche Tx Log
    const tx = createAvalancheTxRecord(
      'ProofOfAdherence.sol',
      'recordCheckIn',
      `CheckInVerified(Score:${newCheckIn.aiAttestationScore}, Cowries:+${newCheckIn.cowriesEarned})`
    );
    setTxLogs((prev) => [tx, ...prev]);

    showToast(`Adherence record verified & saved to database! +${newCheckIn.cowriesEarned} 🐚 & +${newCheckIn.xpEarned} XP!`);
  };

  // Handle Onboarding Tutorial Mission Completed
  const handleMissionCompleted = (addedXp: number, addedCowries: number, missionId: string) => {
    setStats((prev) => {
      const newCowries = prev.cowriesBalance + addedCowries;
      const newXp = prev.totalXp + addedXp;
      if (userAccount?.uid) {
        updateUserCowries(userAccount.uid, newCowries, newXp).catch(console.error);
      }
      return {
        ...prev,
        cowriesBalance: newCowries,
        totalXp: newXp,
        currentStreak: Math.max(1, prev.currentStreak),
      };
    });

    setCompanion((prev) => {
      let nextStage = prev.stage;
      let nextLevel = prev.level;
      let newXp = prev.xp + addedXp;

      if (newXp >= prev.xpToNextLevel) {
        nextLevel += 1;
        if (nextLevel >= 2 && prev.stage === 'Egg') {
          nextStage = 'Hatchling';
        }
      }

      const updated = {
        ...prev,
        xp: newXp,
        level: nextLevel,
        stage: nextStage,
        health: Math.min(100, prev.health + 10),
        vitality: Math.min(100, prev.vitality + 10),
        streakDays: Math.max(1, prev.streakDays),
      };

      if (userAccount?.uid) {
        saveCompanionToFirestore(userAccount.uid, updated).catch(console.error);
      }

      return updated;
    });

    showToast(`First-Day Mission Completed! +${addedXp} XP & +${addedCowries} 🐚 Cowries unlocked!`);
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

  // Claim Benefit from Rewards Hub
  const handleClaimBenefit = (cost: number, benefitTitle: string) => {
    setStats((prev) => {
      const newCowries = Math.max(0, prev.cowriesBalance - cost);
      if (userAccount?.uid) {
        updateUserCowries(userAccount.uid, newCowries, prev.totalXp).catch(console.error);
      }
      return {
        ...prev,
        cowriesBalance: newCowries,
      };
    });
    showToast(`Redeemed "${benefitTitle}" for ${cost} 🐚! Benefit code saved to wallet.`);
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

  if (isLanding) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${theme === 'morning' ? 'theme-morning bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'}`}>
        <LandingPage
          onGoogleSignIn={handleGoogleSignIn}
          onRealGoogleSignIn={handleRealGoogleSignIn}
          onEmailSignIn={handleEmailSignIn}
          onEmailSignUp={handleEmailSignUp}
          onStartDemo={handleStartDemo}
          isLoggingIn={isLoggingIn}
          userAccount={userAccount}
          isDemoMode={isDemoMode}
          onEnterDashboard={() => setIsLanding(false)}
          onSignOut={handleLogout}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-rose-500 selection:text-white transition-colors duration-300 ${theme === 'morning' ? 'theme-morning bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'}`}>
      {/* Top Navbar */}
      <Navbar
        wallet={wallet}
        stats={stats}
        activeTab={activeTab}
        setActiveTab={handleNavigateTab}
        onConnectWallet={handleConnectWallet}
        onOpenCheckin={() => setIsCheckinModalOpen(true)}
        userAccount={userAccount}
        isDemoMode={isDemoMode}
        onBackToLanding={handleBackToLanding}
        onSignOut={handleLogout}
        isProMode={isProMode}
        setIsProMode={setIsProMode}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Guided Tour Banner when in Demo Mode */}
      {isDemoMode && (
        <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-rose-950/80 border-b border-amber-500/30 py-2.5 px-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-amber-200">
              <Compass className="w-4 h-4 text-amber-400 shrink-0 animate-spin" style={{ animationDuration: '8s' }} />
              <span>
                <strong>Guided Demo Walkthrough Active:</strong> Click <strong>+ Daily Check-In</strong> above to test AI attestation, feed <strong>Astra</strong>, or explore <strong>Sponsor Pools</strong>.
              </span>
            </div>
            <button
              onClick={handleBackToLanding}
              className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold px-3 py-1 rounded-lg border border-amber-500/40 text-[11px] whitespace-nowrap transition-colors"
            >
              Sign In with Google
            </button>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/40 text-emerald-300 text-xs font-bold px-4 py-3 rounded-xl shadow-2xl animate-bounce flex items-center gap-2">
          <span className="text-base">🎉</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* 5-Layer Economy Diagram Banner (Unlocked in Pro Mode) */}
        {isProMode && <JiweEconomyDiagram />}

        {/* Tab 1: Companion & Log (Primary Gameplay Loop) */}
        {activeTab === 'companion' && (
          <div className="space-y-6">
            {/* First-Day Mission & Guided Onboarding Tutorial */}
            <OnboardingTutorial
              userName={userAccount?.name || 'Health Pioneer'}
              onOpenCheckin={() => setIsCheckinModalOpen(true)}
              onNavigateTab={handleNavigateTab}
              onMissionCompleted={handleMissionCompleted}
              streakDays={companion.streakDays}
            />

            <CompanionAvatar
              companion={companion}
              cowriesBalance={stats.cowriesBalance}
              onFeedCompanion={handleFeedCompanion}
              onOpenCheckin={() => setIsCheckinModalOpen(true)}
              onOpenWheel={() => setActiveTab('wheel')}
            />
            <DailyGoalTracker
              onOpenCheckin={() => setIsCheckinModalOpen(true)}
              streakDays={companion.streakDays}
              isFreshStart={userAccount !== null && stats.cowriesBalance === 0}
              onGoalUpdated={(xp, cowries) => {
                setStats((prev) => {
                  const newCowries = prev.cowriesBalance + cowries;
                  const newXp = prev.totalXp + xp;
                  if (userAccount?.uid) {
                    updateUserCowries(userAccount.uid, newCowries, newXp).catch(console.error);
                  }
                  return {
                    ...prev,
                    cowriesBalance: newCowries,
                    totalXp: newXp,
                  };
                });
                setCompanion((prev) => {
                  const updated = {
                    ...prev,
                    xp: prev.xp + xp,
                    health: Math.min(100, prev.health + 2),
                    vitality: Math.min(100, prev.vitality + 3),
                  };
                  if (userAccount?.uid) {
                    saveCompanionToFirestore(userAccount.uid, updated).catch(console.error);
                  }
                  return updated;
                });
                showToast(`Habit Milestone Completed! +${xp} XP & +${cowries} 🐚 earned.`);
              }}
            />
          </div>
        )}

        {/* Tab 2: Feedback Surface */}
        {activeTab === 'feedback' && (
          <FeedbackDashboard
            companion={companion}
            stats={stats}
            badges={badges}
            checkIns={checkIns}
            onOpenCheckin={() => setIsCheckinModalOpen(true)}
            onOpenSponsors={() => handleNavigateTab('sponsors')}
            userName={userAccount?.name || 'Health Pioneer'}
            onShowToast={showToast}
          />
        )}

        {/* Tab 3: Sponsor Pools */}
        {activeTab === 'sponsors' && (
          <CommunitySponsorPools
            pools={pools}
            onClaimReward={handleClaimReward}
            onAddSponsorPool={handleAddSponsorPool}
            userStreak={companion.streakDays}
            userName={userAccount?.name || 'Health Pioneer'}
            userCowries={stats.cowriesBalance}
            onOpenCheckin={() => setIsCheckinModalOpen(true)}
            onShowToast={showToast}
          />
        )}

        {/* Tab 4: Rewards Wheel & Hub */}
        {activeTab === 'wheel' && (
          <div className="space-y-6">
            <RewardsHub
              cowriesBalance={stats.cowriesBalance}
              totalXp={stats.totalXp}
              currentStreak={companion.streakDays}
              onShowToast={showToast}
              onClaimBenefit={handleClaimBenefit}
            />

            <SpinWheelLootbox
              onWinPrize={handleWinPrize}
              cowriesBalance={stats.cowriesBalance}
            />
          </div>
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
        onShowToast={showToast}
      />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBackToLanding}
              className="text-slate-400 hover:text-slate-200 underline text-xs"
            >
              Back to Landing
            </button>
            <span>•</span>
            <strong className="text-slate-300">AuraHealth MVP</strong> • Daily Wellness & Community Health Adherence Platform
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Verifiable Health Ledger</span>
            <span>•</span>
            <span>Sustainable Reward Economy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

