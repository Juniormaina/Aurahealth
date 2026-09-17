import React, { useEffect, useState } from 'react';
import { Footprints, Utensils, HeartPulse, Droplets } from 'lucide-react';
import { buildDailySummary } from '../lib/lifestyleStorage';
import { buildLocalAuraInsight } from '../lib/lifestyleInsight';
import type { DailySummary } from '../types/lifestyle';
import { fetchHealthBrief, type HealthBriefItem } from '../services/healthBrief';

interface LifestyleTodayProps {
  userKey: string;
  revision?: number;
  onNavigateTab: (tab: string) => void;
  hydrationGlasses?: number;
}

export const LifestyleToday: React.FC<LifestyleTodayProps> = ({
  userKey,
  revision = 0,
  onNavigateTab,
  hydrationGlasses,
}) => {
  const [summary, setSummary] = useState<DailySummary>(() => buildDailySummary(userKey));
  const [brief, setBrief] = useState<HealthBriefItem | null>(null);
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    setSummary(buildDailySummary(userKey));
  }, [userKey, revision, hydrationGlasses]);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchHealthBrief().then((items) => {
      if (cancelled || !items.length) return;
      const day = new Date().getDate();
      setBrief(items[day % items.length]);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const insight = buildLocalAuraInsight(summary);
  const glasses = hydrationGlasses ?? summary.hydrationGlasses ?? 0;

  return (
    <div className="space-y-4">
      {!online && (
        <p className="text-[11px] text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
          Offline — your data is being saved on this device.
        </p>
      )}
      {online && (
        <p className="sr-only">Back online — lifestyle data stays on this device until cloud sync is enabled.</p>
      )}

      <section className="glass-panel rounded-2xl p-5">
        <p className="view-kicker">Today</p>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button type="button" onClick={() => onNavigateTab('shamba')} className="text-left rounded-xl bg-white/[0.03] border border-white/10 p-3 hover:border-white/25">
            <Footprints className="w-4 h-4 text-[var(--color-harmony)] mb-2" />
            <p className="text-[10px] uppercase tracking-wide text-slate-400">Movement</p>
            <p className="text-lg font-bold text-white tabular-nums">{summary.activeMinutes} min</p>
          </button>
          <button type="button" onClick={() => onNavigateTab('nutrition')} className="text-left rounded-xl bg-white/[0.03] border border-white/10 p-3 hover:border-white/25">
            <Utensils className="w-4 h-4 text-amber-300 mb-2" />
            <p className="text-[10px] uppercase tracking-wide text-slate-400">Nutrition</p>
            <p className="text-lg font-bold text-white tabular-nums">~{summary.nutrition.calories}</p>
            <p className="text-[10px] text-slate-500">est. kcal</p>
          </button>
          <button type="button" onClick={() => onNavigateTab('uko')} className="text-left rounded-xl bg-white/[0.03] border border-white/10 p-3 hover:border-white/25">
            <HeartPulse className="w-4 h-4 text-violet-300 mb-2" />
            <p className="text-[10px] uppercase tracking-wide text-slate-400">Recovery</p>
            <p className="text-lg font-bold text-white tabular-nums">
              {summary.recovery ? `${summary.recovery.score}` : '—'}
              {summary.recovery && <span className="text-sm text-slate-400"> / 100</span>}
            </p>
          </button>
          <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3">
            <Droplets className="w-4 h-4 text-cyan-300 mb-2" />
            <p className="text-[10px] uppercase tracking-wide text-slate-400">Hydration</p>
            <p className="text-lg font-bold text-white tabular-nums">{glasses} / 8</p>
            <p className="text-[10px] text-slate-500">glasses</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => onNavigateTab('shamba')} className="px-3 py-2 rounded-xl text-xs font-bold bg-primary text-[var(--color-primary-foreground)]">
            Log Activity
          </button>
          <button type="button" onClick={() => onNavigateTab('nutrition')} className="px-3 py-2 rounded-xl text-xs font-bold border border-white/15 text-slate-200">
            Log Meal
          </button>
          <button type="button" onClick={() => onNavigateTab('uko')} className="px-3 py-2 rounded-xl text-xs font-bold border border-white/15 text-slate-200">
            Check In
          </button>
        </div>
      </section>

      <section className="glass-panel rounded-2xl p-5 border border-[var(--color-harmony)]/20">
        <p className="view-kicker">Aura&apos;s Insight</p>
        <h3 className="text-lg font-bold text-white mt-1 font-display">{insight.headline}</h3>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed">{insight.body}</p>
        <p className="text-sm text-[var(--color-harmony)] mt-3 leading-relaxed">{insight.recommendation}</p>
      </section>

      {brief && (
        <section className="glass-panel rounded-2xl p-5">
          <p className="view-kicker">Aura Health Brief</p>
          <h3 className="text-sm font-bold text-white mt-1">{brief.title}</h3>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">{brief.body}</p>
        </section>
      )}
    </div>
  );
};
