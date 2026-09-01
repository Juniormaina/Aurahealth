import React, { useState } from 'react';
import { Mail, RefreshCw } from 'lucide-react';

interface EmailVerifyBannerProps {
  email: string;
  sending: boolean;
  onResend: () => void;
  onRefresh: () => void;
}

export const EmailVerifyBanner: React.FC<EmailVerifyBannerProps> = ({
  email,
  sending,
  onResend,
  onRefresh,
}) => {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="border-b border-amber-400/30 bg-amber-400/10 py-2.5 px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        <div className="flex items-start sm:items-center gap-2 text-[#FFFAF4]">
          <Mail className="w-4 h-4 text-amber-300 shrink-0 mt-0.5 sm:mt-0" />
          <span>
            Confirm <strong>{email}</strong> to unlock Cowries, loot rewards, and Astra chat. Check
            your inbox (and spam) for the link we sent.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onResend}
            disabled={sending}
            className="btn-ghost text-[11px] py-1 px-3"
          >
            {sending ? 'Sending…' : 'Resend email'}
          </button>
          <button
            type="button"
            onClick={onRefresh}
            className="bg-primary text-[var(--color-primary-foreground)] font-bold px-3 py-1 rounded-[4px] text-[11px] whitespace-nowrap inline-flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            I confirmed
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="text-[11px] text-slate-400 hover:text-white px-1"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
};
