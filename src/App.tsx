import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { GlobalSearch } from './components/GlobalSearch';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { EmailVerifyBanner } from './components/EmailVerifyBanner';
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
import { persistCheckinRewards, persistGrant, persistSpend, persistWheelSpin, RewardsApiError } from './services/rewards';
import { fetchAdminSession } from './services/adminAuth';
import { checkinPayout, nextStreak, utcToday, MISSION_REWARDS, HABIT_REWARDS, BENEFIT_COSTS, QUICK_LOG_REWARDS, type LedgerSnapshot } from './server/rewardsCatalog';
import type { PlanInterval, UserPlan } from './server/commerceStore';

import {
  INITIAL_COMPANION,
  FRESH_USER_COMPANION,
  INITIAL_SPONSOR_POOLS,
  INITIAL_BADGES,
  INITIAL_CHECKINS,
  INITIAL_TX_LOGS,
  WHEEL_PRIZES,
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
  createOffChainActivityRecord,
  CONTRACT_ADDRESSES,
  EXPLORER_BASE,
} from './services/avalanche';

import {
  auth,
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  requestPasswordReset,
  resendEmailVerification,
  refreshAuthUser,
  checkRedirectResult,
  getAuthErrorMessage,
  logoutUser,
  syncUserProfile,
  saveHealthLogToFirestore,
  getUserHealthLogsFromFirestore,
  getCompanionFromFirestore,
  saveCompanionToFirestore,
  AUTH_ENTER_DASHBOARD_KEY,
  AUTH_FRESH_SIGNIN_KEY,
} from './services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

import confetti from 'canvas-confetti';
import { Compass, Home, Search, MessageSquare, Award } from 'lucide-react';

function applyLedger(prev: EconomyStats, ledger: LedgerSnapshot): EconomyStats {
  return {
    ...prev,
    cowriesBalance: ledger.cowriesBalance,
    totalXp: ledger.totalXp,
    currentStreak: ledger.currentStreak,
    longestStreak: ledger.longestStreak,
    lastCheckInDate: ledger.lastCheckInDate,
  };
}

function rewardErrorToast(err: unknown): string {
  if (err instanceof RewardsApiError && err.status === 503) {
    return 'Rewards ledger is not configured on the server. Progress is local to this session.';
  }
  if (err instanceof RewardsApiError && err.code === 'already_claimed') {
    return 'Already claimed.';
  }
  if (err instanceof RewardsApiError && err.code === 'insufficient_cowries') {
    return 'Insufficient Cowries.';
  }
  if (err instanceof RewardsApiError && err.code === 'spin_limit') {
    return 'Daily loot-wheel spins are used up. Come back tomorrow.';
  }
  if (err instanceof RewardsApiError && err.code === 'email_unverified') {
    return 'Confirm your email to earn Cowries and rewards.';
  }
  return 'Could not persist Cowries. Progress is local to this session.';
}

type SignedInAccount = {
  name: string;
  email: string;
  isGoogle: boolean;
  uid?: string;
  photoURL?: string;
  emailVerified?: boolean;
};

