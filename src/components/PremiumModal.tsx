import React, { useState } from 'react';
import { X, Sparkles, Building2 } from 'lucide-react';
import { CORPORATE_PACKAGES, SUBSCRIPTION_TIERS, VALUE_PROPS } from '../content/valueProps';
import type { PlanInterval } from '../server/commerceStore';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTrial: () => void;
  onCheckout: (interval: PlanInterval) => void;
  onCorporateRequest: (payload: { company: string; contactEmail: string; seats: number; packageId: string }) => void;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({
  isOpen,
  onClose,
  onStartTrial,
  onCheckout,
  onCorporateRequest,
}) => {
  const [tab, setTab] = useState<'personal' | 'corporate'>('personal');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [packageId, setPackageId] = useState(CORPORATE_PACKAGES[0].id);
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="aura-card w-full max-w-lg p-5 sm:p-6 relative rounded-2xl border border-[#242E42] modal-sheet">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-[var(--color-accent-secondary)]" />
          <h2 className="text-xl font-bold text-white">Upgrade to AuraHealth Premium</h2>
        </div>
        <p className="text-sm text-slate-300 leading-[1.6] mb-4">{VALUE_PROPS.culturalRelevance}</p>

        <div className="grid grid-cols-2 bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-bold mb-4">
          <button
            type="button"
            className={`py-2 rounded-lg ${tab === 'personal' ? 'bg-primary text-[var(--color-primary-foreground)]' : 'text-slate-400'}`}
            onClick={() => setTab('personal')}
          >
            Personal
          </button>
          <button
            type="button"
            className={`py-2 rounded-lg ${tab === 'corporate' ? 'bg-primary text-[var(--color-primary-foreground)]' : 'text-slate-400'}`}
            onClick={() => setTab('corporate')}
          >
            Teams
          </button>
        </div>

        {tab === 'personal' ? (
          <div className="space-y-3">
            {SUBSCRIPTION_TIERS.map((tier) => (
              <button
                key={tier.id}
                type="button"
                onClick={() => (tier.id === 'monthly' ? onStartTrial() : onCheckout(tier.id))}
                className="w-full text-left aura-card p-4 border border-[#242E42] hover:border-[var(--color-primary)]/50"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-bold text-white">{tier.name}</span>
                  <span className="tabular-nums text-[#00FFC2] font-bold">
                    ${tier.priceUsd}
                    {tier.cadence !== 'once' ? `/${tier.cadence === 'month' ? 'mo' : 'yr'}` : ''}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{tier.highlight}</p>
              </button>
            ))}
            <button type="button" onClick={onStartTrial} className="w-full btn-primary justify-center text-sm py-3">
              Start Free Trial
            </button>
            <p className="text-[11px] text-slate-500 text-center">
              Trial lasts 7 days, then auto-subscribes to monthly Premium unless you cancel.
            </p>
          </div>
        ) : (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              onCorporateRequest({
                company,
                contactEmail: email,
                seats: CORPORATE_PACKAGES.find((p) => p.id === packageId)?.seats || 25,
                packageId,
              });
              setSent(true);
            }}
          >
            <p className="text-xs text-slate-400 leading-[1.6] flex items-start gap-2">
              <Building2 className="w-4 h-4 text-[#00FFC2] shrink-0 mt-0.5" />
              Corporate wellness packages for African teams — Swahili/vernacular sessions, wearable sync, and anxiety impact reports.
            </p>
            <input
              className="aura-input"
              placeholder="Company name"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
            />
            <input
              className="aura-input"
              type="email"
              placeholder="Work email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <select className="aura-input" value={packageId} onChange={(e) => setPackageId(e.target.value)}>
              {CORPORATE_PACKAGES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.seats} seats · ${p.priceUsd}/{p.cadence}
                </option>
              ))}
            </select>
            <button type="submit" className="w-full btn-primary justify-center text-sm py-3">
              {sent ? 'Request sent' : 'Request corporate package'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
