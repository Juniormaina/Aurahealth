import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { GlobalSearch } from './components/GlobalSearch';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { DashboardHome } from './components/DashboardHome';
import { AdminDashboard } from './components/AdminDashboard';
import { SpinWheelLootbox } from './components/SpinWheelLootbox';
import { RewardsHub } from './components/RewardsHub';
import { AIHealthCoach } from './components/AIHealthCoach';
import { HealthCheckinModal } from './components/HealthCheckinModal';
import { SettingsPanel } from './components/SettingsPanel';
import { JiweEconomyDiagram } from './components/JiweEconomyDiagram';
import { QuickLogKind } from './components/QuickLogBar';
import { PremiumModal } from './components/PremiumModal';
import { UpgradePrompt } from './components/UpgradePrompt';
import { WearablesSyncModal } from './components/WearablesSyncModal';
import { SESSION_LANGUAGES, SessionLanguageId } from './content/valueProps';
import { checkout, fetchPlan, logMetric, requestCorporatePackage, startTrial, trackFunnel } from './services/commerce';
import { fetchAdminSession } from './services/adminAuth';
import type { PlanInterval, UserPlan } from './server/commerceStore';

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
  getAuthErrorMessage,
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
import { Compass, Home, Search, MessageSquare, Award } from 'lucide-react';

