import React, { useState } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { canAccessAdmin, isAdminAccessConfigured } from '../services/adminAuth';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  signedInEmail?: string | null;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  signedInEmail,
}) => {
  const [email, setEmail] = useState(signedInEmail || '');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const configured = isAdminAccessConfigured();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!configured) {
      setError('Admin access is not configured. Set VITE_ADMIN_EMAILS or VITE_ADMIN_ACCESS_CODE.');
      return;
    }
    if (!canAccessAdmin(email, accessCode)) {
      setError('That email or access code is not authorized for the admin console.');
      return;
    }
    onSuccess();
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

        {!configured ? (
          <p className="text-sm text-slate-300 leading-[1.6]">
            Admin access is locked until an allowlisted email or access code is set in the environment.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-ink block mb-1">Work email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="aura-input"
                placeholder="you@organization.org"
                required={!import.meta.env.VITE_ADMIN_ACCESS_CODE}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-ink block mb-1">Access code</label>
              <input
                type="password"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="aura-input"
                placeholder="Staff access code"
                autoComplete="current-password"
              />
            </div>
            {error && (
              <div className="bg-[var(--color-danger-bg)] border border-[var(--color-danger)]/40 text-[var(--color-danger)] text-xs p-3 rounded-xl font-semibold">
                {error}
              </div>
            )}
            <button type="submit" className="w-full btn-primary justify-center text-xs py-3">
              Continue to admin
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
