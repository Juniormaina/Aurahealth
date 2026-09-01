import React, { useState } from 'react';
import { AuraLogo } from './AuraLogo';
import {
  ArrowLeft,
  Play,
  Mail,
  User,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  Lock,
} from 'lucide-react';
import {
  MAX_NAME_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  isValidEmail,
  normalizeEmail,
  signinFieldError,
  signupFieldError,
} from '../services/authValidation';

interface AuthPageProps {
  onGoogleSignIn: () => void;
  onEmailSignIn: (email: string, pass: string) => void;
  onEmailSignUp: (email: string, pass: string, name: string) => void;
  onForgotPassword: (email: string) => Promise<void> | void;
  onStartDemo: () => void;
  onBack: () => void;
  onClearAuthError?: () => void;
  isLoggingIn?: boolean;
  authError?: string | null;
}

const GoogleMark = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

export const AuthPage: React.FC<AuthPageProps> = ({
  onGoogleSignIn,
  onEmailSignIn,
  onEmailSignUp,
  onForgotPassword,
  onStartDemo,
  onBack,
  onClearAuthError,
  isLoggingIn = false,
  authError = null,
}) => {
  const [emailTab, setEmailTab] = useState<'signin' | 'signup'>('signin');
  const [emailAddress, setEmailAddress] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailName, setEmailName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [resetNotice, setResetNotice] = useState<string | null>(null);
  const [resetBusy, setResetBusy] = useState(false);

  const visibleError = emailError || authError;

  const handleEmailAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setResetNotice(null);
    onClearAuthError?.();
    if (emailTab === 'signup') {
      const invalid = signupFieldError({
        name: emailName,
        email: emailAddress,
        password: emailPassword,
        confirmPassword,
      });
      if (invalid) {
        setEmailError(invalid);
        return;
      }
      onEmailSignUp(emailAddress, emailPassword, emailName);
    } else {
      const invalid = signinFieldError(emailAddress, emailPassword);
      if (invalid) {
        setEmailError(invalid);
        return;
      }
      onEmailSignIn(emailAddress, emailPassword);
    }
  };

  const handleForgotPassword = async () => {
    setEmailError(null);
    setResetNotice(null);
    onClearAuthError?.();
    if (!isValidEmail(normalizeEmail(emailAddress))) {
      setEmailError('Enter a valid email address first, then request a reset link.');
      return;
    }
    setResetBusy(true);
    try {
      await onForgotPassword(emailAddress);
      setResetNotice('If an account exists for that email, we sent a reset link. Check your inbox and spam folder.');
    } catch (err: unknown) {
      setEmailError(err instanceof Error ? err.message : 'Could not send a reset email.');
    } finally {
      setResetBusy(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] landscape-shell flex flex-col">
      <header className="sticky top-0 z-40 navbar-gradient">
        <div className="max-w-lg mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <button type="button" onClick={onBack} className="btn-ghost text-xs">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
          <AuraLogo size="sm" inverted showSubtitle={false} />
          <span className="w-16" aria-hidden />
        </div>
      </header>

      <main className="flex-1 w-full max-w-lg mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="view-title mb-2">
          {emailTab === 'signup' ? 'Create your Aura Health account' : 'Sign in to Aura Health'}
        </h1>
        <p className="view-copy mb-8">
          Continue with Google, email, or a guest walkthrough.
        </p>

        <div className="space-y-3 mb-8">
          <button
            type="button"
            onClick={onGoogleSignIn}
            disabled={isLoggingIn}
            className="w-full btn-primary justify-center text-sm py-3"
          >
            <GoogleMark />
            {isLoggingIn ? 'Connecting to Google...' : 'Continue with Google'}
          </button>
          <button type="button" onClick={onStartDemo} className="w-full btn-ghost justify-center text-sm py-3">
            <Play className="w-4 h-4" />
            Continue as Guest
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <span className="flex-1 h-px bg-white/10" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">or email</span>
          <span className="flex-1 h-px bg-white/10" />
        </div>

        <div className="glass-panel p-5 sm:p-6 rounded-2xl">
          <div className="grid grid-cols-2 bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-bold mb-5">
            <button
              type="button"
              onClick={() => {
                setEmailTab('signin');
                setEmailError(null);
                setResetNotice(null);
                onClearAuthError?.();
              }}
              className={`py-2 rounded-[4px] flex items-center justify-center gap-1.5 ${
                emailTab === 'signin' ? 'bg-primary text-[var(--color-primary-foreground)]' : 'text-muted'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setEmailTab('signup');
                setEmailError(null);
                setResetNotice(null);
                onClearAuthError?.();
              }}
              className={`py-2 rounded-[4px] flex items-center justify-center gap-1.5 ${
                emailTab === 'signup' ? 'bg-primary text-[var(--color-primary-foreground)]' : 'text-muted'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Sign Up
            </button>
          </div>

          {visibleError && (
            <div className="bg-[var(--color-danger-bg)] border border-[var(--color-danger)]/40 text-[var(--color-danger)] text-xs p-3 rounded-[4px] mb-4 font-semibold leading-[1.6]">
              {visibleError}
            </div>
          )}
          {resetNotice && (
            <div className="bg-emerald-400/10 border border-emerald-400/30 text-emerald-200 text-xs p-3 rounded-[4px] mb-4 font-semibold leading-[1.6]">
              {resetNotice}
            </div>
          )}

          <form onSubmit={handleEmailAuthSubmit} className="space-y-4" autoComplete="on">
            {emailTab === 'signup' && (
              <div>
                <label className="text-xs font-bold text-ink block mb-1" htmlFor="auth-name">
                  Full Name
                </label>
                <div className="relative">
                  <User className="pointer-events-none w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    autoCapitalize="words"
                    placeholder="e.g. Alex Morgan"
                    value={emailName}
                    onChange={(e) => setEmailName(e.target.value)}
                    required
                    minLength={2}
                    maxLength={MAX_NAME_LENGTH}
                    className="aura-input aura-input-icon-left"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="text-xs font-bold text-ink block mb-1" htmlFor="auth-email">
                Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="alex@example.com"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  required
                  maxLength={320}
                  className="aura-input aura-input-icon-left"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-ink block mb-1" htmlFor="auth-password">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-password"
                  name={emailTab === 'signup' ? 'new-password' : 'current-password'}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={emailTab === 'signup' ? 'new-password' : 'current-password'}
                  placeholder={
                    emailTab === 'signup'
                      ? `At least ${MIN_PASSWORD_LENGTH} characters, letter + number`
                      : 'Your password'
                  }
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  required
                  minLength={emailTab === 'signup' ? MIN_PASSWORD_LENGTH : 1}
                  maxLength={MAX_PASSWORD_LENGTH}
                  className="aura-input aura-input-icon-left aura-input-icon-right"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {emailTab === 'signup' && (
                <p className="text-[11px] text-slate-500 mt-1.5 leading-[1.5]">
                  Use {MIN_PASSWORD_LENGTH}–{MAX_PASSWORD_LENGTH} characters with a letter and a number.
                  We’ll email a confirmation link before Cowries and Astra chat unlock.
                </p>
              )}
            </div>
            {emailTab === 'signup' && (
              <div>
                <label className="text-xs font-bold text-ink block mb-1" htmlFor="auth-confirm">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-confirm"
                    name="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={MIN_PASSWORD_LENGTH}
                    maxLength={MAX_PASSWORD_LENGTH}
                    className="aura-input aura-input-icon-left"
                  />
                </div>
              </div>
            )}
            {emailTab === 'signin' && (
              <div className="flex justify-end -mt-1">
                <button
                  type="button"
                  onClick={() => void handleForgotPassword()}
                  disabled={isLoggingIn || resetBusy}
                  className="text-[11px] font-semibold text-[var(--color-harmony)] hover:underline"
                >
                  {resetBusy ? 'Sending reset link…' : 'Forgot password?'}
                </button>
              </div>
            )}
            <button type="submit" disabled={isLoggingIn} className="w-full btn-primary justify-center text-xs py-3 mt-2">
              {isLoggingIn ? (
                'Processing...'
              ) : emailTab === 'signup' ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create account
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign in
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
