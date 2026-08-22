import React, { useState } from 'react';
import { Sun, Moon, Bell, ShieldCheck, Heart, Globe } from 'lucide-react';

interface SettingsPanelProps {
  theme: 'midnight' | 'morning';
  onToggleTheme: () => void;
  userName: string;
  userEmail?: string;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  theme,
  onToggleTheme,
  userName,
  userEmail,
}) => {
  const [reminders, setReminders] = useState(true);
  const [streakAlerts, setStreakAlerts] = useState(true);
  const [shareProgress, setShareProgress] = useState(false);

  return (
    <div className="space-y-6 max-w-3xl">
      <header>
        <h1 className="text-2xl font-bold text-navy">Settings</h1>
        <p className="text-muted mt-1 leading-[1.6]">
          Tune reminders, appearance, and privacy so Aura Health stays encouraging without extra noise.
        </p>
      </header>

      <section className="aura-card p-5">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted mb-3">Account</div>
        <h2 className="text-lg font-bold text-navy">{userName}</h2>
        <p className="text-sm text-muted leading-[1.6]">{userEmail || 'Guest walkthrough session'}</p>
      </section>

      <section className="aura-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          {theme === 'morning' ? <Sun className="w-4 h-4 text-gold" /> : <Moon className="w-4 h-4 text-navy" />}
          <h2 className="text-lg font-bold text-navy">Appearance</h2>
        </div>
        <p className="text-sm text-muted leading-[1.6]">
          Light mode uses a warm cream canvas. Dark mode keeps the same navy structure on a softer evening surface.
        </p>
        <button type="button" onClick={onToggleTheme} className="btn-primary">
          Switch to {theme === 'morning' ? 'Dark' : 'Light'} mode
        </button>
      </section>

      <section className="aura-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-gold" />
          <h2 className="text-lg font-bold text-navy">Reminders</h2>
        </div>
        {[
          { label: 'Daily check-in reminder', value: reminders, set: setReminders },
          { label: 'Streak protection alerts', value: streakAlerts, set: setStreakAlerts },
        ].map((item) => (
          <label key={item.label} className="flex items-center justify-between gap-4 py-2 border-b border-line last:border-0">
            <span className="text-sm text-ink leading-[1.6]">{item.label}</span>
            <input
              type="checkbox"
              checked={item.value}
              onChange={(e) => item.set(e.target.checked)}
              className="h-4 w-4 accent-[#FBAF40]"
            />
          </label>
        ))}
      </section>

      <section className="aura-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-harmony" />
          <h2 className="text-lg font-bold text-navy">Privacy & trust</h2>
        </div>
        <label className="flex items-center justify-between gap-4 py-2">
          <span className="text-sm text-ink leading-[1.6]">Share anonymized progress with community grant banners</span>
          <input
            type="checkbox"
            checked={shareProgress}
            onChange={(e) => setShareProgress(e.target.checked)}
            className="h-4 w-4 accent-[#009688]"
          />
        </label>
        <div className="trust-band-teal rounded-[4px] px-4 py-3 text-sm leading-[1.6] flex items-start gap-2">
          <Globe className="w-4 h-4 mt-0.5 shrink-0" />
          Health logs stay on your account. Adherence proofs are hashed before they leave the device.
        </div>
      </section>

      <section className="aura-card p-5 flex items-start gap-3">
        <Heart className="w-5 h-5 text-gold shrink-0 mt-0.5" />
        <p className="text-sm text-muted leading-[1.6]">
          Aura Health is a wellness companion, not a diagnosis tool. For medical concerns, please speak with a licensed clinician.
        </p>
      </section>
    </div>
  );
};
