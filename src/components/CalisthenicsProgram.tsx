import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dumbbell,
  Play,
  Pause,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Timer,
  Flame,
  BedDouble,
  ArrowDownUp,
  Sparkles,
} from 'lucide-react';
import {
  BLOCK_META,
  CALISTHENICS_TOTAL_DAYS,
  DifficultyTier,
  DayRoutine,
  RoutineExercise,
  getDayRoutine,
  getExerciseById,
  weekPreview,
} from '../content/calisthenicsProgram';

export interface CalisthenicsProgress {
  programDay: number;
  tier: DifficultyTier;
  completedDays: number[];
  lastCompletedAt: string | null;
  rpeByDay: Record<string, number>;
  startedAt: string;
}

interface CalisthenicsProgramProps {
  storageKey: string;
  onWorkoutCompleted?: (programDay: number, activityMinutes: number) => void;
  onShowToast?: (message: string) => void;
}

const defaultProgress = (): CalisthenicsProgress => ({
  programDay: 1,
  tier: 'beginner',
  completedDays: [],
  lastCompletedAt: null,
  rpeByDay: {},
  startedAt: new Date().toISOString(),
});

function loadProgress(key: string): CalisthenicsProgress {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultProgress();
    const parsed = JSON.parse(raw) as CalisthenicsProgress;
    return {
      ...defaultProgress(),
      ...parsed,
      programDay: Math.min(CALISTHENICS_TOTAL_DAYS, Math.max(1, Number(parsed.programDay) || 1)),
      completedDays: Array.isArray(parsed.completedDays)
        ? parsed.completedDays.filter((d) => d >= 1 && d <= CALISTHENICS_TOTAL_DAYS)
        : [],
      rpeByDay: parsed.rpeByDay && typeof parsed.rpeByDay === 'object' ? parsed.rpeByDay : {},
      tier: parsed.tier === 'intermediate' ? 'intermediate' : 'beginner',
    };
  } catch {
    return defaultProgress();
  }
}

function estimateMinutes(routine: DayRoutine): number {
  if (routine.kind === 'rest') return 0;
  const work = routine.exercises.reduce((sum, ex) => sum + ex.targetSets * 0.75, 0);
  const rest = routine.exercises.reduce(
    (sum, ex) => sum + Math.max(0, ex.targetSets - 1) * (routine.recommendedRestSeconds / 60),
    0
  );
  return Math.max(10, Math.round(work + rest + 5));
}

function applySwap(ex: RoutineExercise, direction: 'easier' | 'harder'): RoutineExercise | null {
  const altId = ex.alternativeExerciseId;
  if (!altId) return null;
  const alt = getExerciseById(altId);
  if (!alt) return null;
  const current = getExerciseById(ex.exerciseId);
  if (!current) return null;
  if (direction === 'easier' && current.tier === 'beginner') return null;
  if (direction === 'harder' && current.tier === 'intermediate') return null;
  if (direction === 'easier' && alt.tier !== 'beginner') return null;
  if (direction === 'harder' && alt.tier !== 'intermediate') return null;
  return {
    ...ex,
    exerciseId: alt.exerciseId,
    name: alt.name,
    alternativeExerciseId: alt.alternativeExerciseId,
    formCue: alt.formCue,
    isHold: alt.isHold,
    pattern: alt.pattern,
  };
}

