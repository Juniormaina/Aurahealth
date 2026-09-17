import React, { useEffect, useMemo, useState } from 'react';
import { HeartPulse, Mic } from 'lucide-react';
import {
  calculateRecoveryScore,
  FEELING_OPTIONS,
  isSameLocalDay,
  localDateKey,
} from '../lib/lifestyleCalculations';
import {
  addWellnessCheck,
  buildDailySummary,
  loadWellnessChecks,
} from '../lib/lifestyleStorage';
import type { UkoFeeling, WellnessCheck } from '../types/lifestyle';
import { IconBadge } from './ui/IconBadge';

interface UkoSawaProps {
  userKey: string;
  onChanged?: () => void;
}

function LevelRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block">
      <div className="flex justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
        <span>{label}</span>
        <span className="tabular-nums text-slate-300">{value}/5</span>
      </div>
      <input
        type="range"
        min={1}
        max={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--color-harmony)]"
      />
    </label>
  );
}

export const UkoSawa: React.FC<UkoSawaProps> = ({ userKey, onChanged }) => {
  const [checks, setChecks] = useState<WellnessCheck[]>(() => loadWellnessChecks(userKey));
  const [feeling, setFeeling] = useState<UkoFeeling>('good');
  const [sleepHours, setSleepHours] = useState(7);
  const [energy, setEnergy] = useState(3);
  const [stress, setStress] = useState(3);
  const [soreness, setSoreness] = useState(2);
  const [activityLevel, setActivityLevel] = useState(3);
  const [voiceReady, setVoiceReady] = useState(false);

  useEffect(() => {
    setChecks(loadWellnessChecks(userKey));
  }, [userKey]);

  const todayMinutes = buildDailySummary(userKey).activeMinutes;
  const preview = useMemo(
    () =>
      calculateRecoveryScore(
        {
          feeling,
          sleepHours,
          energyLevel: energy,
          stressLevel: stress,
          soreness,
          activityLevel,
        },
        todayMinutes
      ),
    [feeling, sleepHours, energy, stress, soreness, activityLevel, todayMinutes]
  );

  const todayCheck = checks.find((c) => isSameLocalDay(c.timestamp, localDateKey()));

  const onSave = () => {
    const check: WellnessCheck = {
      id: `uko_${Date.now()}`,
      feeling,
      sleepHours,
      energyLevel: energy,
      stressLevel: stress,
      soreness,
      activityLevel,
      timestamp: new Date().toISOString(),
      voiceNoteLocalId: voiceReady ? `voice_local_${Date.now()}` : undefined,
    };
    const next = addWellnessCheck(userKey, check);
    setChecks(next);
    setVoiceReady(false);
    onChanged?.();
  };

  return (
    <div className="space-y-6">
      <header className="glass-panel rounded-2xl p-5 sm:p-6">
        <p className="view-kicker">Recover · Uko Sawa?</p>
        <h2 className="view-title !text-2xl sm:!text-3xl mt-1">Check in with yourself.</h2>
        <p className="view-copy mt-2 max-w-2xl">
          Uko aje leo? A quick wellness pulse — not a diagnosis. Aura never claims to detect illness from mood or voice.
        </p>
      </header>

      <section className="glass-panel rounded-2xl p-5 space-y-5">
        <div className="flex items-center gap-2">
          <IconBadge icon={HeartPulse} variant="violet" size="sm" />
          <h3 className="text-sm font-bold text-white">Uko aje leo?</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {FEELING_OPTIONS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFeeling(f.id)}
              className={`rounded-xl border px-3 py-3 text-left transition-colors ${
                feeling === f.id
                  ? 'border-[var(--color-harmony)] bg-[var(--color-harmony)]/10'
                  : 'border-white/10 bg-white/[0.03]'
              }`}
            >
              <span className="text-lg">{f.emoji}</span>
              <span className="block text-sm font-semibold text-white mt-1">{f.label}</span>
            </button>
          ))}
        </div>

        <label className="block">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Sleep (hours)</span>
          <input
            type="number"
            min={0}
            max={14}
            step={0.5}
            value={sleepHours}
            onChange={(e) => setSleepHours(Number(e.target.value))}
            className="mt-1.5 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white tabular-nums"
          />
        </label>

        <LevelRow label="Energy" value={energy} onChange={setEnergy} />
        <LevelRow label="Stress" value={stress} onChange={setStress} />
        <LevelRow label="Soreness" value={soreness} onChange={setSoreness} />
        <LevelRow label="Activity level (how active you felt)" value={activityLevel} onChange={setActivityLevel} />

        <button
          type="button"
          onClick={() => setVoiceReady((v) => !v)}
          className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl border ${
            voiceReady ? 'border-[var(--color-harmony)] text-[var(--color-harmony)]' : 'border-white/10 text-slate-400'
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          {voiceReady ? 'Voice note marked (stored locally only)' : 'Optional: mark a voice check-in (future-ready)'}
        </button>
        <p className="text-[11px] text-slate-500 leading-relaxed -mt-2">
          Voice is optional and never used to diagnose sickness. Future research-based analysis would require explicit consent.
        </p>

        <div className="rounded-xl bg-white/[0.04] border border-white/10 p-4">
          <p className="text-[11px] uppercase tracking-wide text-slate-400">Recovery score (estimate)</p>
          <p className="text-3xl font-bold text-white tabular-nums mt-1">{preview.score}<span className="text-lg text-slate-400">/100</span></p>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">{preview.guidance}</p>
        </div>

        <button type="button" onClick={onSave} className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary text-[var(--color-primary-foreground)] text-sm font-bold">
          Save Uko Sawa check-in
        </button>
        {todayCheck && (
          <p className="text-xs text-slate-500">
            Last today: {FEELING_OPTIONS.find((f) => f.id === todayCheck.feeling)?.label} ·{' '}
            {new Date(todayCheck.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </section>
    </div>
  );
};
