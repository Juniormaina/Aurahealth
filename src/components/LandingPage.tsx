import React, { useState } from 'react';
import { AuraLogo } from './AuraLogo';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Play,
  Heart,
  Coins,
  Activity,
  UserCheck,
  Globe,
  Lock,
  ChevronRight,
  Gift,
  LogOut,
  Award,
  Watch,
  Flame,
  ArrowUpRight,
  Sun,
  Moon
} from 'lucide-react';

interface LandingPageProps {
  onGoogleSignIn: (userEmail: string, userName: string) => void;
  onRealGoogleSignIn: () => void;
  onStartDemo: () => void;
  isLoggingIn?: boolean;
  userAccount?: { name: string; email: string; isGoogle: boolean; uid?: string; photoURL?: string } | null;
  isDemoMode?: boolean;
  onEnterDashboard?: () => void;
  onSignOut?: () => void;
  theme?: 'midnight' | 'morning';
  onToggleTheme?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGoogleSignIn,
  onRealGoogleSignIn,
  onStartDemo,
  isLoggingIn = false,
  userAccount,
  isDemoMode,
  onEnterDashboard,
  onSignOut,
  theme = 'morning',
  onToggleTheme,
}) => {
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  const handleQuickGoogleSelect = (email: string, name: string) => {
    onGoogleSignIn(email, name);
  };

  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;
    const derivedName = customName || customEmail.split('@')[0];
    onGoogleSignIn(customEmail, derivedName);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-rose-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <AuraLogo size="md" />

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-extrabold transition-all ${
                  theme === 'morning'
                    ? 'bg-amber-100 text-amber-950 border-amber-300 hover:bg-amber-200 shadow-sm'
                    : 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700'
                }`}
                title="Switch Theme"
              >
                {theme === 'morning' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                    <span className="hidden sm:inline">Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-indigo-300 fill-indigo-300/30" />
                    <span className="hidden sm:inline">Dark</span>
                  </>
                )}
              </button>
            )}

            {(userAccount || isDemoMode) && onEnterDashboard ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onEnterDashboard}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <span>Enter Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    className="bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-200 border border-slate-700 px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={onStartDemo}
                  className="text-xs font-semibold text-slate-300 hover:text-white px-3.5 py-2 rounded-lg hover:bg-slate-800 transition-colors hidden sm:flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  Quick Demo
                </button>
                <button
                  onClick={onRealGoogleSignIn}
                  disabled={isLoggingIn}
                  className="bg-white text-slate-950 hover:bg-slate-100 text-xs font-extrabold px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  {isLoggingIn ? 'Connecting...' : 'Sign In with Google'}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-14 flex-1 flex flex-col justify-center">
        {/* Active User Session Banner */}
        {(userAccount || isDemoMode) && onEnterDashboard && (
          <div className="max-w-3xl mx-auto w-full mb-8 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-indigo-950/80 p-4 rounded-2xl border border-emerald-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-bold text-lg shrink-0">
                👤
              </div>
              <div>
                <div className="text-xs font-black text-white flex items-center gap-2">
                  <span>Welcome back, {userAccount?.name || 'Guided Demo Explorer'}!</span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.2 rounded-full font-bold">
                    Active Session
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Your daily companion Astra is ready for health check-ins and rewards.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onEnterDashboard}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 hover:scale-105 active:scale-95"
              >
                <span>Enter Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-200 border border-slate-700 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Top Highlight Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-emerald-500/10 border border-slate-700/80 rounded-full px-4 py-1.5 text-xs text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Daily Wellness • Evolving Companion • Real Rewards</span>
          </div>
        </div>

        {/* Core Tagline / Value Proposition Sentence */}
        <div className="text-center max-w-4xl mx-auto mb-10 space-y-4">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            AuraHealth
          </h1>

          {/* Exact Value Sentence Highlight */}
          <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900 border border-slate-800 shadow-2xl my-4">
            <p className="text-lg sm:text-2xl font-black bg-gradient-to-r from-rose-300 via-amber-200 to-emerald-300 bg-clip-text text-transparent leading-snug">
              “Track your daily wellness, evolve your digital health companion, and earn real rewards.”
            </p>
          </div>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
            Turn simple daily check-ins into an engaging journey. Connect wearables, evolve your companion Astra, unlock community sponsor clinic vouchers, and track health adherence with complete ease.
          </p>
        </div>

        {/* 3-Step Interactive Value Funnel */}
        <div className="mb-14">
          <h2 className="text-center text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-6">
            The AuraHealth 3-Step Value Funnel
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full">
            {/* Step 1 */}
            <div className="bg-slate-900/80 p-6 rounded-2xl border border-rose-500/30 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-rose-500/60 transition-all">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-rose-500/10 rounded-full blur-xl group-hover:bg-rose-500/20 transition-all" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-300 font-black text-xs flex items-center justify-center border border-rose-500/30">
                    01
                  </span>
                  <Watch className="w-5 h-5 text-rose-400" />
                </div>
                <h3 className="text-lg font-black text-white mb-2 group-hover:text-rose-300 transition-colors">
                  Track Your Daily Wellness
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Auto-sync biometrics via Google Fit or Apple Health, or quickly log water, sleep, mood, and medication adherence in under 10 seconds.
                </p>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Wearable hardware verified</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900/80 p-6 rounded-2xl border border-amber-500/30 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-amber-500/60 transition-all">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 font-black text-xs flex items-center justify-center border border-amber-500/30">
                    02
                  </span>
                  <Heart className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-lg font-black text-white mb-2 group-hover:text-amber-300 transition-colors">
                  Evolve Your Companion
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Your digital AI companion Astra reacts to your daily consistency—leveling up, expressing mood, and maintaining high vitality as you stay on track.
                </p>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Streak protection & companion health</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900/80 p-6 rounded-2xl border border-emerald-500/30 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-emerald-500/60 transition-all">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 font-black text-xs flex items-center justify-center border border-emerald-500/30">
                    03
                  </span>
                  <Award className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-lg font-black text-white mb-2 group-hover:text-emerald-300 transition-colors">
                  Earn Real Rewards
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Collect 🐚 Cowries for daily check-ins, spin the daily Loot Wheel, and redeem real clinic vouchers, gym passes, and partner health benefit codes.
                </p>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
                <Gift className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Instant voucher redemptions</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2 Getting Started Option Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full mb-16">
          {/* Card 1: Sign in with Google */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-900/90 border border-slate-700/80 hover:border-rose-500/50 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group transition-all hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all pointer-events-none" />
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white shadow-inner">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <span className="bg-rose-500/10 text-rose-300 text-xs font-bold px-2.5 py-1 rounded-full border border-rose-500/20">
                  Option 1
                </span>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-rose-300 transition-colors">
                Sign Up / Sign In with Google
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                Instant 1-click access using your Google account. We automatically assign a secure health ledger profile so you never handle wallets or recovery phrases.
              </p>

              <ul className="space-y-2 mb-8 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>+200 Welcome Cowries</strong> bonus added instantly</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Invisible cryptographic verification behind the scenes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Saves your daily check-in streaks & pet progress</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <button
                onClick={onRealGoogleSignIn}
                disabled={isLoggingIn}
                className="w-full bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-slate-950 font-black text-sm py-3.5 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#000"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#000"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#000"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#000"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isLoggingIn ? 'Signing in with Google...' : 'Sign In with Google Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowGoogleModal(true)}
                className="w-full text-[11px] text-slate-400 hover:text-slate-200 py-1 font-medium underline"
              >
                Or enter custom Google account email
              </button>
            </div>
          </div>

          {/* Card 2: Interactive Demo Walkthrough */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-900/90 border border-slate-700/80 hover:border-amber-500/50 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group transition-all hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 shadow-inner">
                  <Play className="w-6 h-6 fill-amber-400" />
                </div>
                <span className="bg-amber-500/10 text-amber-300 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-500/20">
                  Option 2
                </span>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                Interactive Demo Walkthrough
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                Jump right into the full application as a guest! Experience the active companion pet, daily health check-in modal, loot wheel, and sponsor grant pools with pre-loaded demo data.
              </p>

              <ul className="space-y-2 mb-8 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span><strong>No signup needed</strong> — instant access in 1 click</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Guided tour overlays explaining all features</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Test daily health logs, loot spins, and companion feeding</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onStartDemo}
              className="w-full bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-sm py-3.5 px-6 rounded-xl border border-amber-500/30 transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02]"
            >
              <Play className="w-4 h-4 fill-amber-300" />
              <span>Launch Guided Demo Walkthrough</span>
            </button>
          </div>
        </div>

        {/* Key Experience Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full">
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Evolving Digital Companion</h3>
              <p className="text-xs text-slate-400">
                Astra reacts to your daily hydration, sleep, and medication logs with whimsical expressions and level progressions.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Community Sponsor Grants</h3>
              <p className="text-xs text-slate-400">
                Healthcare sponsors fund real care grants, vitamin kits, and clinic vouchers released as community adherence targets are hit.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Seamless Security</h3>
              <p className="text-xs text-slate-400">
                Cryptographic adherence attestations verify daily health habits seamlessly under the hood without web3 popups or fees.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Google Sign-In Selection Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowGoogleModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Sign In with Google Account</h3>
                <p className="text-xs text-slate-400">Enter your Google account details to authenticate</p>
              </div>
            </div>

            <form onSubmit={handleCustomGoogleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Your Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Jordan Taylor"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Google Email Address</label>
                <input
                  type="email"
                  placeholder="name@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-2"
              >
                <span>Complete Google Authentication</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="mt-4 text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Secure account assigned automatically upon login.</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <strong className="text-slate-300">AuraHealth MVP</strong> • Daily Health Habit & Adherence Platform
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Seamless Web2/Web3 Bridge</span>
            <span>•</span>
            <span>Sustainable Reward Economy</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
