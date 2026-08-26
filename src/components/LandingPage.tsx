import React, { useState } from 'react';
import { AuraLogo } from './AuraLogo';
import { Hero } from './landing/Hero';
import { Proof } from './landing/Proof';
import { Features } from './landing/Features';
import { Rewards } from './landing/Rewards';
import { Pricing } from './landing/Pricing';
import { Cta } from './landing/Cta';
import {
  ShieldCheck,
  ArrowRight,
  Play,
  LogOut,
  Mail,
  User,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  Lock,
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
  onOpenPremium: () => void;
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
  onOpenPremium,
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

  return (
    <div className="min-h-screen flex flex-col justify-between bg-canvas text-white">
      <header className="sticky top-0 z-40 navbar-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <AuraLogo size="md" inverted />
          <nav className="hidden md:flex items-center gap-6" aria-label="Page">
            {[
              { href: '#features', label: 'Features' },
              { href: '#proof', label: 'Proof' },
              { href: '#rewards', label: 'Rewards' },
              { href: '#pricing', label: 'Pricing' },
            ].map((link) => (
              <a key={link.href} href={link.href} className="landing-nav-link">
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2 shrink-0">
            {(userAccount || isDemoMode) && onEnterDashboard ? (
              <>
                <button type="button" onClick={onEnterDashboard} className="btn-primary text-xs">
                  Enter Dashboard
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                {onSignOut && (
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="btn-ghost text-xs"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onRealGoogleSignIn}
                  disabled={isLoggingIn}
                  className="btn-ghost text-xs px-4 py-2"
                >
                  <GoogleMark />
                  {isLoggingIn ? 'Connecting...' : 'Sign In'}
                </button>
                <button type="button" onClick={onOpenPremium} className="btn-primary text-xs hidden sm:inline-flex">
                  Start Free Trial
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
        <nav className="md:hidden flex items-center gap-4 overflow-x-auto px-4 pb-3" aria-label="Page">
          {[
            { href: '#features', label: 'Features' },
            { href: '#proof', label: 'Proof' },
            { href: '#rewards', label: 'Rewards' },
            { href: '#pricing', label: 'Pricing' },
          ].map((link) => (
            <a key={link.href} href={link.href} className="landing-nav-link whitespace-nowrap">
              {link.label}
            </a>
          ))}
        </nav>
      </header>

      <main className="hero-gradient max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-14 flex-1 w-full">
        {(userAccount || isDemoMode) && onEnterDashboard && (
          <div className="trust-band-teal max-w-3xl mx-auto w-full mb-8 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm font-bold">Welcome back, {userAccount?.name || 'Guest'}</p>
            <button type="button" onClick={onEnterDashboard} className="btn-primary text-xs shrink-0">
              Enter Dashboard
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <Hero onStartTrial={onOpenPremium} />
        <Features />
        <Proof />
        <Rewards />
        <Pricing onStartTrial={onOpenPremium} />
        <Cta onUpgrade={onOpenPremium} />

        {!(userAccount || isDemoMode) && (
          <div className="max-w-xl mx-auto flex flex-wrap items-center justify-center gap-3 text-sm">
            <button type="button" onClick={onRealGoogleSignIn} disabled={isLoggingIn} className="btn-ghost text-xs">
              <GoogleMark />
              Continue with Google
            </button>
            <button
              type="button"
              onClick={() => {
                setEmailTab('signin');
                setShowEmailModal(true);
              }}
              className="btn-ghost text-xs"
            >
              <Mail className="w-3.5 h-3.5" />
              Email
            </button>
            <button type="button" onClick={onStartDemo} className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1">
              <Play className="w-3.5 h-3.5" />
              Guest
            </button>
            <button type="button" onClick={() => setShowGoogleModal(true)} className="text-[11px] text-slate-500 underline">
              Custom Google email
            </button>
          </div>
        )}
      </main>

      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="aura-card w-full max-w-md p-6 relative">
            <button type="button" onClick={() => setShowGoogleModal(false)} className="absolute top-4 right-4 text-muted hover:text-charcoal text-sm">
              ✕
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-[4px] bg-canvas border border-line flex items-center justify-center shrink-0">
                <GoogleMark />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Sign In with Google Account</h3>
                <p className="text-xs text-muted leading-[1.6]">Firebase Auth — enter the Google account to use</p>
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="aura-card w-full max-w-md p-6 relative">
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
                <h3 className="text-lg font-bold text-white">
                  {emailTab === 'signup' ? 'Create Your Email Account' : 'Welcome Back'}
                </h3>
                <p className="text-xs text-muted leading-[1.6]">Firebase email authentication</p>
              </div>
            </div>

            <div className="grid grid-cols-2 bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-bold mb-5">
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
          </div>
        </div>
      )}

      <footer className="bg-[#07101c] py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <strong className="text-white">Aura Health</strong>
          {onAdminLogin && (
            <button
              type="button"
              onClick={onAdminLogin}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-[#FFFAF4]/70 hover:text-sunlight px-3 py-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};
