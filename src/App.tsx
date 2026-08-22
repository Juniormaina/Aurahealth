import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { GlobalSearch } from './components/GlobalSearch';
import { LandingPage } from './components/LandingPage';
import { DashboardHome } from './components/DashboardHome';
import { AdminDashboard } from './components/AdminDashboard';
import { SpinWheelLootbox } from './components/SpinWheelLootbox';
import { RewardsHub } from './components/RewardsHub';
import { AIHealthCoach } from './components/AIHealthCoach';
import { HealthCheckinModal } from './components/HealthCheckinModal';
import { SettingsPanel } from './components/SettingsPanel';

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
import { Sparkles, Play, ArrowRight, Compass, Home, Settings, Search, MessageSquare, Award } from 'lucide-react';

export default function App() {
  const [isLanding, setIsLanding] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [userAccount, setUserAccount] = useState<{ name: string; email: string; isGoogle: boolean; uid?: string; photoURL?: string } | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [isProMode, setIsProMode] = useState<boolean>(false);
  const [theme, setTheme] = useState<'midnight' | 'morning'>(() => (localStorage.getItem('aura_theme') as 'midnight' | 'morning') || 'morning');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);

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
  };

  const handleAdminLogin = () => {
    setIsAdmin(true);
    setIsLanding(false);
  };

  const handleAdminBackToLanding = () => {
    setIsAdmin(false);
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
    setIsAdmin(false);
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
      <div className={`min-h-screen transition-colors duration-300 ${theme === 'morning' ? 'theme-morning bg-canvas text-charcoal' : 'theme-midnight bg-[#0f1730] text-[#F6F1ED]'}`}>
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
          onAdminLogin={handleAdminLogin}
          theme={theme}
          onToggleTheme={handleToggleTheme}
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
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  return (
    <div className={`min-h-screen flex font-sans selection:bg-sunlight selection:text-navy transition-colors duration-300 ${theme === 'morning' ? 'theme-morning bg-canvas text-charcoal' : 'theme-midnight bg-[#0f1730] text-[#F6F1ED]'}`}>
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onNavigate={handleNavigateTab}
        isProMode={isProMode}
        onToggleProMode={() => setIsProMode(!isProMode)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        userAccount={userAccount}
        onSignOut={handleLogout}
        onOpenSearch={() => setSearchOpen(true)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`
          flex-1 flex flex-col min-h-screen transition-all duration-300
          ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'}
        `}
      >
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
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

      {/* Guided Tour Banner when in Demo Mode */}
      {isDemoMode && (
        <div className="trust-band border-b border-[#FFFAF4]/12 py-2.5 px-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-[#FFFAF4]">
              <Compass className="w-4 h-4 text-sunlight shrink-0" />
              <span>
                <strong>Guided Demo Walkthrough Active:</strong> Click <strong>+ Check-In</strong> above to test AI attestation, feed <strong>Astra</strong>, or explore <strong>Sponsor Pools</strong>.
              </span>
            </div>
            <button
              onClick={handleBackToLanding}
              className="bg-sunlight text-navy font-bold px-3 py-1 rounded-[4px] text-[11px] whitespace-nowrap"
            >
              Sign In with Google
            </button>
          </div>
        </div>
      )}

      {/* Quick-Action Toolbar */}
      <div className="bg-peach/90 border-b border-line sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-2 overflow-x-auto scrollbar-none">
            <button
              onClick={() => handleNavigateTab('companion')}
              className={`quick-action-toolbar-btn ${activeTab === 'companion' ? 'active' : ''}`}
              aria-label="Dashboard"
              title="Dashboard (⌘1)"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <button
              onClick={() => setSearchOpen(true)}
              className="quick-action-toolbar-btn"
              aria-label="Search"
              title="Search (⌘K)"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search</span>
            </button>
            <div className="h-4 w-px bg-line mx-1" />
            <button
              onClick={() => handleNavigateTab('settings')}
              className={`quick-action-toolbar-btn ${activeTab === 'settings' ? 'active' : ''}`}
              aria-label="Settings"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-navy border border-line text-[#FFFAF4] text-xs font-bold px-4 py-3 rounded-[4px] flex items-center gap-2">
          <span className="text-base">🎉</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 lg:pb-6">
        {/* 5-Layer Economy Diagram Banner (Unlocked in Pro Mode) */}
        {isProMode && <JiweEconomyDiagram />}

        {/* Tab 1: Companion & Log (Primary Gameplay Loop) — Style-Guide Dashboard */}
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
          <AIHealthCoach companion={companion} />
        )}

        {activeTab === 'settings' && (
          <SettingsPanel
            theme={theme}
            onToggleTheme={handleToggleTheme}
            userName={userAccount?.name || 'Health Pioneer'}
            userEmail={userAccount?.email}
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

      {/* Footer */}
      <footer className="bg-navy py-6 text-center text-xs text-[#FFFAF4]/70">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBackToLanding}
              className="text-[#FFFAF4]/80 hover:text-sunlight underline text-xs"
            >
              Back to Landing
            </button>
            <span>•</span>
            <strong className="text-[#FFFAF4]">AuraHealth MVP</strong> • Daily Wellness & Community Health Adherence Platform
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Verifiable Health Ledger</span>
            <span>•</span>
            <span>Sustainable Reward Economy</span>
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
        theme={theme}
      />
      </div>
    </div>
  );
}

