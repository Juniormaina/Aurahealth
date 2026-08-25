import React, { useState } from 'react';
import { Bell, ShieldCheck, Heart, Globe, ChevronDown, Watch } from 'lucide-react';
import { SESSION_LANGUAGES, SessionLanguageId, VALUE_PROPS } from '../content/valueProps';

interface SettingsPanelProps {
  userName: string;
  userEmail?: string;
  sessionLanguage: SessionLanguageId;
  onLanguageChange: (id: SessionLanguageId) => void;
  onOpenWearables: () => void;
  onOpenPremium: () => void;
  planLabel: string;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  userName,
  userEmail,
  sessionLanguage,
  onLanguageChange,
  onOpenWearables,
  onOpenPremium,
  planLabel,
}) => {
  const [reminders, setReminders] = useState(true);
  const [streakAlerts, setStreakAlerts] = useState(true);
  const [shareProgress, setShareProgress] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);

  return (
    <div className="space-y-6 max-w-3xl">
      <header>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1 leading-[1.6]">{VALUE_PROPS.microSessions}</p>
      </header>

      <section id="settings-profile" className="aura-card p-5 scroll-mt-24">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-3">Account</div>
        <h2 className="text-lg font-bold text-white">{userName}</h2>
        <p className="text-sm text-slate-400 leading-[1.6]">{userEmail || 'Guest walkthrough session'}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 text-xs text-emerald-300 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-3 py-1 capitalize">
            Plan: {planLabel}
          </span>
          <button type="button" onClick={onOpenPremium} className="text-xs font-semibold text-[#FFB800] underline">
            Change plan
          </button>
        </div>
      </section>

      <section className="aura-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#00FFC2]" />
          <h2 className="text-lg font-bold text-white">Session language</h2>
        </div>
        <p className="text-sm text-slate-400 leading-[1.6]">
          Guided micro-sessions in English, Kiswahili, and vernacular.
        </p>
        <select
          className="aura-input"
          value={sessionLanguage}
          onChange={(e) => onLanguageChange(e.target.value as SessionLanguageId)}
        >
          {SESSION_LANGUAGES.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.native} ({lang.label})
            </option>
          ))}
        </select>
      </section>

      <section className="aura-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-gold" />
          <h2 className="text-lg font-bold text-white">Reminders</h2>
        </div>
        {[
          { label: 'Daily check-in reminder', value: reminders, set: setReminders },
          { label: 'Streak protection alerts', value: streakAlerts, set: setStreakAlerts },
        ].map((item) => (
          <label key={item.label} className="flex items-center justify-between gap-4 py-2 border-b border-white/10 last:border-0">
            <span className="text-sm text-slate-200 leading-[1.6]">{item.label}</span>
            <input
              type="checkbox"
              checked={item.value}
              onChange={(e) => item.set(e.target.checked)}
              className="h-4 w-4 accent-[#F59E0B]"
            />
          </label>
        ))}
      </section>

      <section id="settings-health-pass" className="aura-card p-5 space-y-4 scroll-mt-24">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-harmony" />
          <h2 className="text-lg font-bold text-white">Health Pass Sync</h2>
        </div>
        <label className="flex items-center justify-between gap-4 py-2">
          <span className="text-sm text-slate-200 leading-[1.6]">Share anonymized progress with community grant banners</span>
          <input
            type="checkbox"
            checked={shareProgress}
            onChange={(e) => setShareProgress(e.target.checked)}
            className="h-4 w-4 accent-[#22D3EE]"
          />
        </label>
        <button
          type="button"
          onClick={() => setVerifyOpen((v) => !v)}
          className="w-full flex items-center justify-between text-left text-sm text-slate-300 hover:text-white"
        >
          <span className="inline-flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-300" />
            Verification & attestations
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${verifyOpen ? 'rotate-180' : ''}`} />
        </button>
        {verifyOpen && (
          <div className="text-sm text-slate-400 leading-[1.6] bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
            <p>Harmony-verified health pass is hashed on your account — not shown as a marketing banner.</p>
            <p>Zero-knowledge adherence attestations confirm daily habits without exposing raw logs.</p>
            <p>Health logs stay on your account. Proofs are hashed before they leave the device.</p>
          </div>
        )}
      </section>

      <section id="settings-wearables" className="aura-card p-5 space-y-3 scroll-mt-24">
        <div className="flex items-center gap-2">
          <Watch className="w-4 h-4 text-[#00FFC2]" />
          <h2 className="text-lg font-bold text-white">Wearables</h2>
        </div>
        <p className="text-sm text-slate-400 leading-[1.6]">
          Connect Fitbit, Apple Watch / Apple Health, or Google Fit so Astra can adapt sessions to real sleep and heart-rate data.
        </p>
        <button type="button" onClick={onOpenWearables} className="btn-ghost text-xs">
          Connect Fitbit or Apple Watch
        </button>
      </section>

      <section className="aura-card p-5 flex items-start gap-3">
        <Heart className="w-5 h-5 text-gold shrink-0 mt-0.5" />
        <p className="text-sm text-slate-400 leading-[1.6]">
          Aura Health is a wellness companion, not a diagnosis tool. For medical concerns, please speak with a licensed clinician.
        </p>
      </section>
    </div>
  );
};
