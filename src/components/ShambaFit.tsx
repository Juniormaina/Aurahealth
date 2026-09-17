import React, { useEffect, useMemo, useState } from 'react';
import { Footprints, Plus, Clock, Flame, Zap } from 'lucide-react';
import { SHAMBA_ACTIVITIES } from '../content/shambaActivities';
import {
  buildActivity,
  isSameLocalDay,
  localDateKey,
} from '../lib/lifestyleCalculations';
import { addActivity, loadActivities } from '../lib/lifestyleStorage';
import { checkActivityMotionSupport } from '../services/activityMotion';
import type { Activity, ActivityIntensity, ShambaActivityType } from '../types/lifestyle';
import { IconBadge } from './ui/IconBadge';

interface ShambaFitProps {
  userKey: string;
  onChanged?: () => void;
}

const INTENSITIES: { id: ActivityIntensity; label: string }[] = [
  { id: 'light', label: 'Light' },
  { id: 'moderate', label: 'Moderate' },
  { id: 'vigorous', label: 'Vigorous' },
];

export const ShambaFit: React.FC<ShambaFitProps> = ({ userKey, onChanged }) => {
  const [activities, setActivities] = useState<Activity[]>(() => loadActivities(userKey));
  const [activityType, setActivityType] = useState<ShambaActivityType>('walking_market');
  const [duration, setDuration] = useState(20);
  const [intensity, setIntensity] = useState<ActivityIntensity>('moderate');
  const motion = useMemo(() => checkActivityMotionSupport(), []);

  useEffect(() => {
    setActivities(loadActivities(userKey));
  }, [userKey]);

  const today = useMemo(
    () => activities.filter((a) => isSameLocalDay(a.timestamp, localDateKey())),
    [activities]
  );
  const totals = useMemo(
    () => ({
      minutes: today.reduce((s, a) => s + a.durationMinutes, 0),
      points: today.reduce((s, a) => s + a.movementPoints, 0),
      kcal: today.reduce((s, a) => s + a.estimatedCalories, 0),
    }),
    [today]
  );

  const preview = useMemo(
    () => buildActivity({ activityType, durationMinutes: duration, intensity }),
    [activityType, duration, intensity]
  );

  const onLog = () => {
    const entry = buildActivity({ activityType, durationMinutes: duration, intensity, source: 'manual' });
    const next = addActivity(userKey, entry);
    setActivities(next);
    onChanged?.();
  };

  return (
    <div className="space-y-6">
      <header className="glass-panel rounded-2xl p-5 sm:p-6">
        <p className="view-kicker">Move · Shamba Fit</p>
        <h2 className="view-title !text-2xl sm:!text-3xl mt-1">Everyday movement counts.</h2>
        <p className="view-copy mt-2 max-w-2xl">
          Walking to the market, carrying water, stairs, and shamba work all count — not only the gym.
        </p>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <div className="glass-panel rounded-2xl p-4 text-center">
          <p className="text-[10px] uppercase tracking-wide text-slate-400">Active today</p>
          <p className="text-xl font-bold text-white tabular-nums mt-1">{totals.minutes} min</p>
        </div>
        <div className="glass-panel rounded-2xl p-4 text-center">
          <p className="text-[10px] uppercase tracking-wide text-slate-400">Movement Pts</p>
          <p className="text-xl font-bold text-[var(--color-harmony)] tabular-nums mt-1">{totals.points}</p>
        </div>
        <div className="glass-panel rounded-2xl p-4 text-center">
          <p className="text-[10px] uppercase tracking-wide text-slate-400">Est. kcal</p>
          <p className="text-xl font-bold text-amber-300 tabular-nums mt-1">~{totals.kcal}</p>
        </div>
      </div>
      <p className="text-[11px] text-slate-500 -mt-3">Calorie numbers are estimates, not medical measurements.</p>

      <section className="glass-panel rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <IconBadge icon={Plus} variant="teal" size="sm" />
          <h3 className="text-sm font-bold text-white">Log activity</h3>
        </div>

        <label className="block">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Activity</span>
          <select
            className="mt-1.5 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white"
            value={activityType}
            onChange={(e) => setActivityType(e.target.value as ShambaActivityType)}
          >
            {SHAMBA_ACTIVITIES.map((a) => (
              <option key={a.type} value={a.type} className="bg-[#141A26]">
                {a.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Duration (minutes)</span>
          <input
            type="number"
            min={1}
            max={300}
            value={duration}
            onChange={(e) => setDuration(Math.max(1, Number(e.target.value) || 1))}
            className="mt-1.5 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white tabular-nums"
          />
        </label>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Intensity</span>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {INTENSITIES.map((i) => (
              <button
                key={i.id}
                type="button"
                onClick={() => setIntensity(i.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                  intensity === i.id
                    ? 'bg-primary text-[var(--color-primary-foreground)] border-transparent'
                    : 'border-white/10 text-slate-300 hover:border-white/25'
                }`}
              >
                {i.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-1">
          <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {preview.durationMinutes} min</span>
          <span className="inline-flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-[var(--color-harmony)]" /> {preview.movementPoints} pts</span>
          <span className="inline-flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-amber-300" /> ~{preview.estimatedCalories} kcal est.</span>
        </div>

        <button type="button" onClick={onLog} className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary text-[var(--color-primary-foreground)] text-sm font-bold">
          Save activity
        </button>
      </section>

      <p className="text-xs text-slate-500 glass-panel rounded-2xl p-4 leading-relaxed">
        <Footprints className="w-3.5 h-3.5 inline mr-1.5 opacity-70" />
        {motion.message}
      </p>

      <section className="glass-panel rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-3">Today</h3>
        {today.length === 0 ? (
          <p className="text-sm text-slate-400">No activities yet. Log a walk or household chore to get started.</p>
        ) : (
          <ul className="space-y-2">
            {today.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 text-sm border-b border-white/5 pb-2 last:border-0">
                <span className="text-slate-200">{a.label}</span>
                <span className="text-slate-400 tabular-nums shrink-0">{a.durationMinutes} min · {a.movementPoints} pts</span>
              </li>
            ))}
          </ul>
        )}
        {today.length > 0 && (
          <p className="mt-4 text-sm text-slate-300">
            Total active time: <strong className="text-white">{totals.minutes} minutes</strong>
            {' · '}Movement Points: <strong className="text-[var(--color-harmony)]">{totals.points}</strong>
            {' · '}Estimated calories: <strong className="text-amber-300">~{totals.kcal} kcal</strong>
          </p>
        )}
      </section>
    </div>
  );
};