export default function App() {
  const [isLanding, setIsLanding] = useState<boolean>(true);
  const [showAuth, setShowAuth] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [userAccount, setUserAccount] = useState<SignedInAccount | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const authSyncUidRef = useRef<string | null>(null);
  const pendingEnterDashboardRef = useRef(false);
  const isFreshSignInRef = useRef(false);
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
  const [rewardKeys, setRewardKeys] = useState<string[]>([]);

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

  const handleFirebaseUserAuthenticated = async (user: User, opts?: { welcome?: boolean }) => {
    const run = async () => {
      try {
        const profile = await syncUserProfile(user);
        setUserAccount({
          name: profile.displayName,
          email: profile.email,
          isGoogle: user.providerData.some((p) => p.providerId === 'google.com'),
          uid: user.uid,
          photoURL: user.photoURL || '',
          emailVerified: user.emailVerified,
        });
        setIsDemoMode(false);
        setShowAuth(false);
        setAuthFormError(null);

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
        setRewardKeys(profile.completedRewardKeys ?? []);
        setBadges(INITIAL_BADGES.map((b) => ({ ...b, unlockedAt: undefined, tokenId: undefined, txHash: undefined })));

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

        const userLogs = await getUserHealthLogsFromFirestore(user.uid);
        setCheckIns(userLogs && userLogs.length > 0 ? userLogs : []);

        if (opts?.welcome) {
          showToast(
            user.emailVerified
              ? `Welcome ${profile.displayName}! Authenticated session active.`
              : `Welcome ${profile.displayName}! Confirm the link we sent to ${profile.email} to unlock Cowries and Astra chat.`
          );
        }
      } catch (err: unknown) {
        console.error('Failed syncing user profile:', err);
      }
    };
    const next = authSyncChain.current.then(run, run);
    authSyncChain.current = next.then(
      () => undefined,
      () => undefined
    );
    return next;
  };

  useEffect(() => {
    checkRedirectResult().catch((err) => {
      console.error('Redirect sign-in failed:', err);
      setAuthError(getAuthErrorMessage(err));
    });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await handleFirebaseUserAuthenticated(user);
      } else {
        authSyncUidRef.current = null;
        setUserAccount(null);
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleFirebaseUserAuthenticated = async (user: User) => {
    if (authSyncUidRef.current === user.uid) return;
    authSyncUidRef.current = user.uid;

    const shouldEnterDashboard =
      pendingEnterDashboardRef.current ||
      sessionStorage.getItem(AUTH_ENTER_DASHBOARD_KEY) === '1';
    const isFreshSignIn =
      isFreshSignInRef.current ||
      sessionStorage.getItem(AUTH_FRESH_SIGNIN_KEY) === '1';

    pendingEnterDashboardRef.current = false;
    isFreshSignInRef.current = false;
    sessionStorage.removeItem(AUTH_ENTER_DASHBOARD_KEY);
    sessionStorage.removeItem(AUTH_FRESH_SIGNIN_KEY);

    try {
      const profile = await syncUserProfile(user);
      const isGoogle = user.providerData.some((provider) => provider.providerId === 'google.com');
      setUserAccount({
        name: profile.displayName,
        email: profile.email,
        isGoogle,
        uid: user.uid,
        photoURL: user.photoURL || '',
      });
      setIsDemoMode(false);
      setShowAuth(false);
      setAuthError(null);

      if (shouldEnterDashboard) {
        setIsLanding(false);
      }

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
      setRewardKeys(profile.completedRewardKeys ?? []);

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

      if (isFreshSignIn) {
        showToast(`Welcome ${profile.displayName}! Authenticated session active.`);
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#e11d48', '#38bdf8', '#10b981', '#fbbf24'],
        });
      }
    } catch (err: any) {
      authSyncUidRef.current = null;
      console.error('Failed syncing user profile:', err);
      setAuthError(getAuthErrorMessage(err));
    }
  };

  const resetPendingAuthFlow = () => {
    pendingEnterDashboardRef.current = false;
    isFreshSignInRef.current = false;
    authSyncUidRef.current = null;
  };

  const handleRealGoogleSignIn = async () => {
    setAuthError(null);
    setIsLoggingIn(true);
    isFreshSignInRef.current = true;
    pendingEnterDashboardRef.current = true;
    try {
      await signInWithGoogle();
    } catch (err: any) {
      if (err.message?.includes('Redirecting')) {
        showToast('Redirecting to Google Authentication...');
        return;
      }
      resetPendingAuthFlow();
      setAuthError(getAuthErrorMessage(err));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleEmailSignIn = async (email: string, pass: string) => {
    setAuthError(null);
    setIsLoggingIn(true);
    isFreshSignInRef.current = true;
    pendingEnterDashboardRef.current = true;
    try {
      await signInWithEmail(email, pass);
    } catch (err: any) {
      console.warn('Email Sign-In error:', err);
      resetPendingAuthFlow();
      setAuthError(getAuthErrorMessage(err));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleEmailSignUp = async (email: string, pass: string, name: string) => {
    setAuthError(null);
    setIsLoggingIn(true);
    isFreshSignInRef.current = true;
    pendingEnterDashboardRef.current = true;
    try {
      await signUpWithEmail(email, pass, name);
    } catch (err: any) {
      console.warn('Email Sign-Up error:', err);
      resetPendingAuthFlow();
      setAuthError(getAuthErrorMessage(err));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleForgotPassword = async (email: string) => {
    try {
      await requestPasswordReset(email);
    } catch (err: any) {
      if (err?.code === 'auth/user-not-found') return;
      throw new Error(getAuthErrorMessage(err));
    }
  };

  const handleResendVerification = async () => {
    setVerifyBusy(true);
    try {
      await resendEmailVerification();
      showToast('Verification email sent. Check inbox and spam.');
    } catch (err: any) {
      showToast(getAuthErrorMessage(err));
    } finally {
      setVerifyBusy(false);
    }
  };

  const handleConfirmVerified = async () => {
    const user = await refreshAuthUser();
    if (user?.emailVerified) {
      setUserAccount((prev) => (prev ? { ...prev, emailVerified: true } : prev));
      showToast('Email confirmed. Cowries and Astra chat are unlocked.');
    } else {
      showToast('Not confirmed yet. Open the link in the email, then try again.');
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setUserAccount(null);
    setIsAdmin(false);
    setIsLanding(true);
    setShowAuth(false);
    setAuthFormError(null);
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
  const handleCheckinSuccess = async (newCheckIn: HealthCheckIn) => {
    let awarded = newCheckIn;
    let ledgerApplied = false;
    let skipLocalLedger = false;

    if (userAccount?.uid) {
      try {
        const ledger = await persistCheckinRewards({
          medicationTaken: newCheckIn.medicationTaken,
          activityMinutes: newCheckIn.activityMinutes,
        });
        awarded = {
          ...newCheckIn,
          cowriesEarned: ledger.cowriesEarned,
          xpEarned: ledger.xpEarned,
        };
        setStats((prev) => applyLedger(prev, ledger));
        setRewardKeys(ledger.completedRewardKeys);
        setCompanion((prev) => {
          const newXp = prev.xp + ledger.xpEarned;
          let newLevel = prev.level;
          let newStage = prev.stage;
          if (newXp >= prev.xpToNextLevel) {
            newLevel += 1;
            if (newLevel >= 5 && prev.stage === 'Hatchling') newStage = 'Spark Companion';
          }
          const updated = {
            ...prev,
            totalCheckIns: prev.totalCheckIns + 1,
            streakDays: ledger.currentStreak,
            xp: newXp,
            level: newLevel,
            stage: newStage,
            health: 100,
            vitality: Math.min(100, prev.vitality + 10),
          };
          saveCompanionToFirestore(userAccount.uid!, updated).catch(console.error);
          return updated;
        });
        ledgerApplied = true;
      } catch (err) {
        showToast(rewardErrorToast(err));
        if (
          err instanceof RewardsApiError &&
          (err.code === 'email_unverified' || err.code === 'already_claimed')
        ) {
          skipLocalLedger = true;
        }
      }
      saveHealthLogToFirestore(userAccount.uid, awarded).catch(console.error);
    }

    setCheckIns((prev) => [awarded, ...prev]);

    if (!ledgerApplied && !skipLocalLedger) {
      const today = utcToday();
      const payout = checkinPayout(newCheckIn.medicationTaken, newCheckIn.activityMinutes);
      awarded = { ...awarded, cowriesEarned: payout.cowries, xpEarned: payout.xp };
      setStats((prev) => {
        const streak = nextStreak(prev.lastCheckInDate, today, prev.currentStreak);
        const longest = Math.max(prev.longestStreak, streak);
        return {
          ...prev,
          cowriesBalance: prev.cowriesBalance + payout.cowries,
          totalXp: prev.totalXp + payout.xp,
          currentStreak: streak,
          longestStreak: longest,
          lastCheckInDate: today,
        };
      });
      setCompanion((prev) => {
        const newXp = prev.xp + payout.xp;
        let newLevel = prev.level;
        let newStage = prev.stage;
        if (newXp >= prev.xpToNextLevel) {
          newLevel += 1;
          if (newLevel >= 5 && prev.stage === 'Hatchling') newStage = 'Spark Companion';
        }
        const updated = {
          ...prev,
          totalCheckIns: prev.totalCheckIns + 1,
          streakDays: nextStreak(stats.lastCheckInDate, today, prev.streakDays),
          xp: newXp,
          level: newLevel,
          stage: newStage,
          health: 100,
          vitality: Math.min(100, prev.vitality + 10),
        };
        if (userAccount?.uid) {
          saveCompanionToFirestore(userAccount.uid, updated).catch(console.error);
        }
        return updated;
      });
    }

    if (awarded.txHash && awarded.blockNumber != null) {
      setTxLogs((prev) => [
        {
          hash: awarded.txHash!,
          blockNumber: awarded.blockNumber,
          timestamp: awarded.timestamp,
          from: wallet.isSandbox ? 'wallet' : wallet.address,
          to: CONTRACT_ADDRESSES.StreakTracker,
          contractName: 'StreakTracker.sol',
          method: 'checkIn',
          status: 'Confirmed',
          gasUsed: '—',
          nAvaxFee: 'AVAX',
          eventEmitted: `CheckedIn(score:${awarded.aiAttestationScore})`,
          explorersUrl: `${EXPLORER_BASE}/tx/${awarded.txHash}`,
          onChain: true,
        },
        ...prev,
      ]);
    } else {
      setTxLogs((prev) => [
        createOffChainActivityRecord(
          'Daily check-in',
          `+${awarded.cowriesEarned} cowries · not submitted on-chain`
        ),
        ...prev,
      ]);
    }

    if (ledgerApplied && awarded.cowriesEarned === 0 && awarded.xpEarned === 0) {
      showToast('Check-in saved. Daily Cowries were already awarded today.');
    } else if (ledgerApplied || !userAccount?.uid) {
      showToast(`Adherence record verified & saved to database! +${awarded.cowriesEarned} 🐚 & +${awarded.xpEarned} XP!`);
    }
    persistMetric(
      awarded.moodRating,
      awarded.anxietyLevel ?? Math.max(1, 11 - awarded.moodRating * 2),
      'checkin'
    );
    if (userPlan?.plan === 'free') {
      setPremiumOpen(true);
      trackFunnel('upgrade_prompt_shown', { after: 'checkin' });
    }
  };

  // Handle Onboarding Tutorial Mission Completed
  const applyCompanionXp = (
    addedXp: number,
    extras?: (prev: HealthCompanion) => Partial<HealthCompanion>
  ) => {
    setCompanion((prev) => {
      let nextStage = prev.stage;
      let nextLevel = prev.level;
      const newXp = prev.xp + addedXp;
      if (newXp >= prev.xpToNextLevel) {
        nextLevel += 1;
        if (nextLevel >= 2 && prev.stage === 'Egg') nextStage = 'Hatchling';
        if (nextLevel >= 5 && prev.stage === 'Hatchling') nextStage = 'Spark Companion';
      }
      const updated = {
        ...prev,
        ...(extras ? extras(prev) : {}),
        xp: newXp,
        level: nextLevel,
        stage: nextStage,
      };
      if (userAccount?.uid) {
        saveCompanionToFirestore(userAccount.uid, updated).catch(console.error);
      }
      return updated;
    });
  };

  const handleMissionCompleted = async (_addedXp: number, _addedCowries: number, missionId: string) => {
    const catalog = MISSION_REWARDS[missionId];
    if (!catalog) return;

    const missionExtras = (prev: HealthCompanion) => ({
      health: Math.min(100, prev.health + 10),
      vitality: Math.min(100, prev.vitality + 10),
      streakDays: Math.max(1, prev.streakDays),
    });

    if (userAccount?.uid) {
      try {
        const ledger = await persistGrant('mission', missionId);
        setStats((prev) => applyLedger(prev, ledger));
        setRewardKeys(ledger.completedRewardKeys);
        applyCompanionXp(ledger.xpEarned, missionExtras);
        showToast(`First-Day Mission Completed! +${ledger.xpEarned} XP & +${ledger.cowriesEarned} 🐚 Cowries unlocked!`);
        return;
      } catch (err) {
        if (err instanceof RewardsApiError && err.code === 'already_claimed') {
          showToast('Mission already claimed.');
          return;
        }
        showToast(rewardErrorToast(err));
        if (err instanceof RewardsApiError && err.code === 'email_unverified') return;
      }
    }

    setStats((prev) => ({
      ...prev,
      cowriesBalance: prev.cowriesBalance + catalog.cowries,
      totalXp: prev.totalXp + catalog.xp,
      currentStreak: Math.max(1, prev.currentStreak),
    }));
    applyCompanionXp(catalog.xp, missionExtras);
    if (!userAccount?.uid) {
      showToast(`First-Day Mission Completed! +${catalog.xp} XP & +${catalog.cowries} 🐚 Cowries unlocked!`);
    }
  };

  const handleRequestSpin = async (): Promise<WheelPrize> => {
    if (userAccount?.uid) {
      try {
        const ledger = await persistWheelSpin();
        setStats((prev) => applyLedger(prev, ledger));
        setRewardKeys(ledger.completedRewardKeys);
        if (ledger.xpEarned > 0) applyCompanionXp(ledger.xpEarned);
        const prize =
          WHEEL_PRIZES.find((p) => p.id === ledger.prizeId) || {
            id: ledger.prizeId,
            label: ledger.label,
            type: (ledger.type as WheelPrize['type']) || 'cowries',
            amount: ledger.cowriesEarned || ledger.xpEarned,
            color: '#38bdf8',
            icon: '🐚',
          };
        if (prize.type === 'boost') {
          setStats((prev) => ({ ...prev, avaxEarned: prev.avaxEarned + 0.05 }));
        }
        setTxLogs((prev) => [
          createOffChainActivityRecord('Loot wheel', `Prize: ${ledger.label} · not on-chain`),
          ...prev,
        ]);
        showToast(`Wheel Prize Claimed: ${ledger.label}!`);
        return prize;
      } catch (err) {
        showToast(rewardErrorToast(err));
        throw err;
      }
    }

    const won = WHEEL_PRIZES[Math.floor(Math.random() * WHEEL_PRIZES.length)];
    if (won.type === 'cowries') {
      const amt = typeof won.amount === 'number' ? won.amount : 100;
      setStats((prev) => ({ ...prev, cowriesBalance: prev.cowriesBalance + amt }));
    } else if (won.type === 'xp') {
      const amt = typeof won.amount === 'number' ? won.amount : 200;
      applyCompanionXp(amt);
    } else if (won.type === 'boost') {
      setStats((prev) => ({ ...prev, avaxEarned: prev.avaxEarned + 0.05 }));
    }
    setTxLogs((prev) => [
      createOffChainActivityRecord('Loot wheel', `Prize: ${won.label} · not on-chain`),
      ...prev,
    ]);
    showToast(`Wheel Prize Claimed: ${won.label}!`);
    return won;
  };

  const handleQuickLog = async (kind: QuickLogKind) => {
    const labels: Record<QuickLogKind, string> = {
      hydration: '+ Water 💧',
      medication: 'Meds logged',
      sleep: 'Rest boost',
      mood: 'Feeling good',
    };
    const catalog = QUICK_LOG_REWARDS[kind];
    const extras = (prev: HealthCompanion) => ({
      vitality: Math.min(100, prev.vitality + 4),
      mood: (kind === 'mood' ? 'joyful' : kind === 'sleep' ? 'sleepy' : 'energetic') as HealthCompanion['mood'],
    });
    setAstraReaction(labels[kind]);
    window.setTimeout(() => setAstraReaction(null), 1200);

    if (userAccount?.uid && catalog) {
      try {
        const ledger = await persistGrant('quicklog', kind);
        setStats((prev) => applyLedger(prev, ledger));
        setRewardKeys(ledger.completedRewardKeys);
        applyCompanionXp(ledger.xpEarned, extras);
        showToast(`${labels[kind]} · +${ledger.cowriesEarned} 🐚 & +${ledger.xpEarned} XP`);
        if (kind === 'mood') persistMetric(4, Math.max(1, latestAnxiety - 1), 'quick_log');
        return;
      } catch (err) {
        if (err instanceof RewardsApiError && err.code === 'already_claimed') {
          setCompanion((prev) => ({ ...prev, ...extras(prev) }));
          showToast(`${labels[kind]} · already counted today`);
          if (kind === 'mood') persistMetric(4, Math.max(1, latestAnxiety - 1), 'quick_log');
          return;
        }
        showToast(rewardErrorToast(err));
        if (err instanceof RewardsApiError && err.code === 'email_unverified') return;
      }
    }

    const xp = catalog?.xp ?? 8;
    const cowries = catalog?.cowries ?? 5;
    applyCompanionXp(xp, extras);
    setStats((prev) => ({
      ...prev,
      cowriesBalance: prev.cowriesBalance + cowries,
      totalXp: prev.totalXp + xp,
    }));
    if (!userAccount?.uid) {
      showToast(`${labels[kind]} · Astra gained XP`);
    }
    if (kind === 'mood') persistMetric(4, Math.max(1, latestAnxiety - 1), 'quick_log');
  };

  // Claim Benefit from Rewards Hub
  const handleClaimBenefit = async (benefitId: string): Promise<boolean> => {
    const benefit = BENEFIT_COSTS[benefitId];
    if (!benefit) return false;

    if (userAccount?.uid) {
      try {
        const ledger = await persistSpend(benefitId);
        setStats((prev) => applyLedger(prev, ledger));
        setRewardKeys(ledger.completedRewardKeys);
        showToast(`Redeemed "${ledger.title}" for ${ledger.cowriesSpent} 🐚! Benefit code saved to wallet.`);
        return true;
      } catch (err) {
        showToast(rewardErrorToast(err));
        return err instanceof RewardsApiError && err.code === 'already_claimed';
      }
    }

    if (stats.cowriesBalance < benefit.cowriesCost) {
      showToast(`Insufficient Cowries! You need ${benefit.cowriesCost} 🐚.`);
      return false;
    }
    setStats((prev) => ({
      ...prev,
      cowriesBalance: Math.max(0, prev.cowriesBalance - benefit.cowriesCost),
    }));
    showToast(`Redeemed "${benefit.title}" for ${benefit.cowriesCost} 🐚! Benefit code saved to wallet.`);
    return true;
  };

  const handleGoalUpdated = async (habitId: string) => {
    const catalog = HABIT_REWARDS[habitId];
    if (!catalog) return;

    const habitExtras = (prev: HealthCompanion) => ({
      health: Math.min(100, prev.health + 2),
      vitality: Math.min(100, prev.vitality + 3),
    });

    if (userAccount?.uid) {
      try {
        const ledger = await persistGrant('habit', habitId);
        setStats((prev) => applyLedger(prev, ledger));
        setRewardKeys(ledger.completedRewardKeys);
        applyCompanionXp(ledger.xpEarned, habitExtras);
        showToast(`Habit Milestone Completed! +${ledger.xpEarned} XP & +${ledger.cowriesEarned} 🐚 earned.`);
        return;
      } catch (err) {
        if (err instanceof RewardsApiError && err.code === 'already_claimed') {
          showToast('Already claimed for today.');
          return;
        }
        showToast(rewardErrorToast(err));
        if (err instanceof RewardsApiError && err.code === 'email_unverified') return;
      }
    }

    setStats((prev) => ({
      ...prev,
      cowriesBalance: prev.cowriesBalance + catalog.cowries,
      totalXp: prev.totalXp + catalog.xp,
    }));
    applyCompanionXp(catalog.xp, habitExtras);
    if (!userAccount?.uid) {
      showToast(`Habit Milestone Completed! +${catalog.xp} XP & +${catalog.cowries} 🐚 earned.`);
    }
  };

  // Claim Sponsor Pool Reward
  const handleClaimReward = (poolId: string) => {
    const targetPool = pools.find((p) => p.id === poolId);
    if (!targetPool) return;

    setStats((prev) => ({ ...prev, avaxEarned: prev.avaxEarned + 0.08 }));
    const tx = createOffChainActivityRecord(
      'Sponsor reward',
      `Claimed ${targetPool.rewardPerMilestone} · not on-chain`
    );
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
    const tx = createOffChainActivityRecord(
      'Sponsor pool',
      `Created ${newPool.title} · not on-chain`
    );
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
    if (!auth.currentUser.emailVerified) {
      showToast('Confirm your email before starting a Premium trial.');
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
    if (!auth.currentUser.emailVerified) {
      showToast('Confirm your email before upgrading to Premium.');
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
        onRealGoogleSignIn={handleRealGoogleSignIn}
        onEmailSignIn={handleEmailSignIn}
        onEmailSignUp={handleEmailSignUp}
        onForgotPassword={handleForgotPassword}
        onClearAuthError={() => setAuthFormError(null)}
        onStartDemo={handleStartDemo}
        onBack={() => {
          setAuthError(null);
          setShowAuth(false);
        }}
        isLoggingIn={isLoggingIn}
        authError={authError}
        onClearAuthError={() => setAuthError(null)}
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

      {userAccount && userAccount.emailVerified === false && (
        <EmailVerifyBanner
          email={userAccount.email}
          sending={verifyBusy}
          onResend={() => void handleResendVerification()}
          onRefresh={() => void handleConfirmVerified()}
        />
      )}

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
            onGoalUpdated={handleGoalUpdated}
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
              claimedBenefitIds={rewardKeys
                .filter((k) => k.startsWith('benefit:'))
                .map((k) => k.slice('benefit:'.length))}
            />

            <SpinWheelLootbox
              onRequestSpin={handleRequestSpin}
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
            emailVerified={userAccount?.emailVerified}
            onResendVerification={() => void handleResendVerification()}
            onRefreshVerification={() => void handleConfirmVerified()}
            verifyBusy={verifyBusy}
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

