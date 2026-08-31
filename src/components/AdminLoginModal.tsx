import React, { useState } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { fetchAdminSession } from '../services/adminAuth';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onNeedSignIn: () => void;
  isSignedIn: boolean;
  signedInEmail?: string | null;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onNeedSignIn,
  isSignedIn,
  signedInEmail,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isSignedIn) {
      onNeedSignIn();
      return;
    }
    setIsChecking(true);
    try {
      await fetchAdminSession();
      onSuccess();
    } catch (err: unknown) {
      const code = err && typeof err === 'object' && 'code' in err ? String((err as { code?: string }).code) : '';
      if (code === 'unauthenticated') {
        setError('Sign in with your staff Google or email account first.');
      } else if (code === 'forbidden') {
        setError('This account is not on the staff allowlist.');
      } else {
        setError('Could not verify admin access. Try again.');
      }
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="aura-card w-full max-w-md p-5 sm:p-6 relative modal-sheet">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-white text-sm">
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-line flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-[var(--color-accent-secondary)]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Admin console</h3>
            <p className="text-xs text-muted leading-[1.6]">Sponsor funding tools — staff only</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <p className="text-sm text-slate-300 leading-[1.6]">
            {isSignedIn
              ? `Continue as ${signedInEmail || 'your signed-in account'}. Access is checked on the server against the staff allowlist.`
              : 'Sign in with a staff account. Admin access is not granted from this page alone.'}
          </p>
          {error && (
            <div className="bg-[var(--color-danger-bg)] border border-[var(--color-danger)]/40 text-[var(--color-danger)] text-xs p-3 rounded-xl font-semibold">
              {error}
            </div>
          )}
          <button type="submit" disabled={isChecking} className="w-full btn-primary justify-center text-xs py-3">
            {isChecking ? 'Checking…' : isSignedIn ? 'Continue to admin' : 'Sign in to continue'}
          </button>
        </form>
      </div>
    </div>
  );
};