export default function App() {
  const [isLanding, setIsLanding] = useState<boolean>(true);
  const [showAuth, setShowAuth] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [userAccount, setUserAccount] = useState<{ name: string; email: string; isGoogle: boolean; uid?: string; photoURL?: string } | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [isProMode, setIsProMode] = useState<boolean>(false);
  const [premiumOpen, setPremiumOpen] = useState<boolean>(false);
  const [wearablesOpen, setWearablesOpen] = useState<boolean>(false);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [sessionLanguage, setSessionLanguage] = useState<SessionLanguageId>('sw');
  const [latestAnxiety, setLatestAnxiety] = useState<number>(7);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [astraReaction, setAstraReaction] = useState<string | null>(null);

  const [wallet, setWallet] = useState<WalletState>(SANDBOX_WALLET);
  const [activeTab, setActiveTab] = useState<string>('companion');

  const handleNavigateTab = (tab: string) => {
    setActiveTab(tab);
  };

  const handleAdminLogin = () => {
    setShowAuth(false);
    setIsAdmin(true);
    setIsLanding(false);
  };

  const handleAdminBackToLanding = () => {
    setIsAdmin(false);
    setShowAuth(false);
    setIsLanding(true);
  };

  // Keyboard shortcut for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    lastCheckInDate: null,
    rank: 'Sentinel Initiate',
    communityContributionScore: 88,
  });

  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    fetchAdminSession().catch(() => {
      if (cancelled) return;
      setIsAdmin(false);
      setIsLanding(true);
      setShowAuth(false);
      showToast('Admin access was denied or the session expired.');
    });
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const commerceUserId = userAccount?.uid || (isDemoMode ? 'demo-guest' : 'anon');

  const persistMetric = (moodScore: number, anxietyLevel: number, source: string) => {
    setLatestAnxiety(anxietyLevel);
    logMetric({
      moodScore,
      anxietyLevel,
      sessionDate: new Date().toISOString().slice(0, 10),
      language: sessionLanguage,
      source,
    }).catch(() => undefined);
  };

  useEffect(() => {
    trackFunnel('session_start');
    fetchPlan()
      .then((r) => {
        setUserPlan(r.plan);
        setIsProMode(['premium', 'trial', 'lifetime', 'corporate'].includes(r.plan.plan));
      })
      .catch(() => undefined);
  }, [commerceUserId]);

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
        setIsAdmin(false);
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
      setShowAuth(false);

      // Every real account starts from a clean slate — no leftover mock/demo
      // numbers. Real progress comes only from what's saved in Firestore.
      setStats({
        cowriesBalance: profile.cowriesBalance ?? 0,
        totalXp: profile.totalXp ?? 0,
        avaxEarned: 0,
        currentStreak: profile.currentStreak ?? 0,
        longestStreak: profile.longestStreak ?? 0,
        lastCheckInDate: profile.lastCheckInDate ?? null,
        rank: 'Health Newcomer',
        communityContributionScore: 0,
      });

      // Badges aren't persisted per-account yet, so start locked rather than
      // showing the demo seed's already-unlocked ones.
      setBadges(INITIAL_BADGES.map((b) => ({ ...b, unlockedAt: undefined, tokenId: undefined, txHash: undefined })));

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
        showToast(getAuthErrorMessage(err));
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
      // Show the real error instead of silently creating a fake, unsaved
      // session — that used to mask config issues (e.g. Email/Password
      // provider disabled) as a "successful" login with no persistence.
      showToast(getAuthErrorMessage(err));
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
      showToast(getAuthErrorMessage(err));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setUserAccount(null);
    setIsAdmin(false);
    setIsLanding(true);
    setShowAuth(false);
    showToast('Signed out of AuraHealth.');
  };

  const handleStartDemo = () => {
    setShowAuth(false);
    setIsLanding(false);
    setIsDemoMode(true);
    showToast('Guided Demo Mode active! Explore Astra Companion, Check-ins & Sponsor Grants.');
  };

  const handleBackToLanding = () => {
    setShowAuth(false);
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

    // Real day-based streak: first-ever check-in is day 1, consecutive
    // calendar days increment it, and missing a day resets back to 1 —
    // instead of incrementing forever regardless of actual consistency.
    const today = new Date().toISOString().slice(0, 10);
    let newStreak: number;
    if (!stats.lastCheckInDate) {
      newStreak = 1;
    } else {
      const diffDays = Math.round(
        (new Date(today).getTime() - new Date(stats.lastCheckInDate).getTime()) / 86400000
      );
      if (diffDays <= 0) newStreak = Math.max(1, stats.currentStreak); // already checked in today
      else if (diffDays === 1) newStreak = stats.currentStreak + 1; // consecutive day
      else newStreak = 1; // missed a day (or more) — streak resets
    }
    const newLongestStreak = Math.max(stats.longestStreak, newStreak);

    // Update Economy stats
    setStats((prev) => {
      const newCowries = prev.cowriesBalance + newCheckIn.cowriesEarned;
      const newXp = prev.totalXp + newCheckIn.xpEarned;
      if (userAccount?.uid) {
        updateUserCowries(userAccount.uid, newCowries, newXp, {
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
          lastCheckInDate: today,
        }).catch(console.error);
      }
      return {
        ...prev,
        cowriesBalance: newCowries,
        totalXp: newXp,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastCheckInDate: today,
      };
    });

    // Update Companion
    setCompanion((prev) => {
      const updatedTotal = prev.totalCheckIns + 1;
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
        streakDays: newStreak,
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
    persistMetric(
      newCheckIn.moodRating,
      newCheckIn.anxietyLevel ?? Math.max(1, 11 - newCheckIn.moodRating * 2),
      'checkin'
    );
    if (userPlan?.plan === 'free') {
      setPremiumOpen(true);
      trackFunnel('upgrade_prompt_shown', { after: 'checkin' });
    }
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

  const handleQuickLog = (kind: QuickLogKind) => {
    const labels: Record<QuickLogKind, string> = {
      hydration: '+ Water 💧',
      medication: 'Meds logged',
      sleep: 'Rest boost',
      mood: 'Feeling good',
    };
    setAstraReaction(labels[kind]);
    window.setTimeout(() => setAstraReaction(null), 1200);
    setCompanion((prev) => ({
      ...prev,
      vitality: Math.min(100, prev.vitality + 4),
      xp: prev.xp + 8,
      mood: kind === 'mood' ? 'joyful' : kind === 'sleep' ? 'sleepy' : 'energetic',
    }));
    setStats((prev) => ({
      ...prev,
      cowriesBalance: prev.cowriesBalance + 5,
      totalXp: prev.totalXp + 8,
    }));
    showToast(`${labels[kind]} · Astra gained XP`);
    if (kind === 'mood') persistMetric(4, Math.max(1, latestAnxiety - 1), 'quick_log');
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

  const isPaidPlan = ['premium', 'trial', 'lifetime', 'corporate'].includes(userPlan?.plan || '');

  const applyPlan = (plan: UserPlan) => {
    setUserPlan(plan);
    setIsProMode(['premium', 'trial', 'lifetime', 'corporate'].includes(plan.plan));
    setPremiumOpen(false);
  };

  const handleStartTrial = async () => {
    if (!auth.currentUser) {
      setPremiumOpen(false);
      setShowAuth(true);
      showToast('Sign in to start a Premium trial.');
      return;
    }
    const { plan } = await startTrial('monthly');
    applyPlan(plan);
    setIsLanding(false);
    showToast('7-day Premium trial started. Auto-subscribes monthly unless you cancel.');
  };

  const handleCheckout = async (interval: PlanInterval) => {
    if (!auth.currentUser) {
      setPremiumOpen(false);
      setShowAuth(true);
      showToast('Sign in to upgrade to Premium.');
      return;
    }
    const { plan } = await checkout(interval);
    applyPlan(plan);
    showToast(interval === 'lifetime' ? 'Lifetime Premium unlocked.' : `Premium ${interval} is active.`);
  };

  const handleCorporateRequest = async (payload: {
    company: string;
    contactEmail: string;
    seats: number;
    packageId: string;
  }) => {
    await requestCorporatePackage(payload);
    trackFunnel('corporate_lead', payload);
    showToast('Corporate wellness request sent. We will follow up with a package quote.');
  };

  if (showAuth) {
    return (
      <AuthPage
        onGoogleSignIn={handleRealGoogleSignIn}
        onEmailSignIn={handleEmailSignIn}
        onEmailSignUp={handleEmailSignUp}
        onStartDemo={handleStartDemo}
        onBack={() => setShowAuth(false)}
        isLoggingIn={isLoggingIn}
      />
    );
  }

  if (isLanding) {
    return (
      <div className="min-h-screen landscape-shell">
        <LandingPage
          onOpenAuth={() => setShowAuth(true)}
          userAccount={userAccount}
          isDemoMode={isDemoMode}
          onEnterDashboard={() => setIsLanding(false)}
          onSignOut={handleLogout}
          onAdminLogin={handleAdminLogin}
          isStaffSignedIn={Boolean(auth.currentUser)}
        />
        <PremiumModal
          isOpen={premiumOpen}
          onClose={() => setPremiumOpen(false)}
          onStartTrial={handleStartTrial}
          onCheckout={handleCheckout}
          onCorporateRequest={handleCorporateRequest}
        />
      </div>
    );
  }

  if (isAdmin) {
    return (
      <AdminDashboard
        pools={pools}
        onClaimReward={handleClaimReward}
        onAddSponsorPool={handleAddSponsorPool}
        companion={companion}
        stats={stats}
        badges={badges}
        checkIns={checkIns}
        txLogs={txLogs}
        userStreak={companion.streakDays}
        userName={userAccount?.name || 'Health Pioneer'}
        userCowries={stats.cowriesBalance}
        onOpenCheckin={() => setIsCheckinModalOpen(true)}
        onShowToast={showToast}
        onBackToLanding={handleAdminBackToLanding}
        onSignOut={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen flex font-sans selection:bg-primary selection:text-primary-foreground landscape-shell">
      <Sidebar
        activeTab={activeTab}
        onNavigate={handleNavigateTab}
        isProMode={isPaidPlan}
        onToggleProMode={() => {
          setPremiumOpen(true);
          trackFunnel('upgrade_prompt_shown', { from: 'sidebar' });
        }}
        userAccount={userAccount}
        onSignOut={handleLogout}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-h-screen min-w-0 app-shell-main">
        <Navbar
          stats={stats}
          onOpenCheckin={() => setIsCheckinModalOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

      {/* Guided Tour Banner when in Demo Mode */}
      {isDemoMode && (
        <div className="trust-band border-b border-[#FFFAF4]/12 py-2.5 px-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-[#FFFAF4]">
              <Compass className="w-4 h-4 text-[var(--color-harmony)] shrink-0" />
              <span>
                <strong>Guided demo:</strong> Use <strong>+ Check-In</strong> to try a session with <strong>Astra</strong>. Open <strong>Rewards</strong> when you want optional perks.
              </span>
            </div>
            <button
              onClick={handleBackToLanding}
              className="bg-primary text-[var(--color-primary-foreground)] font-bold px-3 py-1 rounded-[4px] text-[11px] whitespace-nowrap"
            >
              Sign In with Google
            </button>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed z-50 app-toast bg-navy border border-line text-[#FFFAF4] text-xs font-bold px-4 py-3 rounded-[4px] flex items-center gap-2">
          <span className="text-base">🎉</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full min-w-0 mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 pb-28 lg:pb-6">
        {activeTab === 'companion' && (
          <DashboardHome
            companion={companion}
            stats={stats}
            userName={userAccount?.name || 'Health Pioneer'}
            onOpenCheckin={() => setIsCheckinModalOpen(true)}
            onNavigateTab={handleNavigateTab}
            onMissionCompleted={handleMissionCompleted}
            onFeedCompanion={handleFeedCompanion}
            onOpenWheel={() => setActiveTab('wheel')}
            isFreshStart={!isDemoMode}
            onQuickLog={handleQuickLog}
            astraReaction={astraReaction}
            userId={commerceUserId}
            showUpgrade={!isPaidPlan}
            onUpgrade={() => setPremiumOpen(true)}
            sessionLanguage={sessionLanguage}
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
        )}

        {/* Tab 2: Rewards Wheel & Hub */}
        {activeTab === 'wheel' && (
          <div className="space-y-6">
            <header className="rewards-band glass-panel rounded-2xl p-5">
              <p className="view-kicker">Rewards</p>
              <h2 className="view-title !text-2xl mt-1">Wellness points & perks</h2>
              <p className="view-copy mt-2">
                This layer is optional. Daily sessions with Astra stay the same whether or not you redeem points.
              </p>
            </header>
            {isProMode && <JiweEconomyDiagram />}
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

        {/* Tab 3: AI Health Coach */}
        {activeTab === 'coach' && (
          <AIHealthCoach
            companion={companion}
            language={SESSION_LANGUAGES.find((l) => l.id === sessionLanguage)?.native || 'Kiswahili'}
            latestAnxiety={latestAnxiety}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPanel
            userName={userAccount?.name || 'Health Pioneer'}
            userEmail={userAccount?.email}
            sessionLanguage={sessionLanguage}
            onLanguageChange={setSessionLanguage}
            onOpenWearables={() => setWearablesOpen(true)}
            onOpenPremium={() => setPremiumOpen(true)}
            planLabel={userPlan?.plan || 'free'}
          />
        )}
      </main>

      {/* Health Check-In Modal */}
      <HealthCheckinModal
        isOpen={isCheckinModalOpen}
        onClose={() => setIsCheckinModalOpen(false)}
        onSuccess={handleCheckinSuccess}
        onShowToast={showToast}
        wallet={wallet}
      />

      <PremiumModal
        isOpen={premiumOpen}
        onClose={() => setPremiumOpen(false)}
        onStartTrial={handleStartTrial}
        onCheckout={handleCheckout}
        onCorporateRequest={handleCorporateRequest}
      />

      <WearablesSyncModal
        isOpen={wearablesOpen}
        onClose={() => setWearablesOpen(false)}
        onSyncData={() => showToast('Loaded a simulated wearable sample. Not a live device sync.')}
        onShowToast={showToast}
      />

      {/* Footer */}
      <footer className="bg-navy py-6 text-center text-xs text-[#FFFAF4]/70">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBackToLanding}
              className="text-[#FFFAF4]/80 hover:text-[var(--color-harmony)] underline text-xs"
            >
              Back to Landing
            </button>
            <span>•</span>
            <strong className="text-[#FFFAF4]">Aura Health</strong> · Daily wellness
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Ledger Synced
            </span>
            <span>•</span>
            <span>Harmony-verified health pass</span>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav lg:hidden" aria-label="Mobile navigation">
        <button
          onClick={() => handleNavigateTab('companion')}
          className={`mobile-bottom-nav-item ${activeTab === 'companion' ? 'active' : ''}`}
          aria-label="Dashboard"
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>
        <button
          onClick={() => handleNavigateTab('coach')}
          className={`mobile-bottom-nav-item ${activeTab === 'coach' ? 'active' : ''}`}
          aria-label="AI Coach"
        >
          <MessageSquare className="w-5 h-5" />
          <span>Coach</span>
        </button>
        <button
          onClick={() => handleNavigateTab('wheel')}
          className={`mobile-bottom-nav-item ${activeTab === 'wheel' ? 'active' : ''}`}
          aria-label="Rewards"
        >
          <Award className="w-5 h-5" />
          <span>Rewards</span>
        </button>
        <button
          onClick={() => setSearchOpen(true)}
          className="mobile-bottom-nav-item"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
          <span>Search</span>
        </button>
      </nav>

      {/* Global Search Modal */}
      <GlobalSearch
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={handleNavigateTab}
        onOpenCheckin={() => setIsCheckinModalOpen(true)}
        activeTab={activeTab}
      />
      </div>
    </div>
  );
}

