import React, { useState } from 'react';
import { AuraLogo, AuraMark } from './AuraLogo';
import {
  Sparkles,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Play,
  Heart,
  Coins,
  Lock,
  Gift,
  LogOut,
  Award,
  Watch,
  Flame,
  Sun,
  Moon,
  Mail,
  User,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
} from 'lucide-react';

interface LandingPageProps {
  onGoogleSignIn: (userEmail: string, userName: string) => void;
  onRealGoogleSignIn: () => void;
  onEmailSignIn?: (email: string, pass: string) => void;
  onEmailSignUp?: (email: string, pass: string, name: string) => void;
  onStartDemo: () => void;
  isLoggingIn?: boolean;
  userAccount?: { name: string; email: string; isGoogle: boolean; uid?: string; photoURL?: string } | null;
  isDemoMode?: boolean;
  onEnterDashboard?: () => void;
  onSignOut?: () => void;
  onAdminLogin?: () => void;
  theme?: 'midnight' | 'morning';
  onToggleTheme?: () => void;
}

const GoogleMark = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

export const LandingPage: React.FC<LandingPageProps> = ({
  onGoogleSignIn,
  onRealGoogleSignIn,
  onEmailSignIn,
  onEmailSignUp,
  onStartDemo,
  isLoggingIn = false,
  userAccount,
  isDemoMode,
  onEnterDashboard,
  onSignOut,
  onAdminLogin,
  theme = 'morning',
  onToggleTheme,
}) => {
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTab, setEmailTab] = useState<'signin' | 'signup'>('signup');
  const [emailAddress, setEmailAddress] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailName, setEmailName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;
    const derivedName = customName || customEmail.split('@')[0];
    onGoogleSignIn(customEmail, derivedName);
  };

  const handleEmailAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    if (!emailAddress || !emailPassword) {
      setEmailError('Please fill in both email and password.');
      return;
    }
    if (emailPassword.length < 6) {
      setEmailError('Password must be at least 6 characters.');
      return;
    }
    if (emailTab === 'signup') {
      if (onEmailSignUp) {
        onEmailSignUp(emailAddress, emailPassword, emailName || emailAddress.split('@')[0]);
      } else {
        onGoogleSignIn(emailAddress, emailName || emailAddress.split('@')[0]);
      }
    } else if (onEmailSignIn) {
      onEmailSignIn(emailAddress, emailPassword);
    } else {
      onGoogleSignIn(emailAddress, emailAddress.split('@')[0]);
    }
  };

  const isDark = theme === 'midnight';
  const page = isDark ? 'bg-[#0f1730] text-[#F6F1ED]' : 'bg-canvas text-charcoal';
  const heading = isDark ? 'text-[#F6F1ED]' : 'text-navy';
  const muted = isDark ? 'text-[#F6F1ED]/70' : 'text-muted';
  const card = 'aura-card p-6';

  return (
    <div className={`min-h-screen flex flex-col justify-between ${page}`}>
      <header className="sticky top-0 z-40 bg-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <AuraLogo size="md" inverted />
          <div className="flex items-center gap-3">
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className="flex items-center gap-1.5 px-3 py-2 rounded-[4px] text-xs font-bold bg-sunlight text-navy"
                title="Switch Theme"
              >
                {theme === 'morning' ? (
                  <>
                    <Sun className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Dark</span>
                  </>
                )}
              </button>
            )}

            {(userAccount || isDemoMode) && onEnterDashboard ? (
              <div className="flex items-center gap-2">
                <button type="button" onClick={onEnterDashboard} className="btn-primary text-xs">
                  Enter Dashboard
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                {onSignOut && (
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="text-xs font-semibold text-[#FFFAF4]/80 hover:text-[#FFFAF4] px-3 py-2 flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                )}
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onStartDemo}
                  className="text-xs font-semibold text-[#FFFAF4]/80 hover:text-sunlight px-3.5 py-2 hidden sm:flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-sunlight text-sunlight" />
                  Quick Demo
                </button>
                <button
                  type="button"
                  onClick={onRealGoogleSignIn}
                  disabled={isLoggingIn}
                  className="bg-[#FFFAF4] text-navy hover:bg-peach text-xs font-extrabold px-4 py-2 rounded-[4px] flex items-center gap-2"
                >
                  <GoogleMark />
                  {isLoggingIn ? 'Connecting...' : 'Sign In with Google'}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="hero-gradient max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-14 flex-1 flex flex-col justify-center w-full">
        {(userAccount || isDemoMode) && onEnterDashboard && (
          <div className="trust-band-teal max-w-3xl mx-auto w-full mb-8 p-4 rounded-[4px] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold flex items-center gap-2">
                Welcome back, {userAccount?.name || 'Guided Demo Explorer'}
                <span className="aura-badge aura-badge-success">Active Session</span>
              </div>
              <p className="text-[13px] leading-[1.6] mt-1">
                Astra is ready for health check-ins and Cowries rewards.
              </p>
            </div>
            <button type="button" onClick={onEnterDashboard} className="btn-primary text-xs shrink-0">
              Enter Dashboard
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 bg-peach border border-line rounded-[4px] px-4 py-1.5 text-xs text-muted">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>Daily Wellness • Evolving Companion • Real Rewards</span>
          </div>
        </div>

        <div className="flex justify-center mb-8">
          <AuraMark
            className="w-36 h-36 sm:w-44 sm:h-44 lg:w-52 lg:h-52"
            title="Aura Health mark: glowing ring with a pulsing heartbeat"
          />
        </div>

        <div className="text-center max-w-4xl mx-auto mb-10 space-y-4">
          <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight ${heading}`}>
            AuraHealth
          </h1>
          <p className={`text-lg sm:text-2xl font-semibold leading-[1.6] max-w-3xl mx-auto ${heading}`}>
            Track your daily wellness, evolve your digital health companion, and earn real rewards.
          </p>
          <p className={`text-sm sm:text-base leading-[1.6] max-w-2xl mx-auto ${muted}`}>
            Turn simple daily check-ins into a welcoming journey. Connect wearables, care for Astra, unlock community sponsor clinic vouchers, and keep health adherence easy to follow.
          </p>
          <div className="pt-2">
            <button type="button" onClick={onRealGoogleSignIn} disabled={isLoggingIn} className="btn-primary text-sm px-6 py-3">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="trust-band rounded-[4px] px-4 py-3 mb-12 max-w-5xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-sm leading-[1.6]">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="w-4 h-4 text-sunlight" />
            WHO-inspired verification structure
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[#FFFAF4]/80 text-[13px]">
            <span>12k+ community check-ins</span>
            <span>•</span>
            <span>Harmony-verified health pass</span>
            <span>•</span>
            <span>Community grant indicators</span>
          </div>
        </div>

        <h2 className={`text-center text-xs font-extrabold uppercase tracking-widest mb-6 ${muted}`}>
          The AuraHealth 3-Step Value Funnel
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full mb-14">
          {[
            {
              n: '01',
              icon: Watch,
              title: 'Track Your Daily Wellness',
              copy: 'Auto-sync biometrics via Google Fit or Apple Health, or quickly log water, sleep, mood, and medication in under 10 seconds.',
              note: 'Wearable hardware verified',
              noteIcon: CheckCircle2,
            },
            {
              n: '02',
              icon: Heart,
              title: 'Evolve Your Companion',
              copy: 'Astra reacts to your daily consistency—leveling up, expressing mood, and keeping vitality high as you stay on track.',
              note: 'Streak protection & companion health',
              noteIcon: Flame,
            },
            {
              n: '03',
              icon: Award,
              title: 'Earn Real Rewards',
              copy: 'Collect Cowries for daily check-ins, spin the Loot Wheel, and redeem clinic vouchers, gym passes, and partner benefit codes.',
              note: 'Instant voucher redemptions',
              noteIcon: Gift,
            },
          ].map((step) => (
            <div key={step.n} className={card}>
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 rounded-[4px] bg-navy text-sunlight font-black text-xs flex items-center justify-center">
                  {step.n}
                </span>
                <step.icon className="w-5 h-5 text-gold" />
              </div>
              <h3 className={`text-lg font-bold mb-2 ${heading}`}>{step.title}</h3>
              <p className={`text-sm leading-[1.6] mb-4 ${muted}`}>{step.copy}</p>
              <div className={`text-[12px] leading-[1.6] flex items-center gap-2 ${muted}`}>
                <step.noteIcon className="w-3.5 h-3.5 text-harmony shrink-0" />
                <span>{step.note}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto w-full mb-16">
          <div className={card}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-[4px] bg-ivory border border-line flex items-center justify-center">
                <GoogleMark />
              </div>
              <span className="text-[11px] font-bold text-muted">Option 1</span>
            </div>
            <h2 className={`text-xl font-bold mb-2 ${heading}`}>Sign In with Google</h2>
            <p className={`text-sm leading-[1.6] mb-4 ${muted}`}>
              Instant 1-click access with Google OAuth. Automatic health ledger syncing and streak progress persistence.
            </p>
            <ul className={`space-y-1.5 mb-6 text-sm leading-[1.6] ${muted}`}>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-harmony shrink-0" />
                +200 Welcome Cowries bonus
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-harmony shrink-0" />
                Automatic streak preservation
              </li>
            </ul>
            <button type="button" onClick={onRealGoogleSignIn} disabled={isLoggingIn} className="w-full btn-primary justify-center text-xs py-3">
              {isLoggingIn ? 'Signing in...' : 'Sign In with Google'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button type="button" onClick={() => setShowGoogleModal(true)} className={`w-full text-[11px] py-2 underline ${muted}`}>
              Custom Google Email
            </button>
          </div>

          <div className={card}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-[4px] bg-ivory border border-line flex items-center justify-center text-navy">
                <Mail className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-muted">Option 2</span>
            </div>
            <h2 className={`text-xl font-bold mb-2 ${heading}`}>Email Sign In / Sign Up</h2>
            <p className={`text-sm leading-[1.6] mb-4 ${muted}`}>
              Register or log in using your email and password. Fully integrated with Firebase Auth and cloud storage.
            </p>
            <ul className={`space-y-1.5 mb-6 text-sm leading-[1.6] ${muted}`}>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-harmony shrink-0" />
                Custom email & password account
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-harmony shrink-0" />
                Encrypted credentials & secure profiles
              </li>
            </ul>
            <button
              type="button"
              onClick={() => {
                setEmailTab('signup');
                setShowEmailModal(true);
              }}
              disabled={isLoggingIn}
              className="w-full btn-primary justify-center text-xs py-3"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Create Email Account
            </button>
            <button
              type="button"
              onClick={() => {
                setEmailTab('signin');
                setShowEmailModal(true);
              }}
              className="w-full text-[11px] text-navy font-bold py-2 underline flex items-center justify-center gap-1"
            >
              <LogIn className="w-3 h-3" />
              Already registered? Sign In
            </button>
          </div>

          <div className={card}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-[4px] bg-ivory border border-line flex items-center justify-center text-gold">
                <Play className="w-5 h-5 fill-gold" />
              </div>
              <span className="text-[11px] font-bold text-muted">Option 3</span>
            </div>
            <h2 className={`text-xl font-bold mb-2 ${heading}`}>Guest Walkthrough</h2>
            <p className={`text-sm leading-[1.6] mb-4 ${muted}`}>
              Explore instantly as a guest. Test Astra, the daily check-in modal, and the loot wheel.
            </p>
            <ul className={`space-y-1.5 mb-6 text-sm leading-[1.6] ${muted}`}>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-gold shrink-0" />
                No password needed — 1-click guest access
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-gold shrink-0" />
                Guided tour overlays
              </li>
            </ul>
            <button type="button" onClick={onStartDemo} className="w-full btn-ghost justify-center text-xs py-3 text-navy font-bold">
              <Play className="w-3.5 h-3.5 fill-gold text-gold" />
              Launch Guest Walkthrough
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full">
          {[
            { icon: Heart, title: 'Evolving Digital Companion', copy: 'Astra reacts to hydration, sleep, and medication logs with clear mood cues and level progress.' },
            { icon: Coins, title: 'Community Sponsor Grants', copy: 'Sponsors fund care grants, vitamin kits, and clinic vouchers as community adherence targets are met.' },
            { icon: Lock, title: 'Seamless Security', copy: 'Adherence attestations verify daily habits quietly—without wallet popups or surprise fees.' },
          ].map((item) => (
            <div key={item.title} className="aura-card p-5 flex items-start gap-3">
              <div className="w-10 h-10 rounded-[4px] bg-ivory border border-line flex items-center justify-center text-navy shrink-0">
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-sm font-bold mb-1 ${heading}`}>{item.title}</h3>
                <p className={`text-sm leading-[1.6] ${muted}`}>{item.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-navy/50 flex items-center justify-center p-4">
          <div className="bg-peach border border-line w-full max-w-md rounded-[4px] p-6 relative">
            <button type="button" onClick={() => setShowGoogleModal(false)} className="absolute top-4 right-4 text-muted hover:text-charcoal text-sm">
              ✕
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-[4px] bg-canvas border border-line flex items-center justify-center shrink-0">
                <GoogleMark />
              </div>
              <div>
                <h3 className="text-lg font-bold text-navy">Sign In with Google Account</h3>
                <p className="text-xs text-muted leading-[1.6]">Enter your Google account details to authenticate</p>
              </div>
            </div>
            <form onSubmit={handleCustomGoogleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-ink block mb-1">Your Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Jordan Taylor"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="aura-input"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-ink block mb-1">Google Email Address</label>
                <input
                  type="email"
                  placeholder="name@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  required
                  className="aura-input"
                />
              </div>
              <button type="submit" className="w-full btn-primary justify-center text-xs py-3 mt-2">
                Complete Google Authentication
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {showEmailModal && (
        <div className="fixed inset-0 z-50 bg-navy/50 flex items-center justify-center p-4">
          <div className="bg-peach border border-line w-full max-w-md rounded-[4px] p-6 relative">
            <button
              type="button"
              onClick={() => {
                setShowEmailModal(false);
                setEmailError(null);
              }}
              className="absolute top-4 right-4 text-muted hover:text-charcoal text-sm"
            >
              ✕
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-[4px] bg-ivory border border-line flex items-center justify-center shrink-0 text-navy">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-navy">
                  {emailTab === 'signup' ? 'Create Your Email Account' : 'Welcome Back'}
                </h3>
                <p className="text-xs text-muted leading-[1.6]">
                  {emailTab === 'signup' ? 'Register to start tracking your daily habits' : 'Sign in to access your Aura health ledger'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 bg-ivory p-1 rounded-[4px] border border-line text-xs font-bold mb-5">
              <button
                type="button"
                onClick={() => {
                  setEmailTab('signup');
                  setEmailError(null);
                }}
                className={`py-2 rounded-[4px] flex items-center justify-center gap-1.5 ${
                  emailTab === 'signup' ? 'bg-sunlight text-navy' : 'text-muted'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmailTab('signin');
                  setEmailError(null);
                }}
                className={`py-2 rounded-[4px] flex items-center justify-center gap-1.5 ${
                  emailTab === 'signin' ? 'bg-sunlight text-navy' : 'text-muted'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>
            </div>

            {emailError && (
              <div className="bg-peach border border-[#B42318]/30 text-[#B42318] text-xs p-3 rounded-[4px] mb-4 font-semibold leading-[1.6]">
                {emailError}
              </div>
            )}

            <form onSubmit={handleEmailAuthSubmit} className="space-y-4">
              {emailTab === 'signup' && (
                <div>
                  <label className="text-xs font-bold text-ink block mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-muted absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="e.g. Alex Morgan"
                      value={emailName}
                      onChange={(e) => setEmailName(e.target.value)}
                      required={emailTab === 'signup'}
                      className="aura-input pl-9"
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="text-xs font-bold text-ink block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted absolute left-3 top-3" />
                  <input
                    type="email"
                    placeholder="alex@example.com"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    required
                    className="aura-input pl-9"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-ink block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={emailPassword}
                    onChange={(e) => setEmailPassword(e.target.value)}
                    required
                    className="aura-input pl-9 pr-10"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={isLoggingIn} className="w-full btn-primary justify-center text-xs py-3 mt-2">
                {isLoggingIn ? (
                  'Processing...'
                ) : emailTab === 'signup' ? (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Create Account & Start
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Sign In to Dashboard
                  </>
                )}
              </button>
            </form>
            <div className="mt-4 text-[10px] text-muted text-center flex items-center justify-center gap-1 leading-[1.6]">
              <ShieldCheck className="w-3.5 h-3.5 text-harmony" />
              Firebase Auth & encrypted account records.
            </div>
          </div>
        </div>
      )}

      <footer className="bg-navy py-6 text-center text-xs text-[#FFFAF4]/70">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <strong className="text-[#FFFAF4]">AuraHealth MVP</strong> • Daily Health Habit & Adherence Platform
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Seamless Web2/Web3 Bridge</span>
            <span>•</span>
            <span>Sustainable Reward Economy</span>
          </div>
        </div>
        {onAdminLogin && (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={onAdminLogin}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-[#FFFAF4]/70 hover:text-sunlight px-3 py-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Login
            </button>
          </div>
        )}
      </footer>
    </div>
  );
};