export const CalisthenicsProgram: React.FC<CalisthenicsProgramProps> = ({
  storageKey,
  onWorkoutCompleted,
  onShowToast,
}) => {
  const [progress, setProgress] = useState<CalisthenicsProgress>(() => loadProgress(storageKey));
  const [viewDay, setViewDay] = useState(progress.programDay);
  const [inSession, setInSession] = useState(false);
  const [sessionExercises, setSessionExercises] = useState<RoutineExercise[]>([]);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [setIndex, setSetIndex] = useState(0);
  const [restLeft, setRestLeft] = useState(0);
  const [restRunning, setRestRunning] = useState(false);
  const [rpe, setRpe] = useState(6);
  const [showAudit, setShowAudit] = useState(false);
  const restRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setProgress(loadProgress(storageKey));
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(progress));
  }, [progress, storageKey]);

  useEffect(() => {
    if (!restRunning) return;
    restRef.current = setInterval(() => {
      setRestLeft((s) => {
        if (s <= 1) {
          setRestRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (restRef.current) clearInterval(restRef.current);
    };
  }, [restRunning]);

  const routine = useMemo(() => getDayRoutine(viewDay, progress.tier), [viewDay, progress.tier]);
  const week = useMemo(() => weekPreview(viewDay, progress.tier), [viewDay, progress.tier]);
  const blockMeta = BLOCK_META[routine.block];
  const completedCount = progress.completedDays.length;
  const pct = Math.round((completedCount / CALISTHENICS_TOTAL_DAYS) * 100);
  const isDoneToday = progress.completedDays.includes(viewDay);
  const currentEx = sessionExercises[exerciseIndex];

  const persist = (next: CalisthenicsProgress) => setProgress(next);

  const startSession = () => {
    if (routine.kind === 'rest') {
      completeDay(0);
      return;
    }
    setSessionExercises(routine.exercises.map((e) => ({ ...e })));
    setExerciseIndex(0);
    setSetIndex(0);
    setRestLeft(0);
    setRestRunning(false);
    setRpe(6);
    setInSession(true);
  };

  const startRest = (seconds: number) => {
    setRestLeft(seconds);
    setRestRunning(true);
  };

  const finishSet = () => {
    if (!currentEx) return;
    const isLastSet = setIndex + 1 >= currentEx.targetSets;
    const isLastEx = exerciseIndex + 1 >= sessionExercises.length;
    if (!isLastSet) {
      setSetIndex((s) => s + 1);
      startRest(routine.recommendedRestSeconds);
      return;
    }
    if (!isLastEx) {
      setExerciseIndex((i) => i + 1);
      setSetIndex(0);
      startRest(Math.min(45, routine.recommendedRestSeconds));
      return;
    }
    setInSession(false);
    completeDay(estimateMinutes(routine));
  };

  const completeDay = (minutes: number) => {
    const already = progress.completedDays.includes(viewDay);
    const completedDays = already
      ? progress.completedDays
      : [...progress.completedDays, viewDay].sort((a, b) => a - b);
    const rpeByDay = { ...progress.rpeByDay, [String(viewDay)]: rpe };
    const nextDay = Math.min(CALISTHENICS_TOTAL_DAYS, Math.max(progress.programDay, viewDay + 1));
    const next: CalisthenicsProgress = {
      ...progress,
      programDay: nextDay,
      completedDays,
      lastCompletedAt: new Date().toISOString(),
      rpeByDay,
    };
    persist(next);
    if (!already) {
      onWorkoutCompleted?.(viewDay, minutes);
      onShowToast?.(
        routine.kind === 'rest'
          ? `Rest day logged · Day ${viewDay}/90`
          : `Workout complete · Day ${viewDay}/90 · ~${minutes} min · RPE ${rpe}`
      );
    } else {
      onShowToast?.(`Day ${viewDay} already logged. Keep going!`);
    }
    if (viewDay === 30 || viewDay === 60 || viewDay === 90) {
      setShowAudit(true);
    }
    if (viewDay < CALISTHENICS_TOTAL_DAYS) setViewDay(viewDay + 1);
  };

  const swapCurrent = (direction: 'easier' | 'harder') => {
    if (!currentEx) return;
    const swapped = applySwap(currentEx, direction);
    if (!swapped) {
      onShowToast?.(direction === 'easier' ? 'Already on the easier tier.' : 'Already on the harder tier.');
      return;
    }
    setSessionExercises((list) => list.map((ex, i) => (i === exerciseIndex ? swapped : ex)));
    onShowToast?.(`Switched to ${swapped.name}`);
  };

  const advanceTierFromAudit = (advance: boolean) => {
    if (advance && progress.tier === 'beginner') {
      persist({ ...progress, tier: 'intermediate' });
      onShowToast?.('Tier updated to Intermediate for Block progressions.');
    }
    setShowAudit(false);
  };

  if (inSession && currentEx) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="glass-panel rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <button type="button" className="btn-ghost text-xs" onClick={() => setInSession(false)}>
              <ChevronLeft className="w-3.5 h-3.5" /> Exit
            </button>
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wide">
              Day {routine.programDay} · {routine.routineName}
            </span>
          </div>

          <div>
            <p className="text-[11px] text-muted font-semibold uppercase tracking-wide mb-1">
              Exercise {exerciseIndex + 1}/{sessionExercises.length} · Set {setIndex + 1}/{currentEx.targetSets}
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-display">{currentEx.name}</h2>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">{currentEx.formCue}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
              <span className="px-2.5 py-1 rounded-full bg-white/8 border border-white/10 text-slate-200">
                {currentEx.targetReps} {currentEx.isHold ? 'hold' : 'reps'}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/8 border border-white/10 text-slate-200">
                Tempo {currentEx.tempo}
              </span>
            </div>
          </div>

          {restLeft > 0 ? (
            <div className="rounded-xl border border-[var(--color-harmony)]/40 bg-[var(--color-harmony)]/10 p-4 text-center">
              <div className="inline-flex items-center gap-2 text-[var(--color-harmony)] font-semibold text-sm">
                <Timer className="w-4 h-4" /> Rest
              </div>
              <div className="text-4xl font-bold tabular-nums text-white mt-2">{restLeft}s</div>
              <button
                type="button"
                className="btn-ghost text-xs mt-3"
                onClick={() => {
                  setRestLeft(0);
                  setRestRunning(false);
                }}
              >
                {restRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5" /> Skip rest
                  </>
                ) : (
                  'Continue'
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <button type="button" className="flex-1 btn-ghost text-xs justify-center" onClick={() => swapCurrent('easier')}>
                  <ArrowDownUp className="w-3.5 h-3.5" /> Too Hard
                </button>
                <button type="button" className="flex-1 btn-ghost text-xs justify-center" onClick={() => swapCurrent('harder')}>
                  <ArrowDownUp className="w-3.5 h-3.5" /> Too Easy
                </button>
              </div>
              <button type="button" className="w-full btn-primary justify-center py-3" onClick={finishSet}>
                <CheckCircle2 className="w-4 h-4" />
                Complete set
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="glass-panel rounded-2xl p-5 sm:p-6">
        <p className="view-kicker inline-flex items-center gap-1.5">
          <Dumbbell className="w-3.5 h-3.5" /> 90-Day Calisthenics
        </p>
        <h2 className="view-title !text-2xl mt-1">Bodyweight strength program</h2>
        <p className="view-copy mt-2">
          Three 30-day blocks · 4 training days, 1 mobility day, 2 rest days each week. Track RPE and swap tiers mid-session.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[10rem]">
            <div className="flex justify-between text-[11px] text-muted mb-1">
              <span>{completedCount} / 90 days</span>
              <span>{pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-[var(--color-harmony)]" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <label className="text-xs text-slate-300 flex items-center gap-2">
            Tier
            <select
              className="aura-input text-xs py-1.5"
              value={progress.tier}
              onChange={(e) => persist({ ...progress, tier: e.target.value as DifficultyTier })}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
            </select>
          </label>
        </div>
      </header>

      <section className="glass-panel rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold text-muted uppercase tracking-wide">
              Block {routine.block} · {blockMeta.title}
            </p>
            <h3 className="text-lg font-bold text-white mt-1">{routine.routineName}</h3>
            <p className="text-xs text-slate-400 mt-1">{routine.focus}</p>
            <p className="text-[11px] text-slate-500 mt-1">Tracking: {routine.trackingFocus}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="btn-ghost p-2"
              aria-label="Previous day"
              disabled={viewDay <= 1}
              onClick={() => setViewDay((d) => Math.max(1, d - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold tabular-nums text-white px-2">Day {viewDay}</span>
            <button
              type="button"
              className="btn-ghost p-2"
              aria-label="Next day"
              disabled={viewDay >= CALISTHENICS_TOTAL_DAYS}
              onClick={() => setViewDay((d) => Math.min(CALISTHENICS_TOTAL_DAYS, d + 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {week.map((d) => {
            const done = progress.completedDays.includes(d.programDay);
            const active = d.programDay === viewDay;
            return (
              <button
                key={d.programDay}
                type="button"
                onClick={() => setViewDay(d.programDay)}
                className={`rounded-lg py-2 text-center text-[10px] font-semibold border transition-colors ${
                  active
                    ? 'border-[var(--color-harmony)] bg-[var(--color-harmony)]/20 text-white'
                    : done
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                      : 'border-white/10 bg-white/5 text-slate-400'
                }`}
              >
                <div>D{d.programDay}</div>
                <div className="opacity-80 mt-0.5">
                  {d.kind === 'rest' ? 'Rest' : d.kind === 'flexibility' ? 'Mob' : d.kind === 'pull' ? 'Pull' : d.kind === 'push' ? 'Push' : d.kind === 'legs_core' ? 'Legs' : d.kind === 'upper_power' ? 'Power' : 'Core'}
                </div>
              </button>
            );
          })}
        </div>

        {routine.kind === 'rest' ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-start gap-3">
            <BedDouble className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-white font-semibold">Passive rest day</p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                No structured sets. Walk, hydrate, and sleep. Logging this day still advances your 90-day streak.
              </p>
            </div>
          </div>
        ) : (
          <ul className="space-y-2">
            {routine.exercises.map((ex) => (
              <li
                key={ex.exerciseId}
                className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{ex.name}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {ex.targetSets} sets · {ex.targetReps} · tempo {ex.tempo}
                  </p>
                </div>
                <span className="text-[10px] uppercase tracking-wide text-slate-500 shrink-0">
                  Rest {routine.recommendedRestSeconds}s
                </span>
              </li>
            ))}
          </ul>
        )}

        {!isDoneToday && routine.kind !== 'rest' && (
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <label className="text-xs text-slate-300 flex items-center gap-2">
              Session RPE
              <input
                type="range"
                min={1}
                max={10}
                value={rpe}
                onChange={(e) => setRpe(Number(e.target.value))}
                className="w-28"
              />
              <span className="tabular-nums font-bold text-white">{rpe}</span>
            </label>
            <span className="text-[11px] text-slate-500 inline-flex items-center gap-1">
              <Flame className="w-3 h-3" /> ~{estimateMinutes(routine)} min
            </span>
          </div>
        )}

        <button
          type="button"
          className="w-full sm:w-auto btn-primary justify-center"
          onClick={startSession}
          disabled={isDoneToday}
        >
          {isDoneToday ? (
            <>
              <CheckCircle2 className="w-4 h-4" /> Day logged
            </>
          ) : routine.kind === 'rest' ? (
            <>
              <CheckCircle2 className="w-4 h-4" /> Log rest day
            </>
          ) : (
            <>
              <Play className="w-4 h-4" /> Start workout
            </>
          )}
        </button>
      </section>

      <section className="grid sm:grid-cols-3 gap-3">
        {([1, 2, 3] as const).map((b) => {
          const meta = BLOCK_META[b];
          const active = routine.block === b;
          return (
            <div
              key={b}
              className={`rounded-2xl border p-4 ${
                active ? 'border-[var(--color-harmony)]/50 bg-[var(--color-harmony)]/10' : 'border-white/10 bg-white/5'
              }`}
            >
              <p className="text-[11px] font-semibold text-muted uppercase tracking-wide">Block {b} · {meta.days}</p>
              <p className="text-sm font-bold text-white mt-1">{meta.title}</p>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{meta.focus}</p>
            </div>
          );
        })}
      </section>

      {showAudit && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4">
          <div className="glass-panel rounded-2xl p-5 sm:p-6 max-w-md w-full space-y-4">
            <div className="flex items-center gap-2 text-white font-bold">
              <Sparkles className="w-4 h-4 text-[var(--color-harmony)]" />
              30-day performance audit
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Milestone hit for Day {viewDay}. If beginner work feels easy (RPE often under 6), step up to Intermediate
              progressions for the next block.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button type="button" className="btn-primary flex-1 justify-center" onClick={() => advanceTierFromAudit(true)}>
                Advance to Intermediate
              </button>
              <button type="button" className="btn-ghost flex-1 justify-center" onClick={() => advanceTierFromAudit(false)}>
                Keep current tier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
